document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    // Validaciones básicas
    const nickname = form.nickname.value.trim();
    const gmail = form.gmail.value.trim();
    const contraseña = form.contraseña.value;
    const confirmar = form.confirmar.value;
    let mensaje = "";
    // Validar campos vacíos
    if (!nickname || !gmail || !contraseña || !confirmar) {
      mensaje = "Todos los campos son obligatorios.";
    }
    // Validar formato de correo
    else if (!/^\S+@\S+\.\S+$/.test(gmail)) {
      mensaje = "El correo electrónico no es válido.";
    }
    // Validar longitud de contraseña
    else if (contraseña.length < 6) {
      mensaje = "La contraseña debe tener al menos 6 caracteres.";
    }
    // Validar coincidencia de contraseñas
    else if (contraseña !== confirmar) {
      mensaje = "Las contraseñas no coinciden.";
    }
    if (mensaje) {
      mostrarMensaje(mensaje, "danger");
      return;
    }
    // Si pasa validaciones, enviar por AJAX
    const formData = new FormData(form);
    fetch("../../Api/UsuariosController.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        mostrarMensaje(
          data,
          data.includes("correctamente") ? "success" : "danger"
        );
        // Remove previous timer if exists
        const oldTimer = document.getElementById("timer-registro");
        if (oldTimer) {
          oldTimer.remove();
        }
        if (data.includes("Usuario registrado correctamente")) {
          let seconds = 3;
          const div = document.getElementById("msg-registro");
          const timer = document.createElement("span");
          timer.id = "timer-registro";
          timer.className = "ms-2 fw-bold";
          timer.innerText = `Redirigiendo en ${seconds} segundos...`;
          div.appendChild(timer);
          const interval = setInterval(() => {
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
        mostrarMensaje("Error en el registro: " + error, "danger");
      });
  });

  function mostrarMensaje(msg, tipo) {
    let div = document.getElementById("msg-registro");
    if (!div) {
      div = document.createElement("div");
      div.id = "msg-registro";
      form.appendChild(div);
    }
    div.className = "alert alert-" + tipo + " mt-3";
    div.innerHTML = msg;
  }
});
