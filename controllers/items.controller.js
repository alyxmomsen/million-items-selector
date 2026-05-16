const { HandlerDecorator } = require("../utils/handler-decorator");

const getItems = HandlerDecorator(async (ctx) => {

    



    ctx.res.end("getting items");
});

module.exports = { getItems };
