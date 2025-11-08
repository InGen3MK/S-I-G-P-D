/*
  Módulo: save-game.js
  Contiene helpers para registro local (localStorage) y envío de la partida al servidor.
  Exporta la API global `SaveGame`.
*/

(function () {
  function getMovesLog() {
    try {
      const raw = localStorage.getItem("draftosaurus_moves");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveMovesLog(log) {
    try {
      localStorage.setItem("draftosaurus_moves", JSON.stringify(log));
    } catch (e) {}
  }

  function recordMove(action, dinoType, zoneName) {
    const log = getMovesLog();
    // Map action values to Spanish words and rename keys per requirements
    const mappedAction =
      //la accion a guardar puede ser agregar o quitar
      action === "add" ? "agregar" : action === "remove" ? "quitar" : action;
    const entry = {
      Accion: mappedAction,
      dino: dinoType || null,
      zona: zoneName || null,
    };
    log.push(entry);
    saveMovesLog(log);
  }

  async function sendGameData() {
    const botonEnviar = document.getElementById("botonEnviar");
    if (!botonEnviar) return;
    botonEnviar.disabled = true;
    showMessage("Enviando datos de la partida...", "info");
    const totalSpan = document.getElementById("score-total");
    const totalScore = totalSpan
      ? parseInt(totalSpan.textContent || "0", 10)
      : 0;
    function getLoggedUsername() {
      try {
        const v = localStorage.getItem("usuario");
        if (v) return v;
      } catch (e) {}
      return "";
    }
    //esta funcion obtiene los nombres de las zonas y los dinosaurios que hay puestos en cada zona
    function getTablero() {
      //tablero es un objeto vacio
      let tablero = {};
      //seleccionas todo lo que tenga clase zona
      const zonas = document.querySelectorAll(".zone");

      //recorre todas las zonas y obtiene sus nombres
      zonas.forEach((zona) => {
        const zoneName = zona.getAttribute("data-zone");

        //obtiene todos los dinosaurios que hay en cada zona, lo guarda en un array y solo guarda sus nombres
        const dinos = Array.from(zona.querySelectorAll(".dino")).map(
          (dinoElem) => {
            const dinoName = dinoElem.getAttribute("data-dino");
            return dinoName;
          }
        );
        //le ponemos zonename como propiedad de tablero y como valor el array de los nombres de dinosaurios
        tablero[zoneName] = dinos;
      });
      //devuelve el objeto tablero
      return tablero;
    }
    //la constante tablero es igual a la funcion getTablero
    const tablero = getTablero();

    const payload = { totalScore, winner: getLoggedUsername(), tablero };
    try {
      const resp = await fetch("../../Api/saveGame.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data && data.success) {
        showMessage(
          "Partida guardada correctamente (ID: " +
            (data.partidaId || "-") +
            ")",
          "info",
          6000
        );
        try {
          localStorage.removeItem("draftosaurus_moves");
        } catch (e) {}
        botonEnviar.disabled = true;
        // Mostrar el botón Siguiente y habilitar navegación a cuarta.html
        try {
          // Obtener el botón "Siguiente" del DOM
          const botonSiguiente = document.getElementById("botonSiguiente");
          if (botonSiguiente) {
            // Hacer visible el botón para que el usuario pueda avanzar
            botonSiguiente.style.display = "inline-block";
            // Asegurar que esté habilitado (no en estado disabled)
            botonSiguiente.disabled = false;
            // Añadir un listener que redirige a la página del ranking cuando se clickea
            // Esto permite que el usuario vaya a `cuarta.html` y vea el ranking actualizado
            botonSiguiente.addEventListener("click", () => {
              window.location.href = "cuarta.html";
            });
          }
        } catch (e) {
          // Si algo falla al manipular el DOM, ignoramos silenciosamente
          // (no queremos romper la experiencia de guardado por un error aquí)
        }
      } else {
        showMessage(
          "Error guardando la partida: " + (data.message || "sin detalle"),
          "error",
          8000
        );
        botonEnviar.disabled = false;
      }
    } catch (e) {
      showMessage("Error de red al guardar la partida.", "error", 8000);
      botonEnviar.disabled = false;
    }
  }

  window.SaveGame = {
    getMovesLog,
    saveMovesLog,
    recordMove,
    sendGameData,
  };

  // Añadir listener al botonEnviar si existe (para mantener comportamiento previo)
  document.addEventListener("DOMContentLoaded", () => {
    const botonEnviar = document.getElementById("botonEnviar");
    if (botonEnviar) {
      botonEnviar.addEventListener("click", (e) => {
        e.preventDefault();
        sendGameData();
      });
    }
  });
})();
