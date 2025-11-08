/* - Contiene la lógica de arrastre/soltar, el contador de movimientos y
     la inicialización de elementos arrastrables.
   - La lógica de recintos (reglas, puntuación y sanitización) está en
     `recintos.js` y las funciones de guardado/registro están en
     `save-game.js`.
*/

const boton3 = document.getElementById("boton3");
const botonAtras = document.getElementById("botonAtras");
// Referencia al botón "Siguiente" que se mostrará tras guardar la partida
const botonSiguiente = document.getElementById("botonSiguiente");
if (boton3)
  boton3.addEventListener("click", () => {
    window.location.href = "cuarta.html";
  });
if (botonAtras)
  botonAtras.addEventListener("click", () => {
    window.location.href = "index.html";
  });

// ---------------------------
// Referencias DOM
// ---------------------------
// `palette` apunta al contenedor que tiene los dinosaurios originales.
const palette = document.getElementById("dino-palette");
const zones = document.querySelectorAll(".zone");

// Nota: las reglas de zona, scoring y sanitización están en `recintos.js`.
// Asegúrate de cargar `recintos.js` antes que este script en el HTML.

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
  //se busca la id messages en tercera, se guarda en constante container
  const container = document.getElementById("messages");
  if (!container) return alert(text);

  // Preferir Bootstrap Toasts cuando estén disponibles
  //pregunta si existe bootstrap y si existe le preguntas si la toast es una funcion
  if (window.bootstrap && typeof window.bootstrap.Toast === "function") {
    //definimos la constante toastEl creando un div y empezamos a darle estilos
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
    //se agrega el toastEl al container de mas arriba para que se pueda mostrar la toast en ese lugar
    container.appendChild(toastEl);

    //se crea la toast con las opciones de autohide y delay
    const toast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: timeout,
    });
    //se hace visible la toast
    toast.show();
    //se elimina la toast del container cuando se oculta
    toastEl.addEventListener("hidden.bs.toast", () => {
      try {
        container.removeChild(toastEl);
      } catch (e) {}
    });
    return;
  }
}

// ---------------------------
// Estado del juego: movimientos y fin de partida
// ---------------------------
window.movesRemaining = 12;
let gameActive = true;
const botonEnviar = document.getElementById("botonEnviar");
//si existe el botonEnviar se oculta
  // Ocultar inicialmente el botón Enviar y el botón Siguiente hasta que corresponda
  if (botonEnviar) botonEnviar.style.display = "none"; // se muestra al terminar la partida
  if (botonSiguiente) botonSiguiente.style.display = "none"; // se mostrará tras guardar la partida

