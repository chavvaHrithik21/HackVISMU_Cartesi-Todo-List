// Configuration
const API_BASE_URL = 'http://localhost:8080/graphql';
const POLLING_INTERVAL = 5000; // 5 seconds

// State
let todos = [];

// DOM Elements
const todoList = document.getElementById('todoList');
const addTodoForm = document.getElementById('addTodoForm');
const newTodoInput = document.getElementById('newTodo');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');

// Utility Functions
function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
}

function hideEmptyState() {
    emptyState.classList.add('hidden');
}

function encodePayload(action, task = '', id = 0) {
    return ethers.utils.defaultAbiCoder.encode(
        ['string', 'string', 'uint256'],
        [action, task, id]
    ).slice(2);
}

// API Interactions
async function fetchTodos() {
    showLoading();
    const query = `
        query {
            inspect(
                payload: "${encodePayload('list')}"
            )
        }
    `;

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        const decodedData = ethers.utils.defaultAbiCoder.decode(['string'], '0x' + data.data.inspect)[0];
        todos = JSON.parse(decodedData);
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
        alert('Failed to fetch todos. Please try again.');
    } finally {
        hideLoading();
    }
}

async function addTodo(task) {
    showLoading();
    const query = `
        mutation {
            addInput(
                input: {
                    payload: "${encodePayload('add', task)}"
                }
            ) {
                hash
            }
        }
    `;

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        await fetchTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Failed to add todo. Please try again.');
    } finally {
        hideLoading();
    }
}

async function completeTodo(id) {
    showLoading();
    const query = `
        mutation {
            addInput(
                input: {
                    payload: "${encodePayload('complete', '', id)}"
                }
            ) {
                hash
            }
        }
    `;

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        await fetchTodos();
    } catch (error) {
        console.error('Error completing todo:', error);
        alert('Failed to complete todo. Please try again.');
    } finally {
        hideLoading();
    }
}

async function deleteTodo(id) {
    showLoading();
    const query = `
        mutation {
            addInput(
                input: {
                    payload: "${encodePayload('delete', '', id)}"
                }
            ) {
                hash
            }
        }
    `;

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        await fetchTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo. Please try again.');
    } finally {
        hideLoading();
    }
}

// Rendering
function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        showEmptyState();
    } else {
        hideEmptyState();
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between bg-white p-4 rounded shadow';
            
            const taskSpan = document.createElement('span');
            taskSpan.textContent = todo.task;
            if (todo.completed) {
                taskSpan.classList.add('line-through', 'text-gray-500');
            }
            li.appendChild(taskSpan);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'space-x-2';

            if (!todo.completed) {
                const completeButton = document.createElement('button');
                completeButton.textContent = 'Complete';
                completeButton.className = 'px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600';
                completeButton.onclick = () => completeTodo(todo.id);
                buttonsDiv.appendChild(completeButton);
            }

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600';
            deleteButton.onclick = () => deleteTodo(todo.id);
            buttonsDiv.appendChild(deleteButton);

            li.appendChild(buttonsDiv);
            todoList.appendChild(li);
        });
    }
}

// Event Listeners
addTodoForm.onsubmit = async (e) => {
    e.preventDefault();
    const task = newTodoInput.value.trim();
    if (task) {
        await addTodo(task);
        newTodoInput.value = '';
    }
};

// Initial load and polling
fetchTodos();
setInterval(fetchTodos, POLLING_INTERVAL);