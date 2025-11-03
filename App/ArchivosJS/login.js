document.addEventListener("DOMContentLoaded", function () {
  // Este evento asegura que el código se ejecute solo cuando el DOM esté completamente cargado.
  // espera a que la pagina este completamente cargada
  const form = document.querySelector("form");
  // Selecciona el formulario de la página de login.
  form.addEventListener("submit", function (e) {
    // Este evento se activa cuando el usuario intenta enviar el formulario.
    // escucha el evento submit del formulario
    e.preventDefault();
    // Evita que la página se recargue al enviar el formulario.
    // previene el comportamiento por defecto del formulario (recargar la pagina)
    // Validaciones básicas
    const nickname = form.nickname.value.trim();
    // Obtiene el valor del campo 'nickname' y elimina espacios.
    const contraseña = form.contraseña.value;
    // Obtiene el valor del campo 'contraseña'.
    let mensaje = "";
    // Variable para almacenar mensajes de validación.
    if (!nickname || !contraseña) {
      // Si algún campo está vacío, muestra mensaje de error.
      // Valida que el usuario tenga entre 3 y 20 caracteres y solo contenga letras, números, guiones y guiones bajos.
      //si (falta nickname o falta contraseña) hace lo de abajo
      mensaje = "Todos los campos son obligatorios.";
    } else if (!/^[a-zA-Z0-9_\-]{3,20}$/.test(nickname)) {
      // esta expresión regular permite letras, números, guiones y guiones bajos, entre 3 y 20 caracteres, si falla me da el siguiente mensaje
      mensaje =
        "El usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones y guiones bajos.";
    }
    if (mensaje) {
      // Si hay error de validación, muestra el mensaje y detiene el envío.
      mostrarMensaje(mensaje, "danger");
      return;
    }
    const formData = new FormData(form);
    // Crea un objeto FormData con los datos del formulario para enviarlos por AJAX.
    // AJAX es una tecnica para enviar y recibir datos de un servidor de manera asincrona sin recargar la pagina
    fetch("../../Api/UsuariosController.php", {
      // Realiza una petición POST al backend para procesar el login.
      //fetch es un metodo de JS para hacer peticiones HTTP asincronas}
      // en este caso le pedimos a usuarios controller que haga el login enviandole la informacion en el body
      method: "POST",
      body: formData,
      // se manda en body para que sea seguro
    })
      .then((response) => response.text())
      // Convierte la respuesta del servidor a texto.
      // lo que te llega del servidor lo conviertes a texto
      .then((data) => {
        // Procesa la respuesta del backend y muestra mensajes al usuario.
        // agarra data convertida a texto
        // en esta parte agregamos mensaje de error o de success dependiendo de la respuesta del servidor
        let div = document.getElementById("msg-login");
        // Busca el contenedor de mensajes, si no existe lo crea.
        if (!div) {
          div = document.createElement("div");
          div.id = "msg-login";
          form.appendChild(div);
        }

        div.className = "alert mt-3";
        const oldTimer = document.getElementById("timer-login");
        // Elimina el temporizador anterior si existe.
        if (oldTimer) {
          oldTimer.remove();
        }
        // aca chequeamos si la respuesta del servidor incluye la palabra "Bienvenido", si es así mostramos mensaje de éxito y un temporizador para redirigir al usuario a la página principal después de 3 segundos. Si no, mostramos un mensaje de error.
        if (data.includes("Bienvenido")) {
          // Si el login es exitoso, muestra mensaje de éxito y temporizador para redirigir.
          div.classList.add("alert-success");
          div.innerHTML = data;
          // Guardar usuario en localStorage (clave única 'usuario') para uso en partidas
          try {
            // nickname viene del formulario
            localStorage.setItem("usuario", nickname);
          } catch (e) {
            // si localStorage no está disponible, no bloqueamos el flujo
            console.warn("No se pudo guardar usuario en localStorage", e);
          }
          let seconds = 3;
          const timer = document.createElement("span");
          timer.id = "timer-login";
          timer.className = "ms-2 fw-bold";
          timer.innerText = `Redirigiendo en ${seconds} segundos...`;
          div.appendChild(timer);
          // aca agregamos un intervalo cada 1 segundo para actualizar el temporizador y redirigir al usuario cuando llegue a 0
          const interval = setInterval(() => {
            // Actualiza el temporizador cada segundo y redirige cuando llega a 0.
            seconds--;
            timer.innerText = `Redirigiendo en ${seconds} segundos...`;
            if (seconds === 0) {
              clearInterval(interval);
              window.location.href = "index.html";
            }
          }, 1000);
        } else {
          // Si el login falla, muestra mensaje de error.
          div.classList.add("alert-danger");
          div.innerHTML = data;
          // innerHTML es el contenido que tiene un elemento HTML, en este caso un div
        }
      })
      .catch((error) => {
        // Si ocurre un error en la petición AJAX, lo catchea (atrapa) y muestra alerta.
        alert("Error en el login: " + error);
        // este error viene de fetch
        //fetch es metodo de JS para hacer peticiones HTTP asincronas
      });
  });

  function mostrarMensaje(msg, tipo) {
    // Función para mostrar mensajes en el formulario de login.
    let div = document.getElementById("msg-login");
    // Busca el contenedor de mensajes, si no existe lo crea.
    if (!div) {
      div = document.createElement("div");
      div.id = "msg-login";
      form.appendChild(div);
    }
    // dice si el div no existe lo crea
    div.className = "alert alert-" + tipo + " mt-3";
    div.innerHTML = msg;
    // Elimina el temporizador anterior si existe.
    //innerHTML es el contenido que tiene un elemento HTML, en este caso un div

    // Remove previous timer if exists
    const oldTimer = document.getElementById("timer-login");
    if (oldTimer) {
      oldTimer.remove();
      // si existe el temporizador lo elimina
    }
  }
});
