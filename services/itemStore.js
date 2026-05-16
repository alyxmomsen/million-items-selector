class ItemStore {
    /**
     * @type {Set<number>}
     */
    #allItems;
    /**
     * @type {Map<number,number>}
     */
    #selectedItems;

    getSelected(offset = 0, limit = 20, filter = "") {
        let items = [...this.#selectedItems.keys()];

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

    selectItem(id) {
        if (!this.#allItems.has(id)) return;
        if (this.#selectedItems.has(id)) return;
        const position = this.#selectedItems.size + 1;
        this.#selectedItems.set(id, position);
    }

    deselectItem(id) {
        this.#selectedItems.delete(id);
    }

    reorderItems(id, newPosition) {
        if (!this.#selectedItems.has(id)) return;

        const oldPosition = this.#selectedItems.get(id);

        if (oldPosition === newPosition) return;

        for (const [itemId, position] of this.#selectedItems.entries()) {
            if (itemId === id) continue;

            if (newPosition > oldPosition) {
                if (position > oldPosition && position <= newPosition) {
                    this.#selectedItems.set(itemId, position - 1);
                }
            } else {
                if (position >= newPosition && position < oldPosition) {
                    this.#selectedItems.set(itemId, position + 1);
                }
            }
        }

        this.#selectedItems.set(id, newPosition);
    }

    constructor() {
        this.#selectedItems = new Map();
        this.#allItems = new Set();

        for (let i = 1; i <= 1_000_000; i++) {
            this.#allItems.add(i);
        }
    }
}

module.exports = new ItemStore(); // singletone
