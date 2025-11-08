document.addEventListener("DOMContentLoaded", function () {
    //Esto es para que el boton4 redirija a index.html
    const boton4 = document.getElementById('boton4');
    if (boton4) {
        boton4.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    // Cargar datos del ranking (enfoque dinámico - crea filas según la respuesta)
    console.log('Iniciando carga de ranking...');

    fetch("../../Api/Ranking.php")
        .then(response => {
            console.log('Respuesta recibida:', response.status);
            return response.json();
        })
        .then(datos => {
            console.log('Datos recibidos:', datos);

            const tbody = document.querySelector("#tabla tbody");
            if (!tbody) {
                console.error('No se encontró el tbody de la tabla');
                return;
            }

            // Limpiar contenido previo
            tbody.innerHTML = '';

            // Validar formato
            if (!Array.isArray(datos) || datos.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.setAttribute('colspan', '3');
                td.classList.add('text-center');
                td.textContent = 'Sin datos';
                tr.appendChild(td);
                tbody.appendChild(tr);
                return;
            }

            // Crear filas dinámicamente según los datos (espera propiedades: ganador, puntuacion)
            datos.forEach((item, index) => {
                const tr = document.createElement('tr');

                const th = document.createElement('th');
                th.scope = 'row';
                th.textContent = index + 1; // posición/top

                const tdJugador = document.createElement('td');
                tdJugador.textContent = item.ganador ?? '';

                const tdPuntos = document.createElement('td');
                tdPuntos.textContent = item.puntuacion ?? '';

                tr.appendChild(th);
                tr.appendChild(tdJugador);
                tr.appendChild(tdPuntos);

                tbody.appendChild(tr);
            });

            console.log('Datos cargados en la tabla');
        })
        .catch(error => {
            console.error('Error al procesar datos del ranking:', error);
            const tbody = document.querySelector("#tabla tbody");
            if (tbody) {
                tbody.innerHTML = '';
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.setAttribute('colspan', '3');
                td.classList.add('text-danger', 'text-center');
                td.textContent = 'Error al cargar datos';
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
        });
});

