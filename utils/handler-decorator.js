/**
 *
 * @param {(ctx:{req:import("express").Request; res:import("express").Response, params:Object,query:Object}, next:Function) => Promise<any>} handler
 * @param {Object} deps - deps container
 * @returns {(ctx:{req:import("express").Request; res:import("express").Response, params:Object,query:Object}, next:Function) => Promise<any>}
 */
function HandlerDecorator(handler, deps) {
    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {(req, res, next) => {}} next
     */
    const fn = async (req, res, next) => {
        await handler(
            { req, res, params: req.params || {}, query: req.query || {} },
            next,
        );
    };

    return fn;
}

module.exports = { HandlerDecorator };
