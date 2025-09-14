 window.addEventListener("DOMContentLoaded", () => {
    const selectElement = document.getElementById("CantJugadores");
    const bloque_1 = document.querySelector(".jugador1");
    const bloque_2 = document.querySelector(".jugador2");
    const bloque_3 = document.querySelector(".jugador3");
    const bloque_4 = document.querySelector(".jugador4");
    const bloque_5 = document.querySelector(".jugador5");

    // Mostrar inicialmente solo los dos primeros
    bloque_1.style.display = "flex";
    bloque_2.style.display = "flex";
    bloque_3.style.display = "none";
    bloque_4.style.display = "none";
    bloque_5.style.display = "none";

    selectElement.addEventListener("change", (event) => {
        const jugadores = event.target.value;
        console.log(`${jugadores}`);

        if (jugadores == 2) {
            bloque_1.style.display = "flex";
            bloque_2.style.display = "flex";
            bloque_3.style.display = "none";
            bloque_4.style.display = "none";
            bloque_5.style.display = "none";
        } else if (jugadores == 3) {
            bloque_1.style.display = "flex";
            bloque_2.style.display = "flex";
            bloque_3.style.display = "flex";
            bloque_4.style.display = "none";
            bloque_5.style.display = "none";
        } else if (jugadores == 4) {
            bloque_1.style.display = "flex";
            bloque_2.style.display = "flex";
            bloque_3.style.display = "flex";
            bloque_4.style.display = "flex";
            bloque_5.style.display = "none";
        } else if (jugadores == 5) {
            bloque_1.style.display = "flex";
            bloque_2.style.display = "flex";
            bloque_3.style.display = "flex";
            bloque_4.style.display = "flex";
            bloque_5.style.display = "flex";
        }
    });
});
const terciaria = document.getElementById('terci');
    terciaria.addEventListener("click", () => {
      window.location.href = "tercera.html";


    });