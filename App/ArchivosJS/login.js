document.addEventListener("DOMContentLoaded", function () {
  // espera a que la pagina este completamente cargada
  const form = document.querySelector("form");
  form.addEventListener("submit", function (e) {
    // escucha el evento submit del formulario
    e.preventDefault();
    // previene el comportamiento por defecto del formulario (recargar la pagina)
    // Validaciones básicas
    const nickname = form.nickname.value.trim();
    const contraseña = form.contraseña.value;
    let mensaje = "";
    if (!nickname || !contraseña) {
      //si (falta nickname o falta contraseña) hace lo de abajo
      mensaje = "Todos los campos son obligatorios.";
    } else if (!/^[a-zA-Z0-9_\-]{3,20}$/.test(nickname)) {
      // esta expresión regular permite letras, números, guiones y guiones bajos, entre 3 y 20 caracteres, si falla me da el siguiente mensaje
      mensaje =
        "El usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones y guiones bajos.";
    }
    if (mensaje) {
      mostrarMensaje(mensaje, "danger");
      return;
    }
    const formData = new FormData(form);
    fetch("../../Api/UsuariosController.php", {
      //fetch es un metodo de JS para hacer peticiones HTTP asincronas}
      // en este caso le pedimos a usuarios controller que haga el login enviandole la informacion en el body
      method: "POST",
      body: formData,
      // se manda en body para que sea seguro
    })
      .then((response) => response.text())
      // lo que te llega del servidor lo conviertes a texto
      .then((data) => {
        // agarra data convertida a texto
        // en esta parte agregamos mensaje de error o de success dependiendo de la respuesta del servidor 
        let div = document.getElementById("msg-login");
        if (!div) {
          div = document.createElement("div");
          div.id = "msg-login";
          form.appendChild(div);
        }

        div.className = "alert mt-3";
        // Remove previous timer if exists
        const oldTimer = document.getElementById("timer-login");
        if (oldTimer) {
          oldTimer.remove();
        }
        // aca chequeamos si la respuesta del servidor incluye la palabra "Bienvenido", si es así mostramos mensaje de éxito y un temporizador para redirigir al usuario a la página principal después de 3 segundos. Si no, mostramos un mensaje de error.
        if (data.includes("Bienvenido")) {
          div.classList.add("alert-success");
          div.innerHTML = data;
          let seconds = 3;
          const timer = document.createElement("span");
          timer.id = "timer-login";
          timer.className = "ms-2 fw-bold";
          timer.innerText = `Redirigiendo en ${seconds} segundos...`;
          div.appendChild(timer);
          // aca agregamos un intervalo cada 1 segundo para actualizar el temporizador y redirigir al usuario cuando llegue a 0
          const interval = setInterval(() => {
            seconds--;
            timer.innerText = `Redirigiendo en ${seconds} segundos...`;
            if (seconds === 0) {
              clearInterval(interval);
              window.location.href = "index.html";
            }
          }, 1000);
        } else {
          div.classList.add("alert-danger");
          div.innerHTML = data;
        }
      })
      .catch((error) => {
        alert("Error en el login: " + error);
      });
  });

  function mostrarMensaje(msg, tipo) {
    let div = document.getElementById("msg-login");
    if (!div) {
      div = document.createElement("div");
      div.id = "msg-login";
      form.appendChild(div);
    }
    div.className = "alert alert-" + tipo + " mt-3";
    div.innerHTML = msg;
    //innerHTML es el contenido que tiene un elemento HTML, en este caso un div

    // Remove previous timer if exists
    const oldTimer = document.getElementById("timer-login");
    if (oldTimer) {
      oldTimer.remove();
    }
  }
});
