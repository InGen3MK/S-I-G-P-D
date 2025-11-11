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
            // si datos no es un array o está vacío
            if (!Array.isArray(datos) || datos.length === 0) {
                //vas a crear tr con td 
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                // el td va a tener colspan de 3 para que ocupe todo el ancho de la tabla
                td.setAttribute('colspan', '3');
                // le agregas clases para centrar el texto
                td.classList.add('text-center');
                // el texto va a ser 'Sin datos'
                td.textContent = 'Sin datos';
                // agregas el td al tr
                tr.appendChild(td);
                // agregas el tr al tbody
                tbody.appendChild(tr);
                // salis de la funcion
                return;
            }

            //recorre los datos
            datos.forEach((item, index) => {
                //crear un tr
                const tr = document.createElement('tr');
                //crear un th
                const th = document.createElement('th');
                //el th va a tener scope row, que significa que va a ocupar toda la fila
                th.scope = 'row'; //el scope es para accesibilidad
                // el texto del th va a ser el index + 1 (posición/top)
                th.textContent = index + 1; // posición/top

                //crear td para el jugador
                const tdJugador = document.createElement('td');
                //el texto del td va a ser el nombre del jugador o vacío si no existe
                tdJugador.textContent = item.ganador ?? '';

                    //crear td para la puntuacion
                const tdPuntos = document.createElement('td');
                //el texto del td va a ser la puntuacion o vacío si no existe
                tdPuntos.textContent = item.puntuacion ?? '';

                //agregar th y td al tr
                tr.appendChild(th);
                tr.appendChild(tdJugador);
                tr.appendChild(tdPuntos);
                
                //agregar tr al tbody
                tbody.appendChild(tr);
            });
            console.log('Datos cargados en la tabla');
        })

        .catch(error => {
            //si hay un error, lo logueas y muestras un mensaje en la tabla
            console.error('Error al procesar datos del ranking:', error);
            // seleccionas el tbody
            const tbody = document.querySelector("#tabla tbody");
            if (tbody) {
                //limpias el contenido previo
                tbody.innerHTML = '';
                //crear un tr
                const tr = document.createElement('tr');
                //crear un td
                const td = document.createElement('td');
                //el td va a tener colspan de 3 para que ocupe todo el ancho de la tabla
                td.setAttribute('colspan', '3');
                //le agregas clases para centrar el texto y ponerlo en rojo
                td.classList.add('text-danger', 'text-center');
                //el texto va a ser 'Error al cargar datos'
                td.textContent = 'Error al cargar datos';
                //agregas el td al tr
                tr.appendChild(td);
                //agregas el tr al tbody
                tbody.appendChild(tr);
            }
        });
});

