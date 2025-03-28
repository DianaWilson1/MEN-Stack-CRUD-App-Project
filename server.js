const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");

const app = express();

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => { });

const Dec = require("./models/dec.js");

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

app.post("/all", async (req, res) => {
  req.body.isReadyToEat = req.body.isReadyToEat === "on";
  req.body.id = req.body.id || new mongoose.Types.ObjectId();
  req.body.name = req.body.name || "Unknown Name";
  req.body.brand = req.body.brand || "Unknown Brand";
  req.body.price = req.body.price || 0;
  req.body.flavor = req.body.flavor || "Vanilla";
  req.body.toppings = req.body.toppings || "None";

  await Dec.create(req.body);
  res.redirect("/all/new");
});

app.get("/", async (req, res) => {
  const allDecs = await Dec.find();
  res.render("index.ejs", { icecreams: allDecs });
});

app.post("/all", async (req, res) => {
  req.body.isReadyToEat = req.body.isReadyToEat === "on";
  req.body.id = req.body.id || new mongoose.Types.ObjectId();
  req.body.name = req.body.name || "Unknown Name";
  req.body.brand = req.body.brand || "Unknown Brand";
  req.body.price = req.body.price || 0;
  req.body.flavor = req.body.flavor || "Chocolate";
  req.body.toppings = req.body.toppings || "Sprinkles";

  await Dec.create(req.body);
  res.redirect("/all");
});

app.get("/all/new", (req, res) => {
  res.render("all/new.ejs");
});

app.get("/all/:decId", async (req, res) => {
  if (!validateObjectId(req.params.decId)) {
    return res.status(400).send("Invalid ObjectId");
  }

  const foundDec = await Dec.findById(req.params.decId);
  if (!foundDec) {
    return res.status(404).send("Not Found");
  }

  res.render("all/index.ejs", { dec: foundDec });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

app.get("/", async (req, res) => {
  res.render("index.ejs");
});

app.delete("/all/:decId", async (req, res) => {
  if (!validateObjectId(req.params.decId)) {
    return res.status(400).send("Invalid ObjectId");
  }

  await Dec.findByIdAndDelete(req.params.decId);
  res.redirect("/all");
});

app.get("/all/:decId/edit", async (req, res) => {
  if (!validateObjectId(req.params.decId)) {
    return res.status(400).send("Invalid ObjectId");
  }

  const foundDec = await Dec.findById(req.params.decId);
  if (!foundDec) {
    return res.status(404).send("Not Found");
  }

  res.render("all/edit.ejs", { dec: foundDec });
});

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

  await Dec.findByIdAndUpdate(req.params.decId, req.body);
  res.redirect(`/all/${req.params.decId}`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  res.render("index.ejs");
});
