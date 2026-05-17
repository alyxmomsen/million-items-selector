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
    itemStore.selectItem(Number(id));
    ctx.res.json({ ok: true });
});

const deselectItem = HandlerDecorator(async (ctx) => {
    const { id } = ctx.req.body;
    if (id === undefined) {
        return ctx.res.status(400).json({ error: 'id required' });
    }
    itemStore.deselectItem(Number(id));
    ctx.res.json({ ok: true });
});

const reorderItems = HandlerDecorator(async (ctx) => {
    const { id, newPosition } = ctx.req.body;
    if (id === undefined || newPosition === undefined) {
        return ctx.res.status(400).json({ error: 'id and newPosition required' });
    }
    itemStore.reorderItems(Number(id), Number(newPosition));
    ctx.res.json({ ok: true });
});

const addItem = HandlerDecorator(async (ctx) => {
    const { id } = ctx.req.body;
    if (id === undefined) {
        return ctx.res.status(400).json({ error: 'id required' });
    }
    itemStore.addItem(Number(id));
    ctx.res.json({ ok: true });
});

module.exports = { getItems, getSelected, selectItem, deselectItem, reorderItems, addItem };