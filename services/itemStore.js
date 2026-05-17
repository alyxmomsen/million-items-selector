class ItemStore {
    /**
     *
     * @param {number} offset
     * @param {number} limit
     * @param {string} filter
     * @returns
     */
    getItems(offset = 0, limit = 20, filter = "") {
        let items = [...this.#allItems];

        items = items.filter((id) => !this.#selectedItems.has(id));

        if (filter) {
            items = items.filter((id) => String(id).includes(filter));
        }

        const total = items.length;

        const slice = items.slice(offset, offset + limit);

        return {
            items: slice,
            total,
            hasMore: offset + limit < total,
        };
    }

    /**
     *
     * @param {number} offset
     * @param {number} limit
     * @param {string} filter
     * @returns
     */
    getSelected(offset = 0, limit = 20, filter = "") {
        let items = [...this.#selectedItems.entries()]
            .sort((a, b) => a[1] - b[1])
            .map((entry) => entry[0]);

        if (filter) {
            items = items.filter((id) => String(id).includes(filter));
        }

        const total = items.length;

        const slice = items.slice(offset, offset + limit);

        return {
            items: slice,
            total,
            hasMore: offset + limit < total,
        };
    }

    /**
     *
     * @param {number} id
     * @returns
     */
    selectItem(id) {
        if (!this.#allItems.has(id)) return;
        if (this.#selectedItems.has(id)) return;
        const position = this.#selectedItems.size;
        this.#selectedItems.set(id, position + 1);
    }

    /**
     *
     * @param {number} id
     */
    deselectItem(id) {
        this.#selectedItems.delete(id);
    }

    /**
     *
     * @param {number} targetId
     * @param {number} newPosition
     */
    reorderItems(targetId, newPosition) {
        const Args = {
            id: targetId,
            position: newPosition,
        };

        if (!this.#selectedItems.has(Args.id)) return;

        const oldPosition = this.#selectedItems.get(Args.id);

        if (oldPosition === Args.position) return;

        for (const [itemId, position] of this.#selectedItems.entries()) {
            const CurrentIteration = {
                position,
                id: itemId,
            };

            if (CurrentIteration.id === Args.id) continue;

            if (Args.position > oldPosition) {
                if (
                    CurrentIteration.position > oldPosition &&
                    CurrentIteration.position <= newPosition
                ) {
                    this.#selectedItems.set(
                        CurrentIteration.id,
                        CurrentIteration.position - 1,
                    );
                }
            } else {
                if (
                    CurrentIteration.position >= newPosition &&
                    CurrentIteration.position < oldPosition
                ) {
                    this.#selectedItems.set(
                        CurrentIteration.id,
                        CurrentIteration.position + 1,
                    );
                }
            }
        }

        this.#selectedItems.set(Args.id, Args.position);
    }

    reorderByTargetId(draggedId, targetId) {
        const targetPosition = this.#selectedItems.get(targetId);
        if (targetPosition === undefined) return;
        this.reorderItems(draggedId, targetPosition);
    }

    /**
     * @type {Map<number,number>}
     */
    #selectedItems;

    /**
     * @type {Set<number>}
     */
    #allItems;

    // ========== ОЧЕРЕДИ С ДЕДУПЛИКАЦИЕЙ ==========

    #selectQueue = [];
    #deselectQueue = [];
    #addQueue = [];
    #selectSet = new Set();
    #deselectSet = new Set();
    #addSet = new Set();

    queueSelect(id) {
        const key = String(id);
        if (!this.#selectSet.has(key)) {
            this.#selectSet.add(key);
            this.#selectQueue.push(id);
        }
    }

    queueDeselect(id) {
        const key = String(id);
        if (!this.#deselectSet.has(key)) {
            this.#deselectSet.add(key);
            this.#deselectQueue.push(id);
        }
    }

    queueAdd(id) {
        const key = String(id);
        if (!this.#addSet.has(key)) {
            this.#addSet.add(key);
            this.#addQueue.push(id);
        }
    }

    #startBatching() {
        // Каждую секунду — обрабатываем select и deselect
        setInterval(() => {
            while (this.#selectQueue.length > 0) {
                const id = this.#selectQueue.shift();
                this.#selectSet.delete(String(id));
                this.selectItem(id);
            }
            while (this.#deselectQueue.length > 0) {
                const id = this.#deselectQueue.shift();
                this.#deselectSet.delete(String(id));
                this.deselectItem(id);
            }
        }, 1000);

        // Каждые 10 секунд — обрабатываем add
        setInterval(() => {
            while (this.#addQueue.length > 0) {
                const id = this.#addQueue.shift();
                this.#addSet.delete(String(id));
                this.addItem(id);
            }
        }, 10000);
    }

    constructor() {
        this.#allItems = new Set();

        for (let id = 1; id <= 1_000_000; id++) {
            this.#allItems.add(id);
        }

        this.#selectedItems = new Map();

        this.#startBatching();
    }
}

module.exports = new ItemStore();
