document.addEventListener("DOMContentLoaded", function () {
  // Este evento asegura que el código se ejecute solo cuando el DOM esté completamente cargado.
  const form = document.querySelector("form");
  // Selecciona el formulario de la página de registro.
  form.addEventListener("submit", function (e) {
    // Este evento se activa cuando el usuario intenta enviar el formulario.
    e.preventDefault();
    // Evita que la página se recargue al enviar el formulario.
    // Validaciones básicas
    const nickname = form.nickname.value.trim();
    // Obtiene el valor del campo 'nickname' y elimina espacios.
    const gmail = form.gmail.value.trim();
    // Obtiene el valor del campo 'gmail' y elimina espacios.
    const contraseña = form.contraseña.value;
    // Obtiene el valor del campo 'contraseña'.
    const confirmar = form.confirmar.value;
    // Obtiene el valor del campo 'confirmar contraseña'.
    let mensaje = "";
    // Variable para almacenar mensajes de validación.
    // Validar campos vacíos
    if (!nickname || !gmail || !contraseña || !confirmar) {
      // Si algún campo está vacío, muestra mensaje de error.
      mensaje = "Todos los campos son obligatorios.";
    }
    // Validar formato de correo
    else if (!/^\S+@\S+\.\S+$/.test(gmail)) {
      // Valida el formato del correo electrónico.
      mensaje = "El correo electrónico no es válido.";
    }
    // Validar longitud de contraseña
    else if (contraseña.length < 6) {
      // Valida que la contraseña tenga al menos 6 caracteres.
      mensaje = "La contraseña debe tener al menos 6 caracteres.";
    }
    // Validar coincidencia de contraseñas
    else if (contraseña !== confirmar) {
      // Valida que las contraseñas coincidan.
      mensaje = "Las contraseñas no coinciden.";
    }
    if (mensaje) {
      // Si hay error de validación, muestra el mensaje y detiene el envío.
      mostrarMensaje(mensaje, "danger");
      return;
    }
    // Si pasa validaciones, enviar por AJAX
    const formData = new FormData(form);
    // Crea un objeto FormData con los datos del formulario para enviarlos por AJAX.
    fetch("../../Api/UsuariosController.php", {
      // Realiza una petición POST al backend para procesar el registro.
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      // Convierte la respuesta del servidor a texto.
      .then((data) => {
        // Procesa la respuesta del backend y muestra mensajes al usuario.
        mostrarMensaje(
          data,
          data.includes("correctamente") ? "success" : "danger"
        );
        // Remove previous timer if exists
        const oldTimer = document.getElementById("timer-registro");
        // Elimina el temporizador anterior si existe.
        if (oldTimer) {
          oldTimer.remove();
        }
        if (data.includes("Usuario registrado correctamente")) {
          // Si el registro es exitoso, muestra mensaje de éxito y temporizador para redirigir.
          let seconds = 3;
          const div = document.getElementById("msg-registro");
          const timer = document.createElement("span");
          timer.id = "timer-registro";
          timer.className = "ms-2 fw-bold";
          timer.innerText = `Redirigiendo en ${seconds} segundos...`;
          div.appendChild(timer);
          const interval = setInterval(() => {
            // Actualiza el temporizador cada segundo y redirige cuando llega a 0.
            seconds--;
            timer.innerText = `Redirigiendo en ${seconds} segundos...`;
            if (seconds === 0) {
              clearInterval(interval);
              window.location.href = "login.html";
            }
          }, 1000);
        }
      })
      .catch((error) => {
        // Si ocurre un error en la petición AJAX, muestra alerta.
        mostrarMensaje("Error en el registro: " + error, "danger");
      });
  });

  function mostrarMensaje(msg, tipo) {
    // Función para mostrar mensajes en el formulario de registro.
    let div = document.getElementById("msg-registro");
    if (!div) {
      div = document.createElement("div");
      div.id = "msg-registro";
      form.appendChild(div);
    }
    div.className = "alert alert-" + tipo + " mt-3";
    div.innerHTML = msg;
    // Elimina el temporizador anterior si existe.
  }
});
