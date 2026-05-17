const express = require("express");

const itemsController = require("../controllers/items.controller");

const items = express.Router();

items.get("/hello", itemsController.getItems);




module.exports = { items };
