window.addEventListener("DOMContentLoaded", () => {
  // Este evento asegura que el código se ejecute solo cuando el DOM esté completamente cargado.
  const selectElement = document.getElementById("CantJugadores");
  // Selecciona el elemento <select> para la cantidad de jugadores.
  const bloque_1 = document.querySelector(".jugador1");
  // Selecciona el bloque del jugador 1.
  const bloque_2 = document.querySelector(".jugador2");
  // Selecciona el bloque del jugador 2.
  const bloque_3 = document.querySelector(".jugador3");
  // Selecciona el bloque del jugador 3.
  const bloque_4 = document.querySelector(".jugador4");
  // Selecciona el bloque del jugador 4.
  const bloque_5 = document.querySelector(".jugador5");
  // Selecciona el bloque del jugador 5.

  // Mostrar inicialmente solo los dos primeros
  bloque_1.style.display = "flex";
  bloque_2.style.display = "flex";
  bloque_3.style.display = "none";
  bloque_4.style.display = "none";
  bloque_5.style.display = "none";
  // Inicialmente muestra solo los dos primeros jugadores.

  selectElement.addEventListener("change", (event) => {
    // Este evento se activa cuando el usuario cambia la cantidad de jugadores.
    const jugadores = event.target.value;
    // Obtiene el valor seleccionado de jugadores.
    console.log(`${jugadores}`);
    // Muestra en consola la cantidad seleccionada.

    if (jugadores == 2) {
      // Si son 2 jugadores, muestra solo los bloques 1 y 2.
      bloque_1.style.display = "flex";
      bloque_2.style.display = "flex";
      bloque_3.style.display = "none";
      bloque_4.style.display = "none";
      bloque_5.style.display = "none";
    } else if (jugadores == 3) {
      // Si son 3 jugadores, muestra los bloques 1, 2 y 3.
      bloque_1.style.display = "flex";
      bloque_2.style.display = "flex";
      bloque_3.style.display = "flex";
      bloque_4.style.display = "none";
      bloque_5.style.display = "none";
    } else if (jugadores == 4) {
      // Si son 4 jugadores, muestra los bloques 1, 2, 3 y 4.
      bloque_1.style.display = "flex";
      bloque_2.style.display = "flex";
      bloque_3.style.display = "flex";
      bloque_4.style.display = "flex";
      bloque_5.style.display = "none";
    } else if (jugadores == 5) {
      // Si son 5 jugadores, muestra todos los bloques.
      bloque_1.style.display = "flex";
      bloque_2.style.display = "flex";
      bloque_3.style.display = "flex";
      bloque_4.style.display = "flex";
      bloque_5.style.display = "flex";
    }
  });
});
const terciaria = document.getElementById("terci");
terciaria.addEventListener("click", () => {
  window.location.href = "tercera.html";
});
// Evento para el botón terciaria (navegación a otra página)
// Redirige a la página 'tercera.html' al hacer clic.
