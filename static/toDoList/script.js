const table = document.getElementById("task-table");


async function preDisplayTasks() {
    const getTasks = await fetch('/data_tasks/get_tasks');
    const tasksObject = await getTasks.json();
    const tasks = tasksObject['Tasks'];
    for (const taskID in tasks) {
      displayTask(taskID);
    }
    sortTableByPriority(table);
}


function createTask() {
  const itemTask = document.getElementById("itemTaskAdd").value;
  const itemDescription = document.getElementById("itemDescriptionAdd").value;
  const itemNotes = document.getElementById("itemNotesAdd").value;

  if (itemTask === "" || itemDescription === "") {
    alert("Please fill in all fields.");
    return;
  }

  if (itemNotes === "") {
    document.getElementById("itemNotesAdd").value = " ";
  }

  fetch('/data_tasks/post_task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      itemTaskAdd: itemTask,
      itemDescriptionAdd: itemDescription,
      itemNotesAdd: itemNotes
    })
  })
    .then(response => response.json())
    .then(data => {
      alert("Task added successfully!");
      document.getElementById("itemTaskAdd").value = "";
      document.getElementById("itemDescriptionAdd").value = "";
      document.getElementById("itemNotesAdd").value = "";
      displayTask(data.task_id);
    })
    .catch(error => {
      console.error(error);
    });
}


async function displayTask(taskID) {
  const row = table.insertRow(-1);
  const [cellTask, cellDescription, cellNotes, cellPriority, cellComplete] = Array.from({length: 5}, () => row.insertCell());

  tableRowAddEventListeners(taskID, row, cellDescription, cellNotes, cellPriority, cellComplete)

  const response = await fetch(`/data_tasks/get_single_task/${taskID}`);
  const data = await response.json();

  cellTask.innerHTML = data.task;
  cellDescription.innerHTML = data.description;
  cellNotes.innerHTML = data.note;
  cellPriority.innerHTML = data.priority;
  cellPriority.setAttribute('id', 'priority-button');
  cellPriority.setAttribute('unselectable', 'on');
  cellPriority.setAttribute('class', 'unselectable');
  cellPriority.style.backgroundColor = data.priority === "High" ? "red" : (data.priority === "Medium" ? "orange" : "green");
  cellComplete.innerHTML = "";
  cellComplete.setAttribute('id', 'complete-button');
}


async function tableRowAddEventListeners(taskID, row, cellDescription, cellNotes, cellPriority, cellComplete) {

  addEditInputEvent(cellDescription);
  addEditInputEvent(cellNotes);

  cellPriority.addEventListener('click', async () => {
    const priorities = ['High', 'Medium', 'Low'];
    const currentPriority = cellPriority.innerHTML;
    const index = priorities.indexOf(currentPriority);
    const nextIndex = (index + 1) % priorities.length;
    const nextPriority = priorities[nextIndex];

    cellPriority.innerHTML = nextPriority;
    cellPriority.style.backgroundColor = nextPriority === 'High' ? "red" : (nextPriority === 'Medium' ? "orange" : "green");
    
    await fetch(`/data_tasks/put_priority/${taskID.slice(-3)}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ priority: nextPriority })
    });
  });

  cellComplete.addEventListener('click', async () => {
    table.deleteRow(row.rowIndex);
    await fetch(`/data_tasks/del_task/${taskID.slice(-3)}`, {method: 'DELETE'});
  });
}

function addEditInputEvent(cellElement) {
  cellElement.addEventListener('click', () => {
    const currentContent = cellElement.innerHTML;
    cellElement.innerHTML = `<input type="text" class="edit-input" value="${currentContent}" />`;

    const inputElement = cellElement.querySelector('input');

    inputElement.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
      if (!cellElement.contains(event.target)) {
        const updatedContent = inputElement.value;
        cellElement.innerHTML = updatedContent;
      }
    });

    inputElement.focus();
    inputElement.select();
  });
}

const cellDescription = document.getElementById('cellDescription');
const cellNotes = document.getElementById('cellNotes');

function sortTableByPriority(table) {
  const rows = table.getElementsByTagName('tr');
  const sortedRows = Array.from(rows).slice(1).sort((rowA, rowB) => {
    const priorities = ['High', 'Medium', 'Low'];
    const priorityA = priorities.indexOf(rowA.cells[3].innerHTML);
    const priorityB = priorities.indexOf(rowB.cells[3].innerHTML);
    return priorityA - priorityB;
  });

  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  for (const row of sortedRows) {
    table.appendChild(row);
  }
}

const taskCreateButton = document.getElementById('addTask');
taskCreateButton.addEventListener('click', createTask);

const sortTableButton = document.getElementById('sort-button');
sortTableButton.addEventListener('click', () => sortTableByPriority(table));

preDisplayTasks();
