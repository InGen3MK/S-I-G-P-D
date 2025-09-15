document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    // Validaciones básicas
    const nickname = form.nickname.value.trim();
    const contraseña = form.contraseña.value;
    let mensaje = "";
    if (!nickname || !contraseña) {
      mensaje = "Todos los campos son obligatorios.";
    } else if (!/^[a-zA-Z0-9_\-]{3,20}$/.test(nickname)) {
      mensaje =
        "El usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones y guiones bajos.";
    }
    if (mensaje) {
      mostrarMensaje(mensaje, "danger");
      return;
    }
    const formData = new FormData(form);
    fetch("../../Api/UsuariosController.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
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
        if (data.includes("Bienvenido")) {
          div.classList.add("alert-success");
          div.innerHTML = data;
          let seconds = 3;
          const timer = document.createElement("span");
          timer.id = "timer-login";
          timer.className = "ms-2 fw-bold";
          timer.innerText = `Redirigiendo en ${seconds} segundos...`;
          div.appendChild(timer);
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
    // Remove previous timer if exists
    const oldTimer = document.getElementById("timer-login");
    if (oldTimer) {
      oldTimer.remove();
    }
  }
});
