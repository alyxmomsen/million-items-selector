const itemStore = require('../services/itemStore');
const { HandlerDecorator } = require('../utils/handler-decorator');

const getItems = HandlerDecorator(async (ctx) => {
    const { query } = ctx;
    const offset = parseInt(query.offset) || 0;
    const limit = Math.min(parseInt(query.limit) || 20, 20);
    const filter = query.filter || '';
    ctx.res.json(itemStore.getItems(offset, limit, filter));
});

const getSelected = HandlerDecorator(async (ctx) => {
    const { query } = ctx;
    const offset = parseInt(query.offset) || 0;
    const limit = Math.min(parseInt(query.limit) || 20, 20);
    const filter = query.filter || '';
    ctx.res.json(itemStore.getSelected(offset, limit, filter));
});

const selectItem = HandlerDecorator(async (ctx) => {
    const { id } = ctx.req.body;
    if (id === undefined) {
        return ctx.res.status(400).json({ error: 'id required' });
    }
    // itemStore.selectItem(Number(id));
    itemStore.queueSelect(Number(id));
    ctx.res.json({ ok: true });
});

const deselectItem = HandlerDecorator(async (ctx) => {
    const { id } = ctx.req.body;
    if (id === undefined) {
        return ctx.res.status(400).json({ error: 'id required' });
    }
    // itemStore.deselectItem(Number(id));
    itemStore.queueDeselect(Number(id));
    ctx.res.json({ ok: true });
});

const reorderItems = HandlerDecorator(async (ctx) => {
    const { id, newPosition } = ctx.req.body;
    if (id === undefined || newPosition === undefined) {
        return ctx.res.status(400).json({ error: 'id and newPosition required' });
    }
    // itemStore.reorderItems(Number(id), Number(newPosition));
    itemStore.reorderByTargetId(Number(id), Number(newPosition));
    ctx.res.json({ ok: true });
});

const addItem = HandlerDecorator(async (ctx) => {
    const { id } = ctx.req.body;
    if (id === undefined) {
        return ctx.res.status(400).json({ error: 'id required' });
    }
    // itemStore.addItem(Number(id));
    itemStore.queueAdd(Number(id));
    ctx.res.json({ ok: true });
});

/* --- */

const waitForUpdates = HandlerDecorator(async (ctx) => {
    const lastTimestamp = parseInt(ctx.query.lastTimestamp) || 0;
    const result = await itemStore.waitForUpdate(lastTimestamp);
    ctx.res.json(result);
});

module.exports = { getItems, getSelected, selectItem, deselectItem, reorderItems, addItem, waitForUpdates };