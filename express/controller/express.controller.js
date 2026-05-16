const { IncomingMessage, ServerResponse } = require("http");
const { expressApp } = require("../model/express.model");

expressApp.get("/foo", (req, res, next) => {});

function HandlerDecorator(handler, deps) {
  const fn = async (req, res, next) => {
    await handler({ req, res, params: req.params || {}, query: req.query || {} }, next);
  };

  return fn;
}
