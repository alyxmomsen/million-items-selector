class ItemStore {

    addItem (id) {
        this.#allItems.add(id);
    }

    getItems (offset=0, limit=20, filter='') {
        let items = [...this.#allItems];

        items = items.filter(id => !this.#selectedItems.has(id));

        if (filter) {
            items = items.filter(id => String(id).includes(filter));
        }

        const total = items.length;
        const slice = items.slice(offset, offset + limit);

        return {
            items:slice,
            total,
            hasMore:offset + limit < total,
        }
    }

    getSelectedItems (offset=0, limit=20, filter='') {
        let items = [...this.#selectedItems.entries()].sort((entryA, entryB) => entryA[1] - entryB[1]).map(entry => entry[0]);

        if (filter) {
            items = items.filter(id => String(id).includes(filter));
        }

        const total = items.length;
        const slice = items.slice(offset, offset + limit);

        return {
            items:slice,
            total,
            hasMore:offset + limit < total,
        }

    }

    selectItem (id) {

        if (!this.#allItems.has(id)) return;
        if (this.#selectedItems.has(id)) return;
        const newItemPosition = this.#selectedItems.size + 1;
        this.#selectedItems.set(id, newItemPosition);
    }

    deselectItem (id) {
        this.#selectedItems.delete(id);
    }

    reorderItems (targetId, newPosition) {

        if(!this.#selectedItems.has(targetId)) return;

        const Actions = {
            moveItemDown ,
            moveItemUp ,
        }

        const oldPosition = this.#selectedItems.get(targetId);

        if (oldPosition === newPosition) return;

        for (const [itemId, itemPosition] of this.#selectedItems.entries()) {
            if(itemId === targetId) continue;

            if (newPosition > oldPosition) {
                if (itemPosition > oldPosition && itemPosition <= newPosition) {
                    this.#selectedItems.set(itemId, itemPosition - 1);
                }
            }
            else {
                if (itemPosition < oldPosition && itemPosition >= newPosition) {
                    this.#selectedItems.set(itemId, itemPosition + 1);
                }
            }
        }

        this.#selectedItems.set(targetId, newPosition);

        function moveItemUp () {
            
        }

        function moveItemDown () {

        }

    }

    /**
     * 
     * @param {number} draggedId 
     * @param {number} targetId 
     */
    reorderByTargetId (draggedId, targetId) {
        const targetPosition = this.#selectedItems.get(targetId);
        if (targetPosition === undefined) return;
        this.reorderItems(draggedId, targetPosition);
    }

    #allItems;
    #selectedItems;

    // batching

    queueSelect (id) {
        const key = String(id);
        if (!this.#selectSet.has(key)) return;
        this.#selectSet.add(key);
        this.#selectQueue.push(id);
    }

    queueDeselect () {
        const key = String(id);
        if (!this.#deselectSet.has(key)) return
        this.#deselectSet.add(key);
        this.#deselectQueue.push(id);
    }

    queueAdd () {
        const key = String(id);
        if (!this.#addSet.has(key)) return;
        this.#addSet.add(key);
        this.#addQueue.push(id);
    }

    #startBatching () {

        setInterval(() => {
            while (this.#selectQueue.length > 0) {
                const id = this.#selectQueue.shift();
                this.#selectSet.delete(String(id));
                this.selectItem(id);
            }
    
            while (this.#deselectQueue.length > 0) {
                const id = this.#deselectQueue.shift()
                this.#deselectSet.delete(String(id));
                this.deselectItem(id);
            }
        }, 1000) 
        setInterval(() => {
            while(this.#addQueue.length > 0) {
                const id = this.#addQueue.shift();
                this.#addSet.delete(String(id));
                this.addItem(id);
            }
        }, 10000)
    }

    #selectQueue;
    #selectSet;
    #deselectQueue;
    #deselectSet;
    #addQueue;
    #addSet;
    
    constructor () {
        this.#allItems = new Set();

        for (let i=1; i<1_000_000; i++) {
            this.#allItems.add(i);
        }

        this.#selectedItems = new Map();

        // batching

        this.#selectQueue = [];
        this.#selectSet = new Set();

        this.#deselectQueue = [];
        this.#deselectSet = new Set();

        this.#addQueue = [];
        this.#addSet = new Set();

        this.#startBatching();

    }
    
}

module.exports = new ItemStore();
