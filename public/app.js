// Состояние
const state = {
    leftOffset: 0,
    rightOffset: 0,
    leftFilter: '',
    rightFilter: '',
    leftHasMore: true,
    rightHasMore: true,
    isLoadingLeft: false,
    isLoadingRight: false,
};

// DOM-элементы
const leftList = document.getElementById('left-list');
const rightList = document.getElementById('right-list');
const leftFilterInput = document.getElementById('left-filter');
const rightFilterInput = document.getElementById('right-filter');
const newIdInput = document.getElementById('new-id');
const addBtn = document.getElementById('add-btn');

// ========== ЛЕВОЕ ОКНО ==========

async function loadLeftItems(reset = false) {
    if (state.isLoadingLeft) return;
    if (!state.leftHasMore && !reset) return;

    state.isLoadingLeft = true;
    if (reset) {
        state.leftOffset = 0;
        leftList.innerHTML = '';
        state.leftHasMore = true;
    }

    const url = `/api/items?offset=${state.leftOffset}&limit=20&filter=${state.leftFilter}`;
    const res = await fetch(url);
    const data = await res.json();

    data.items.forEach(id => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.textContent = id;
        div.addEventListener('click', () => selectItem(id));
        leftList.appendChild(div);
    });

    state.leftOffset += data.items.length;
    state.leftHasMore = data.hasMore;
    state.isLoadingLeft = false;
}

leftList.addEventListener('scroll', () => {
    if (leftList.scrollTop + leftList.clientHeight >= leftList.scrollHeight - 10) {
        loadLeftItems();
    }
});

leftFilterInput.addEventListener('input', () => {
    state.leftFilter = leftFilterInput.value;
    loadLeftItems(true);
});

// ========== ПРАВОЕ ОКНО ==========

async function loadRightItems(reset = false) {
    if (state.isLoadingRight) return;
    if (!state.rightHasMore && !reset) return;

    state.isLoadingRight = true;
    if (reset) {
        state.rightOffset = 0;
        rightList.innerHTML = '';
        state.rightHasMore = true;
    }

    const url = `/api/selected?offset=${state.rightOffset}&limit=20&filter=${state.rightFilter}`;
    const res = await fetch(url);
    const data = await res.json();

    data.items.forEach(id => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.textContent = id;
        div.draggable = true;
        div.addEventListener('click', () => deselectItem(id));
        div.addEventListener('dragstart', onDragStart);
        div.addEventListener('dragover', onDragOver);
        div.addEventListener('drop', onDrop);
        rightList.appendChild(div);
    });

    state.rightOffset += data.items.length;
    state.rightHasMore = data.hasMore;
    state.isLoadingRight = false;
}

rightList.addEventListener('scroll', () => {
    if (rightList.scrollTop + rightList.clientHeight >= rightList.scrollHeight - 10) {
        loadRightItems();
    }
});

rightFilterInput.addEventListener('input', () => {
    state.rightFilter = rightFilterInput.value;
    loadRightItems(true);
});

// ========== ВЫБОР И СНЯТИЕ ==========

async function selectItem(id) {
    await fetch('/api/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    loadLeftItems(true);
    loadRightItems(true);
}

async function deselectItem(id) {
    await fetch('/api/deselect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    loadLeftItems(true);
    loadRightItems(true);
}

// ========== DRAG & DROP ==========

let draggedId = null;

function onDragStart(e) {
    draggedId = parseInt(e.target.textContent);
    e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

async function onDrop(e) {
    e.preventDefault();
    const targetId = parseInt(e.target.textContent);
    if (draggedId === targetId) return;

    // Определяем новую позицию (пока просто меняем местами)
    // Отправляем на сервер: перетаскиваемый элемент получает позицию цели
    await fetch('/api/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggedId, newPosition: targetId }),
    });

    draggedId = null;
    loadRightItems(true);
}

// ========== ДОБАВЛЕНИЕ ЭЛЕМЕНТА ==========

addBtn.addEventListener('click', async () => {
    const id = parseInt(newIdInput.value);
    if (isNaN(id)) return;

    await fetch('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });

    newIdInput.value = '';
    loadLeftItems(true);
});

// ========== ПЕРВАЯ ЗАГРУЗКА ==========

loadLeftItems();
loadRightItems();