// models/fruit.js

const mongoose = require('mongoose');

const iceCreamSchema = new mongoose.Schema({
  flavor: String,
  isReadyToEat: Boolean,
  toppings: String,
});

const IceCream = mongoose.model("IceCream", iceCreamSchema); // create model

module.exports = IceCream;
