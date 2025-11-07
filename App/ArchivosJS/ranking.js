document.addEventListener("DOMContentLoaded", function () {

    //Esto es para que el boton4 redirija a index.html
    const boton4 = document.getElementById('boton4');
    boton4.addEventListener("click", () => {
        window.location.href = "index.html";
    })


    const button = document.getElementById("botonEnviar");
    button.addEventListener("submit", function (e) {

        fetch("../../Api/Ranking.php", {
            method: "POST",
        })
    })
});

