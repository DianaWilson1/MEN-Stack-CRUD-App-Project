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
  res.render("index.ejs", { icecreams, dec: null });
});

app.get("/all/index", async (req, res) => {
  const icecreams = await IceCream.find();
  res.render("all/index.ejs", { icecreams, dec: null });
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

app.get("/all/show/:decId", async (req, res) => {
  if (!validateObjectId(req.params.decId)) {
    return res.status(400).send("Invalid ObjectId");
  }

  const foundDec = await IceCream.findById(req.params.decId);
  res.render("all/show.ejs", { icecreams: [], icecream: foundDec || null });
});

app.get("/all/edit/:decId", async (req, res) => {
  try {
    const foundDec = await IceCream.findById(req.params.decId);
    if (!foundDec) {
      return res.status(404).send("Not Found");
    }
    res.render("all/edit.ejs", { icecream: foundDec });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.delete("/all/:decId", async (req, res) => {
  if (!validateObjectId(req.params.decId)) {
    return res.status(400).send("Invalid ObjectId");
  }

  await IceCream.findByIdAndDelete(req.params.decId);
  res.redirect("/all/index");
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

  await IceCream.findByIdAndUpdate(req.params.decId, req.body);
  // res.redirect(`/all/${req.params.decId}`);
});

// Route for the menu page
app.get("/menu", async (req, res) => {
  const icecreams = await IceCream.find();
  res.render("menu.ejs", { icecreams }); // Render the menu.ejs with ice cream data
});

// Route for the support page
app.get("/support", (req, res) => {
  res.render("support.ejs"); // Render the support.ejs page
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
