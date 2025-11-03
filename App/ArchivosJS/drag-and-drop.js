/*
  Draftosaurus - arrastrar y soltar (versión didáctica)

  Este archivo implementa la lógica del juego en el cliente (JavaScript).
  El objetivo de estos comentarios es ayudar a programadores principiantes
  a entender cómo funciona cada parte. Lee los bloques y ejemplos para
  comprender el flujo de datos.

  Contrato / forma de trabajo (resumen):
  - Entrada: interacciones del usuario (dragstart, drop, dblclick).
  - Estado local: variables en memoria (movesRemaining, gameActive) y
    registro de movimientos en localStorage bajo la clave 'draftosaurus_moves'.
  - Salida: actualizaciones del DOM (añadir/quitar dinosaurios, badges,
    puntajes) y llamada final al servidor (POST a Api/saveGame.php).

  Formato del registro de movimientos (localStorage 'draftosaurus_moves'):
    [ { action: 'add'|'remove', dino: string|null, zone: string|null,
        timestamp: ISOString, movesRemaining: number }, ... ]

  Puntos clave que el código respeta:
  - Los elementos originales en la paleta tienen el atributo
    data-original=true. Cuando se colocan en una zona se crea un clone
    marcado con data-placed=true; así la paleta conserva los originales.
  - Al arrastrar se usan valores en dataTransfer: 'text/plain' almacena el
    id del elemento y 'text/origin' indica si viene de 'palette' (original)
    o 'placed' (ya estaba en una zona). Esto nos permite distinguir casos.
  - Reglas por zona (zoneRules): cada zona puede limitar tipos aceptados
    y tener una capacidad máxima (max). La zona 'semejanza' tiene una tabla
    de puntuación especial que depende de la cantidad de dinosaurios.

  Consideraciones para principiantes:
  - Evitamos mover elementos entre zonas: si se necesita quitar un dino,
    el usuario debe arrastrarlo de vuelta a la paleta o hacer doble clic.
  - Todas las operaciones que cambian el estado llaman a updateScores()
    para recalcular las puntuaciones y actualizar los badges.

*/

// ---------------------------
// Ayudantes de navegación (pequeñas utilidades para cambiar de página)
// ---------------------------
// Nota para principiantes: estos listeners simplemente cambian la URL
// del navegador. Son independientes de la lógica del juego; se colocan
// aquí para que la página tenga botones de navegación.
const boton3 = document.getElementById("boton3");
const botonAtras = document.getElementById("botonAtras");
if (boton3)
  boton3.addEventListener("click", () => {
    window.location.href = "cuarta.html";
  });
if (botonAtras)
  botonAtras.addEventListener("click", () => {
    window.location.href = "index.html";
  });

// ---------------------------
// Referencias DOM y reglas de zona
// ---------------------------
// Explicación rápida:
// - `palette` apunta al contenedor que tiene los dinosaurios originales.
// - `zones` es una lista de elementos con la clase .zone donde se pueden
//    colocar clones de dinosaurios.
// - `zoneRules` define, por zona, qué tipos aceptar y cuántos máximos.
//    Si una zona tiene `scoringTable`, se usa esa tabla para calcular
//    la puntuación (ej. 'semejanza').
const palette =
  document.getElementById("dinosaurios") ||
  document.getElementById("dino-palette");
const zones = document.querySelectorAll(".zone");

// Cada zona puede definir reglas de aceptación y/o una tabla de puntuación.
// Si no hay scoringTable, cada dinosaurio vale 1 punto.
const zoneRules = {
  semejanza: {
    accepts: "same",
    max: 6,
    scoringTable: { 0: 0, 1: 2, 2: 4, 3: 8, 4: 12, 5: 18, 6: 24 },
  },
  diferencia: { accepts: "any", max: 12 },
  amor: { accepts: "any", max: 12 },
  trio: { accepts: "any", max: 12 },
  rey: { accepts: "any", max: 12 },
  isla: { accepts: "any", max: 12 },
  rio: { accepts: "any", max: 12 },
};