function updateMovesDisplay() {
  // Paso 1: localizar el elemento donde mostramos los movimientos
  const span = document.getElementById("moves-remaining");
  // Paso 2: si existe el span, escribir el valor (protegiendo de negativos)
  //math.max le das una serie de numero y te da el mas grande, en este caso le das 0 y movesRemaining (12)
  if (span) span.textContent = Math.max(0, window.movesRemaining);
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
  // aca es lo mismo que poner el valor de window.movesRemaining = window.movesRemaining - n(1 en este caso)
  window.movesRemaining -= n;
  // Paso 3: si llega a 0 o menos, forzamos 0, actualizamos la UI y
  // terminamos la partida llamando a endGame()
  if (window.movesRemaining <= 0) {
    window.movesRemaining = 0;
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
  window.movesRemaining += n;
  updateMovesDisplay();
}
updateMovesDisplay();

// ---------------------------
// Helpers para localStorage (registro de movimientos)
// ---------------------------
// recordMove / localStorage helpers moved to save-game.js (SaveGame.recordMove)

function endGame() {
  gameActive = false;
  showMessage(
    "La partida ha finalizado. No se permiten más movimientos.",
    "info",
    5000,
  );
  
  // if (botonSiguiente) botonSiguiente.style.display = "block";
  // Mostrar el botón Enviar para que el usuario pueda guardar la partida
  if (botonEnviar) botonEnviar.style.display = "inline-block";
  // Asegurarnos de que el botón Siguiente permanezca oculto al terminar la partida
  // (se hará visible solo después de un guardado exitoso)
  if (botonSiguiente) botonSiguiente.style.display = "none";
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
    e.dataTransfer.setData("text/plain", dino.id);
    e.dataTransfer.setData("text/origin", isOriginal ? "palette" : "placed");
    // Paso 4: marcar el elemento como 'arrastrando' para poder aplicar estilos CSS
    dino.classList.add("dragging");
  });

  dino.addEventListener("dragend", () => dino.classList.remove("dragging"));

  // doble clic: elimina dinosaurios colocados y devuelve un movimiento
  dino.addEventListener("dblclick", () => {
    if (!gameActive) {
      showMessage(
        "La partida ha finalizado. No puede quitar dinosaurios.",
        "info"
      );
      return;
    }
    if (dino.hasAttribute("data-placed")) {
      const type = dino.getAttribute("data-dino");
      const parentZone = dino.closest(".zone");
      const zoneName = parentZone ? parentZone.getAttribute("data-zone") : null;
      dino.remove();
      incrementMoves(1);
      try {
        if (
          window.SaveGame &&
          typeof window.SaveGame.recordMove === "function"
        ) {
          window.SaveGame.recordMove("remove", type, zoneName);
        }
      } catch (e) {}
      try {
        showMessage(
          `Dino ${type} removido de ${parentZone.getAttribute("data-zone")}`,
          "info",
          1200
        );
      } catch (e) {}
      if (window.Recintos && typeof window.Recintos.updateScores === "function")
        window.Recintos.updateScores();
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

// Ejecutar sanitizaciones centralizadas (recintos.js)
try {
  if (window.Recintos && typeof window.Recintos.sanitizeAll === "function") {
    window.Recintos.sanitizeAll();
  }
} catch (e) {}

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
    const id = e.dataTransfer.getData("text/plain");
    const origin = e.dataTransfer.getData("text/origin");
    const dragged = document.getElementById(id);
    const zoneName = zone.getAttribute("data-zone");
    const rules =
      window.Recintos && typeof window.Recintos.getRules === "function"
        ? window.Recintos.getRules(zoneName)
        : { accepts: "any", max: 12 };

    // comprobación de capacidad
    const currentCount = zone.querySelectorAll("[data-dino]").length;
    if (typeof rules.max === "number" && currentCount >= rules.max) {
      showMessage(
        `La zona ${zoneName} ha alcanzado el máximo de ${rules.max} dinosaurios.`,
        "warn"
      );
      return;
    }

    // desde la paleta => clonar + validar
    if (origin === "palette") {
      if (!dragged || !gameActive) {
        if (!gameActive) showMessage("La partida ha finalizado.");
        return;
      }
      const incomingType = dragged.getAttribute("data-dino");
      if (window.Recintos && typeof window.Recintos.canAccept === "function") {
        const ok = window.Recintos.canAccept(zone, incomingType);
        if (!ok || ok.ok === false) {
          showMessage(
            (ok && ok.reason) ||
              `La zona ${zoneName} no acepta ese dinosaurio.`,
            "warn"
          );
          return;
        }
      }

      const cloned = dragged.cloneNode(true);
      cloned.id = "placed-" + Math.random().toString(36).slice(2, 9);
      cloned.removeAttribute("data-original");
      cloned.setAttribute("data-placed", "true");
      makeDraggable(cloned);
      zone.appendChild(cloned);
      decrementMoves(1);
      try {
        if (
          window.SaveGame &&
          typeof window.SaveGame.recordMove === "function"
        ) {
          window.SaveGame.recordMove("add", incomingType, zoneName);
        }
      } catch (e) {}
      try {
        showMessage(
          `Dino ${incomingType} agregado a ${zone.getAttribute("data-zone")}`,
          "info",
          1500
        );
      } catch (e) {}
      if (window.Recintos && typeof window.Recintos.updateScores === "function")
        window.Recintos.updateScores();
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
      try {
        if (
          window.SaveGame &&
          typeof window.SaveGame.recordMove === "function"
        ) {
          window.SaveGame.recordMove("remove", type, zoneName);
        }
      } catch (e) {}
      if (window.Recintos && typeof window.Recintos.updateScores === "function")
        window.Recintos.updateScores();
    }
  });
}

// Puntuación y contadores delegados a Recintos
// Las funciones de scoring, sanitización y actualización de badges
// residen en `recintos.js`. Llamamos a su updateScores() para inicializar.
try {
  if (window.Recintos && typeof window.Recintos.updateScores === "function") {
    window.Recintos.updateScores();
  }
} catch (e) {}

// Nota: envío de la partida y manejo del botón 'botonEnviar' están en save-game.js
