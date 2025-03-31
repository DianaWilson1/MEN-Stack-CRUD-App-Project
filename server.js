const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");

const app = express();

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

const IceCream = require("./models/dec.js"); // Standardized model name

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

app.get("/", async (req, res) => {
  const icecreams = await IceCream.find();
  res.render("index.ejs", { icecreams, dec: null }); // Fix, now dec is passed as null
});

app.get("/all/index", async (req, res) => {
  const icecreams = await IceCream.find();
  res.render("all/index.ejs", { icecreams, dec: null }); // Fix, now dec is passed as null
});

app.get("/all/new", (req, res) => {
  res.render("all/new.ejs");
});

app.post("/all", async (req, res) => {
  req.body.isReadyToEat = req.body.isReadyToEat === "on";
  req.body.id = req.body.id || new mongoose.Types.ObjectId();
  req.body.name = req.body.name || "Unknown Name";
  req.body.brand = req.body.brand || "Unknown Brand";
  req.body.price = req.body.price || 0;
  req.body.flavor = req.body.flavor || "Chocolate";
  req.body.toppings = req.body.toppings || "Sprinkles";

  await IceCream.create(req.body);
  res.redirect("/all/index");
});

app.get("/all/:decId", async (req, res) => {
  if (!validateObjectId(req.params.decId)) {
    return res.status(400).send("Invalid ObjectId");
  }

  const foundDec = await IceCream.findById(req.params.decId);
  res.render("all/index.ejs", { icecreams: [], dec: foundDec || null }); // Fix, now dec is passed
});

app.delete("/all/:decId", async (req, res) => {
  if (!validateObjectId(req.params.decId)) {
    return res.status(400).send("Invalid ObjectId");
  }

  await IceCream.findByIdAndDelete(req.params.decId);
  res.redirect("/all/index");
});

// Edit route for ice cream (edit.ejs page)
app.get("/all/:decId/edit", async (req, res) => {
  if (!validateObjectId(req.params.decId)) {
    return res.status(400).send("Invalid ObjectId");
  }

  const foundDec = await IceCream.findById(req.params.decId);
  if (!foundDec) {
    return res.status(404).send("Not Found");
  }
  res.render("all/edit.ejs", { dec: foundDec });

});

// PUT route to update the ice cream data after editing
app.put("/all/:decId", async (req, res) => {
  if (!validateObjectId(req.params.decId)) {
    return res.status(400).send("Invalid ObjectId");
  }

  req.body.isReadyToEat = req.body.isReadyToEat === "on";
  req.body.name = req.body.name || "Unknown Name";
  req.body.brand = req.body.brand || "Unknown Brand";
  req.body.price = req.body.price || 0;
  req.body.flavor = req.body.flavor || "Strawberry";
  req.body.toppings = req.body.toppings || "None";

  await IceCream.findByIdAndUpdate(req.params.decId, req.body);
  res.redirect(`/all/${req.params.decId}`);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