// Al cargar la página / comenzar partida: limpiar cualquier registro previo
// en localStorage para evitar que partidas antiguas se conserven.
try {
  localStorage.removeItem("draftosaurus_moves");
} catch (e) {}

// ---------------------------
// showMessage: toasts / alternativa ligera
// ---------------------------
// Esta función muestra mensajes al usuario. Primero intenta usar los
// Bootstrap Toasts (si la página incluye Bootstrap). Si no está disponible,
// usa una alternativa muy simple construyendo un div temporal.
// Parámetros:
// - text: texto a mostrar
// - type: 'info'|'warn'|'error' (define estilo aproximado)
// - timeout: milisegundos antes de ocultar (por defecto 3000)
// Uso: showMessage('Texto', 'info', 2000)
function showMessage(text, type = "info", timeout = 3000) {
  const container = document.getElementById("messages");
  if (!container) return alert(text);

  // Preferir Bootstrap Toasts cuando estén disponibles
  if (window.bootstrap && typeof window.bootstrap.Toast === "function") {
    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center text-bg-${
      type === "warn" ? "warning" : type === "error" ? "danger" : "dark"
    } border-0`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    const toastBody = document.createElement("div");
    toastBody.className = "d-flex";
    const bodyContent = document.createElement("div");
    bodyContent.className = "toast-body";
    bodyContent.textContent = text;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-close btn-close-white me-2 m-auto";
    btn.setAttribute("data-bs-dismiss", "toast");
    btn.setAttribute("aria-label", "Close");

    toastBody.appendChild(bodyContent);
    toastBody.appendChild(btn);
    toastEl.appendChild(toastBody);
    container.appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: timeout,
    });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", () => {
      try {
        container.removeChild(toastEl);
      } catch (e) {}
    });
    return;
  }

  // Alternativa ligera cuando no hay Bootstrap
  const div = document.createElement("div");
  div.className = "msg " + (type || "info");
  div.textContent = text;
  container.appendChild(div);
  void div.offsetWidth; // force reflow
  div.classList.add("show");
  setTimeout(() => {
    div.classList.remove("show");
    setTimeout(() => {
      try {
        container.removeChild(div);
      } catch (e) {}
    }, 220);
  }, timeout);
}

// ---------------------------
// Estado del juego: movimientos y fin de partida
// ---------------------------
let movesRemaining = 12;
let gameActive = true;
const botonEnviar = document.getElementById("botonEnviar");
if (botonEnviar) botonEnviar.style.display = "none";

function updateMovesDisplay() {
  // Paso 1: localizar el elemento donde mostramos los movimientos
  const span = document.getElementById("moves-remaining");
  // Paso 2: si existe el span, escribir el valor (protegiendo de negativos)
  if (span) span.textContent = Math.max(0, movesRemaining);
}
// Actualiza la visualización de movimientos restantes.
// decrementMoves / incrementMoves
// - decrementMoves: resta movimientos y, si llega a cero, termina la partida.
// - incrementMoves: suma movimientos (se usa al quitar un dinosaurio).
// Nota para principiantes: no permitimos modificar movesRemaining si
// gameActive es false. Esto evita que, después de terminar, el usuario
// pueda seguir manipulando el contador.
function decrementMoves(n = 1) {
  // Paso 1: no hacer nada si la partida ya terminó
  if (!gameActive) return;
  // Paso 2: reducir el contador en 'n'
  movesRemaining -= n;
  // Paso 3: si llega a 0 o menos, forzamos 0, actualizamos la UI y
  // terminamos la partida llamando a endGame()
  if (movesRemaining <= 0) {
    movesRemaining = 0;
    updateMovesDisplay();
    endGame();
    return;
  }
  // Paso 4: actualizar la UI con el nuevo valor
  updateMovesDisplay();
}
function incrementMoves(n = 1) {
  // Paso 1: no permitir aumentar movimientos si la partida terminó
  if (!gameActive) return;
  // Paso 2: aumentar el contador y actualizar la UI
  movesRemaining += n;
  updateMovesDisplay();
}
updateMovesDisplay();

// ---------------------------
// Helpers para localStorage (registro de movimientos)
// ---------------------------
function getMovesLog() {
  // Paso 1: intentar leer la clave desde localStorage
  try {
    const raw = localStorage.getItem("draftosaurus_moves");
    // Paso 2: si existe, parsear JSON y devolverlo; si no, devolver array vacío
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    // Paso 3: si ocurre cualquier error (p. ej. JSON inválido), devolver array vacío
    return [];
  }
}
function saveMovesLog(log) {
  // Paso 1: serializar el array y guardarlo en localStorage
  try {
    localStorage.setItem("draftosaurus_moves", JSON.stringify(log));
  } catch (e) {
    // Paso 2: si falla el guardado (modo incógnito o límite del storage),
    // no hacemos nada para evitar romper la ejecución.
  }
}
function recordMove(action, dinoType, zoneName) {
  // Paso 1: recuperar el log actual
  const log = getMovesLog();
  // Paso 2: construir la entrada nueva con los campos requeridos
  const entry = {
    action,
    dino: dinoType || null,
    zone: zoneName || null,
    timestamp: new Date().toISOString(),
    movesRemaining,
  };
  // Paso 3: añadir al final del array y persistir
  log.push(entry);
  saveMovesLog(log);
}

function endGame() {
  gameActive = false;
  showMessage(
    "La partida ha finalizado. No se permiten más movimientos.",
    "info",
    5000
  );
  if (botonEnviar) botonEnviar.style.display = "inline-block";
}

// ---------------------------
// Elementos arrastrables: habilitar arrastre y eliminación
// ---------------------------
// makeDraggable(dino): prepara un elemento para ser arrastrado.
// - Añade el atributo draggable y listeners para dragstart/dragend.
// - En dragstart guardamos en dataTransfer:
//    'text/plain' => id del elemento
//    'text/origin' => 'palette' si viene de la paleta o 'placed' si ya estaba en una zona
//   Esto permite distinguir en el handler de drop si debemos clonar
//   (cuando viene de la paleta) o impedir el movimiento (cuando viene de una zona).
// - También se añade un listener para dblclick que permite quitar
//   un dinosaurio ya colocado (devuelve un movimiento y actualiza puntuaciones).
// Nota: makeDraggable se llama tanto para los originales de la paleta
// como para los clones que se generan al colocarlos en una zona.
function makeDraggable(dino) {
  if (!dino) return;
  if (!dino.id) dino.id = "dino-" + Math.random().toString(36).slice(2, 9);
  dino.setAttribute("draggable", true);

  dino.addEventListener("dragstart", (e) => {
    // Paso 1: si la partida no está activa, prevenir el arrastre
    if (!gameActive) {
      e.preventDefault();
      showMessage("La partida ha finalizado.");
      return;
    }
    // Paso 2: detectar si el elemento es un original de la paleta
    const isOriginal = dino.hasAttribute("data-original");
    // Paso 3: almacenar en dataTransfer información mínima para el drop
    // - 'text/plain' contendrá el id del elemento para localizarlo después
    // - 'text/origin' indica si viene de la paleta ('palette') o de una zona ('placed')
    e.dataTransfer.setData("text/plain", dino.id);
    e.dataTransfer.setData("text/origin", isOriginal ? "palette" : "placed");
    // Paso 4: marcar el elemento como 'arrastrando' para poder aplicar estilos CSS
    dino.classList.add("dragging");
  });

  dino.addEventListener("dragend", () => dino.classList.remove("dragging"));

  // doble clic: elimina dinosaurios colocados y devuelve un movimiento
  dino.addEventListener("dblclick", () => {
    // Paso 1: prevenir acción si la partida terminó
    if (!gameActive) {
      showMessage(
        "La partida ha finalizado. No puede quitar dinosaurios.",
        "info"
      );
      return;
    }
    // Paso 2: solo permitimos eliminar elementos que estén marcados como colocados
    if (dino.hasAttribute("data-placed")) {
      // Paso 3: obtener tipo y zona para el registro
      const type = dino.getAttribute("data-dino");
      const parentZone = dino.closest(".zone");
      const zoneName = parentZone ? parentZone.getAttribute("data-zone") : null;
      // Paso 4: quitar del DOM
      dino.remove();
      // Paso 5: devolver un movimiento y recalcular puntuaciones
      incrementMoves(1);
      updateScores();
      // Paso 6: registrar el evento en el log (localStorage)
      try {
        recordMove("remove", type, zoneName);
      } catch (e) {}
    }
  });
}

// ---------------------------
// Inicializar originales de la paleta y dinosaurios ya colocados
// ---------------------------
if (palette) {
  const originals = palette.querySelectorAll(".dino");
  originals.forEach((el) => {
    el.setAttribute("data-original", "true");
    makeDraggable(el);
  });
}
document.querySelectorAll(".zone [data-dino]").forEach((el) => {
  el.removeAttribute("data-original");
  el.setAttribute("data-placed", "true");
  makeDraggable(el);
});

// ---------------------------
// Manejadores de drop en las zonas
// ---------------------------
// Explicación del flujo en una zona al recibir un 'drop':
// 1) Leemos el id del elemento y su 'origin' desde dataTransfer.
// 2) Si viene de la paleta ('palette') clonamos el elemento, lo
//    marcamos con data-placed=true y lo añadimos a la zona (siempre
//    que cumpla las reglas de la zona y haya capacidad).
// 3) Si viene de un elemento ya colocado ('placed') no se permite
//    moverlo entre zonas: esta versión obliga a devolverlo a la paleta
//    o quitarlo con doble clic. Esto simplifica el estado y evita
//    comportamientos complejos de reubicación.
// 4) Después de cualquier cambio relevante llamamos a updateScores()
//    y recordMove(...) para persistir el evento en localStorage.
zones.forEach((zone) => {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    // Paso 1: leer id del elemento arrastrado desde dataTransfer
    const id = e.dataTransfer.getData("text/plain");
    // Paso 2: leer el origen (palette o placed)
    const origin = e.dataTransfer.getData("text/origin");
    // Paso 3: localizar el elemento en el DOM usando su id
    const dragged = document.getElementById(id);
    // Paso 4: obtener el nombre de la zona y sus reglas de aceptación
    const zoneName = zone.getAttribute("data-zone");
    const rules = zoneRules[zoneName] || { accepts: "any", max: 12 };

    // Paso 5: comprobación de capacidad
    // Contamos cuántos dinosaurios hay actualmente en la zona
    const currentCount = zone.querySelectorAll("[data-dino]").length;
    if (typeof rules.max === "number" && currentCount >= rules.max) {
      showMessage(
        `La zona ${zoneName} ha alcanzado el máximo de ${rules.max} dinosaurios.`,
        "warn"
      );
      return;
    }

    // desde la paleta => clonar + validar
    // Si el origen fue 'palette' clonamos el elemento original para
    // añadir una copia a la zona (la paleta conserva sus originales).
    if (origin === "palette") {
      if (!dragged || !gameActive) {
        if (!gameActive) showMessage("La partida ha finalizado.");
        return;
      }
      // Paso B: obtener el tipo del dinosaurio (atributo data-dino)
      const incomingType = dragged.getAttribute("data-dino");
      if (rules.accepts === "same") {
        // Paso C: obtener los tipos ya presentes en la zona
        const existing = Array.from(zone.querySelectorAll("[data-dino]")).map(
          (d) => d.getAttribute("data-dino")
        );
        // Paso D: deduplicar y comprobar si coinciden con incomingType
        const distinct = Array.from(new Set(existing));
        if (distinct.length > 0 && distinct[0] !== incomingType) {
          showMessage(
            `La zona ${zoneName} solo permite dinosaurios de la misma especie (ya contiene ${distinct[0]}).`,
            "warn"
          );
          return;
        }
      } else if (
        Array.isArray(rules.accepts) &&
        !rules.accepts.includes(incomingType)
      ) {
        // Paso E: si rules.accepts es un array, validar que el tipo esté permitido
        showMessage(
          `La zona ${zoneName} no acepta dinosaurios del tipo ${incomingType}.`,
          "warn"
        );
        return;
      }

      // Paso E: clonar el elemento de la paleta para añadirlo a la zona
      const cloned = dragged.cloneNode(true);
      cloned.id = "placed-" + Math.random().toString(36).slice(2, 9);
      cloned.removeAttribute("data-original");
      cloned.setAttribute("data-placed", "true");
      // Paso F: preparar el clon para que sea arrastrable como los originales
      makeDraggable(cloned);
      // Paso G: añadir el clon al DOM (zona) y consumir un movimiento
      zone.appendChild(cloned);
      decrementMoves(1);
      try {
        recordMove("add", incomingType, zoneName);
      } catch (e) {}
      updateScores();
      return;
    }

    // no permitir mover dinosaurios ya colocados entre zonas
    if (origin === "placed") {
      showMessage(
        "No se permite mover dinosaurios entre zonas. Para quitar dinos haz doble clic o devuélvelos a la paleta.",
        "info"
      );
      return;
    }
  });
});

// ---------------------------
// Drop en la paleta: quitar dinosaurio colocado y devolver movimiento
// ---------------------------
if (palette) {
  palette.addEventListener("dragover", (e) => {
    e.preventDefault();
    palette.classList.add("drag-over");
  });
  palette.addEventListener("dragleave", () =>
    palette.classList.remove("drag-over")
  );
  palette.addEventListener("drop", (e) => {
    e.preventDefault();
    palette.classList.remove("drag-over");
    // Paso 1: leer id y origen del elemento arrastrado
    const id = e.dataTransfer.getData("text/plain");
    const origin = e.dataTransfer.getData("text/origin");
    // Paso 2: localizar el elemento en el DOM
    const dragged = document.getElementById(id);
    if (!gameActive) {
      showMessage(
        "La partida ha finalizado. No puede quitar dinosaurios.",
        "info"
      );
      return;
    }
    if (origin === "placed" && dragged) {
      // Paso 3: obtener información útil para el registro antes de borrar
      const type = dragged.getAttribute("data-dino");
      const parentZone = dragged.closest(".zone");
      const zoneName = parentZone ? parentZone.getAttribute("data-zone") : null;
      // Paso 4: quitar del DOM
      dragged.remove();
      // Paso 5: devolver movimiento y recalcular puntuaciones
      incrementMoves(1);
      updateScores();
      // Paso 6: registrar la eliminación en el log
      try {
        recordMove("remove", type, zoneName);
      } catch (e) {}
    }
  });
}

// ---------------------------
// Puntuación y contadores
// ---------------------------
// updateScores(): recorre cada zona, cuenta los dinosaurios y calcula
// la puntuación de la zona. Comportamiento:
// - Si la zona define `scoringTable`, usamos esa tabla (por ejemplo
//   para 'semejanza' donde la puntuación depende de la cantidad).
// - Si no hay tabla, cada dinosaurio vale 1 punto.
// - Actualiza el span con id 'score-<zona>' y el total en 'score-total'.
// - Llama a updateZoneCounts() para refrescar los badges (count/max).
// Casos límite a tener en cuenta:
// - Si un usuario intenta colocar más dinosaurios que el máximo, el
//   drop es rechazado antes de llegar aquí (mensaje y return).
// - Las tablas de puntuación deben incluir la clave 0 si se desea
//   mostrar 0 cuando la zona está vacía.
function updateScores() {
  // Paso 1: inicializar acumulador de puntuación total
  let total = 0;
  // Paso 2: para cada zona calcular la puntuación local
  zones.forEach((zone) => {
    // 2.1: obtener nombre y reglas de la zona
    const zoneName = zone.getAttribute("data-zone");
    const rules = zoneRules[zoneName] || {};
    // 2.2: listar los dinosaurios presentes y obtener su cantidad
    const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
    const count = dinos.length;
    // 2.3: calcular la puntuación de la zona
    //      si hay scoringTable usarla, si no, 1 punto por dino
    const zoneScore = rules.scoringTable
      ? rules.scoringTable[count] || 0
      : count; // 1 punto por dino si no hay tabla
    // 2.4: actualizar el span correspondiente a la zona
    const span = document.getElementById("score-" + zoneName);
    if (span) span.textContent = zoneScore;
    // 2.5: acumular en el total
    total += zoneScore;
  });
  // Paso 3: actualizar el total en la UI
  const totalSpan = document.getElementById("score-total");
  if (totalSpan) totalSpan.textContent = Math.round(total);
  // Paso 4: actualizar badges con cantidad/max por zona
  updateZoneCounts();
}

updateScores();

function handleZoneChange(zoneName) {
  console.log("Zona actualizada: " + zoneName);
}

function updateZoneCounts() {
  // Paso 1: recorrer cada zona para actualizar su badge (cantidad / max)
  zones.forEach((zone) => {
    // 1.1: obtener nombre, reglas y máximo permitido
    const zoneName = zone.getAttribute("data-zone");
    const rules = zoneRules[zoneName] || {};
    const max = typeof rules.max === "number" ? rules.max : 12;
    // 1.2: contar los dinosaurios actuales
    const count = zone.querySelectorAll("[data-dino]").length;
    // 1.3: asegurarnos de que exista un elemento label visible
    let label = zone.querySelector(".zone-label");
    if (!label) {
      label = document.createElement("span");
      label.className = "zone-label";
      label.textContent = zoneName;
      zone.insertBefore(label, zone.firstChild);
    }
    // 1.4: crear/actualizar el badge que muestra count/max
    const id = "count-" + zoneName;
    let badge = document.getElementById(id);
    if (!badge) {
      badge = document.createElement("span");
      badge.id = id;
      badge.className = "zone-count";
      badge.setAttribute(
        "style",
        "margin-left:8px;background:rgba(255,255,255,0.95);padding:2px 6px;border-radius:8px;font-size:0.85rem;font-weight:600;"
      );
      label.appendChild(badge);
    }
    // 1.5: escribir el texto del badge
    badge.textContent = count + "/" + max;
  });
}

// ---------------------------
// Enviar datos de la partida al servidor
// ---------------------------
// sendGameData(): construye un payload y hace POST a Api/saveGame.php.
// - payload: { totalScore: number, winner: string, movesLog: Array }
// - winner se intenta obtener desde localStorage key 'usuario' (recomendado)
// - movesLog es el arreglo obtenido por getMovesLog()
// Recomendación para el servidor: validar que 'winner' exista y validar
// la estructura del movesLog antes de insertar en la base de datos.
async function sendGameData() {
  // Paso 1: protección básica
  if (!botonEnviar) return;
  botonEnviar.disabled = true;
  // Paso 2: informar al usuario que se está enviando
  showMessage("Enviando datos de la partida...", "info");
  // Paso 3: construir payload (no enviamos el log al servidor por diseño)
  const totalSpan = document.getElementById("score-total");
  const totalScore = totalSpan ? parseInt(totalSpan.textContent || "0", 10) : 0;
  // obtener usuario conectado (intentar desde localStorage primero)
  function getLoggedUsername() {
    try {
      const v = localStorage.getItem("usuario");
      if (v) return v;
      const el =
        document.getElementById("username") ||
        document.querySelector(".username");
      if (el) return el.textContent.trim();
    } catch (e) {}
    return "";
  }
  const payload = { totalScore, winner: getLoggedUsername() };
  // Paso 4: POST al servidor y manejo de respuesta
  try {
    const resp = await fetch("../../Api/saveGame.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    // Paso 5: manejar success / error devuelto por el servidor
    if (data && data.success) {
      showMessage(
        "Partida guardada correctamente (ID: " + (data.partidaId || "-") + ")",
        "info",
        6000
      );
      try {
        localStorage.removeItem("draftosaurus_moves");
      } catch (e) {}
      botonEnviar.disabled = true;
    } else {
      showMessage(
        "Error guardando la partida: " + (data.message || "sin detalle"),
        "error",
        8000
      );
      botonEnviar.disabled = false;
    }
  } catch (e) {
    // Paso 6: problemas de red
    showMessage("Error de red al guardar la partida.", "error", 8000);
    botonEnviar.disabled = false;
  }
}

if (botonEnviar)
  botonEnviar.addEventListener("click", (e) => {
    e.preventDefault();
    sendGameData();
  });
