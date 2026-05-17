


// Состояние
const state = {
    leftOffset: 0,
    rightOffset: 0,
    leftFilter: '',
    rightFilter: '',
    leftHasMore: true,
    rightHasMore: true,
    isLoading: false,
};

// DOM-элементы
const leftList = grabDOMElement('left-list');
const rightList = grabDOMElement('right-list');
const leftFilterInput = grabDOMElement('left-filter');
const rightFilterInput = grabDOMElement('right-filter');
const newIdInput = grabDOMElement('new-id');
const addBtn = grabDOMElement('add-btn');

// Загрузка элементов для левого окна
async function loadLeftItems(reset = false) {
    if (state.isLoading) return;
    if (!state.leftHasMore && !reset) return;

    state.isLoading = true;
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
    state.isLoading = false;
}

// Инфинити-скролл для левого окна
leftList.addEventListener('scroll', () => {
    if (leftList.scrollTop + leftList.clientHeight >= leftList.scrollHeight - 10) {
        loadLeftItems();
    }
});

// Фильтрация левого окна
leftFilterInput.addEventListener('input', () => {
    state.leftFilter = leftFilterInput.value;
    loadLeftItems(true);
});

// Первая загрузка
loadLeftItems();


function grabDOMElement(id) {
    
    const element = document.getElementById(id);

    if (!element) throw new Error(`DOM element is not exist`);

    return element;

}