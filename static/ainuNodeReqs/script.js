document.addEventListener('DOMContentLoaded', () => {
    const draggableElements = document.querySelectorAll('.town-node-list p');
    const nodeMapPlanner = document.querySelector('.node-map-planner');
    let draggedElementHtml = '';

    draggableElements.forEach(element => {
        element.draggable = true;

        element.addEventListener('dragstart', e => {
            draggedElementHtml = element.outerHTML;
        });
    });

    nodeMapPlanner.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    nodeMapPlanner.addEventListener('drop', e => {
        e.preventDefault();
        const mouseX = e.clientX - nodeMapPlanner.getBoundingClientRect().left;
        const mouseY = e.clientY - nodeMapPlanner.getBoundingClientRect().top;

        if (draggedElementHtml) {
            const clone = document.createElement('div');
            clone.innerHTML = draggedElementHtml;
            const draggedElement = clone.querySelector('p');

            if (draggedElement) {
                const newNode = draggedElement.cloneNode(true);
                newNode.removeAttribute("id");
                newNode.style.position = 'absolute';
                newNode.style.left = mouseX + 'px';
                newNode.style.top = mouseY + 'px';
                nodeMapPlanner.appendChild(newNode);
            }
        }
    });
});
