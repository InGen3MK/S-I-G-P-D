const boton3 = document.getElementById('boton3');
const botonAtras = document.getElementById('botonAtras');
const dinosaurios = document.querySelectorAll('#dinosaurios div');
const dropZones = document.querySelectorAll('#back div');
const backContainer = document.getElementById('back');

// Botones de navegación
if (boton3) {
    boton3.addEventListener('click', () => {
        window.location.href = 'cuarta.html';
    });
}
if (botonAtras) {
    botonAtras.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// 1. Configurar los dinosaurios arrastrables
dinosaurios.forEach(dino => {
    dino.setAttribute('draggable', true);

    dino.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-dino'));
        e.target.classList.add('dragging');
    });

    dino.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
    });
});

// 2. Configurar las zonas de drop (solo drag & drop básico)
dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');

        const dinoType = e.dataTransfer.getData('text/plain');
        if (!dinoType) return;

        // Verificar límite global de dinosaurios dentro de #back
        if (backContainer) {
            const totalDinos = backContainer.querySelectorAll('[data-dino]').length;
            if (totalDinos >= 12) {
                alert('Límite alcanzado: ya hay 12 dinosaurios en total en el tablero');
                return;
            }
        }

        const originalDino = document.querySelector(`[data-dino="${dinoType}"]`);
        if (!originalDino) return;

        // Clonar y añadir el dinosaurio (permitir múltiples por zona)
        const clonedDino = originalDino.cloneNode(true);
        clonedDino.draggable = false;
        zone.appendChild(clonedDino);

        // Botón para eliminar el clon
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-dino');
        deleteButton.addEventListener('click', () => {
            if (clonedDino.parentNode === zone) zone.removeChild(clonedDino);
            if (deleteButton.parentNode === zone) zone.removeChild(deleteButton);
        });
        zone.appendChild(deleteButton);
    });
});