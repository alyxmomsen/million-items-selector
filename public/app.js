
/**
 * @typedef {Object} DOMElements
 * @property {HTMLElement} DOMElements.leftList
 * @property {HTMLElement} DOMElements.rightList
 * @property {HTMLElement} DOMElements.leftFilterInput
 * @property {HTMLElement} DOMElements.rightFilterInput
 * @property {HTMLElement} DOMElements.newIdInput
 * @property {HTMLElement} DOMElements.addBtn
 */


const State = {
    leftOffset: 0,
    rightOffset: 0,
    leftFilter: '',
    rightFilter: '',
    leftHasMore: true,
    rightHasMore: true,
    isLoadingLeft: false,
    isLoadingRight: false,

    lastUpdate:0,
};

document.addEventListener('DOMContentLoaded', () => {

    const DOMElements = {
        leftList : grabDOMElement('left-list'),
        rightList : grabDOMElement('right-list'),
        leftFilterInput : grabDOMElement('left-filter'),
        rightFilterInput : grabDOMElement('right-filter'),
        newIdInput : grabDOMElement('new-id'),
        addBtn : grabDOMElement('add-btn'),
    }

    async function loadLeftItems (reset = false) {
    
        if (State.isLoadingLeft) return;
        if (!State.leftHasMore && !reset) return;

        State.isLoadingLeft = true;

        if (reset) {
            State.leftHasMore = true;
            State.leftOffset = 0;
            DOMElements.leftList.innerHTML = '';
        }

        const url = `/api/items?$offset=${State.leftOffset}&limit=${20}&filter=${State.leftFilter}`;

        const res = await fetch (url) ;

        const data = await res.json();

        data.items.forEach(id => {

            const div = document.createElement("div");
            div.className = 'list-item';
            div.textContent = id;
            div.addEventListener('click', () => selectItem(id));

            DOMElements.leftList.appendChild(div);
        });

        State.leftOffset += data.items.length;
        State.leftHasMore = data.hasMore;
        State.isLoadingLeft = false;
    }

    DOMElements.leftList.addEventListener('scroll', () => {
        if (DOMElements.leftList.scrollTop + DOMElements.leftList.clientHeight >= DOMElements.leftList.scrollHeight - 10) {
            loadLeftItems();
        }
    });

    DOMElements.leftFilterInput.addEventListener('input', () => {
        State.leftFilter = DOMElements.leftFilterInput.value;
        loadLeftItems(true);
    });


    async function loadRightItems (reset = false) {
        if (State.isLoadingRight) return;
        if (!State.rightHasMore && !reset) return;

        State.isLoadingRight = true;

        if (reset) {
            State.rightOffset = 0;
            State.rightHasMore = true;
            DOMElements.rightList.innerHTML = '';
        }

        const url = `/api/selected?offset=${State.rightOffset}&limit=${20}&filter=${State.rightFilter}`;
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

            DOMElements.rightList.appendChild(div);
        });

        State.leftOffset += data.items.lenght;
        State.rightHasMore = data.hasMore; 
        State.isLoadingRight = false;
    }

    DOMElements.rightList.addEventListener('scroll', () => {
        if (DOMElements.rightList.scrollTop + DOMElements.rightList.clientHeight >= DOMElements.rightList.scrollHeight - 10) {
            loadRightItems();
        }
    });

    DOMElements.rightFilterInput.addEventListener('input', () => {
        State.rightFilter = DOMElements.rightFilterInput.value;
        loadRightItems(true);
    });

    // select / deselect

    async function selectItem (id) {
        await fetch(`/api/select`, {
            method:'post',
            headers:{
                'content-type':'application/json',
            },
            body:JSON.stringify({ id }),
        });
        // loadLeftItems(true);
        // loadRightItems(true);
        waitForUpdateAndRefrash();
    }

    async function deselectItem (id) {
        await fetch(`/api/deselect`, {
            method:'post',
            headers:{
                'content-type':'application/json',
            },
            body:JSON.stringify({id}),
        });
        // loadLeftItems(true);
        // loadRightItems(true);
        waitForUpdateAndRefrash();
    }

    // drag and drop

    const DragNDropState =  {
        draggedId:null,
    }

    let draggedId = null;

    /**
     * 
     * @param {DragEvent} e 
     */
    function onDragStart (e) {
        DragNDropState.draggedId = parseInt(e.target.textContent);
        e.dataTransfer.effectAllowed = 'move';
    }

    /**
     * 
     * @param {DragEvent} e 
     */
    function onDragOver (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * 
     * @param {DragEvent} e 
     */
    async function onDrop (e) {
        e.preventDefault();
        const draggedId = DragNDropState.draggedId;
        const targetId = parseInt(e.target.textContent);

        if (draggedId === targetId) return;

        await fetch(`/api/reorder`, {
            method:'POST',
            headers:{
                'content-type':'application/json',
            },
            body:JSON.stringify({ draggedId, targetId }),
        });

        DragNDropState.draggedId = null;
        loadRightItems(true);
    }

    // add id


    DOMElements.addBtn.addEventListener('click', async (e) => {
        const id = parseInt(DOMElements.newIdInput.value);
        if (isNaN(id)) return;

        await fetch(`/api/add`, {
            method:'post',
            headers:{
                'content-type':'application/json',
            },
            body:JSON.stringify({ id }),
        });
        DOMElements.newIdInput.value = '';
        loadLeftItems(true);

    });


    // DOMElements.rightList.addEventListener('dragover', (e) => e.preventDefault());
    loadLeftItems(true);
    loadRightItems(true);

    async function waitForUpdateAndRefrash () {

        const res = await fetch (`/api/updates?lastTimestamp=${State.lastUpdate || 0}`);
        const data = await res.json();

        if (data.updated) {
            State.lastUpdate = data.timestamp,
            loadLeftItems(true);
            loadRightItems(true);
        }
    }
});

/**
 * 
 * @param {string} id 
 * @returns {HTMLElement}
 */
function grabDOMElement(id) {
    const element = document.getElementById(id);
    if (element === null) throw new Error(`element is not not found`);
    return element;
}

/**
 * 
 * @param {Object} deps 
 * @param {DOMElements} deps.domElements 
 * @returns 
 */
function LoadLeftList (deps = {}) {

    if (!deps.domElements) throw new Error(`deps.domElements required`);

    const fn = async function (reset = false) {
    
        if (State.isLoadingLeft) return;
        if (!State.leftHasMore && !reset) return;

        State.isLoadingLeft = true;

        if (reset) {
            State.leftHasMore = true;
            State.leftOffset = 0;
            deps.domElements.leftList.innerHTML = '';
        }

        const url = `/api/items?offset=${State.leftOffset}&limit=${20}&`

    }

    return fn;
}