const express = require("express");

const itemsController = require("../controllers/items.controller");

const router = express.Router();

router.get("/hello", itemsController.getItems);

module.exports = { router };
