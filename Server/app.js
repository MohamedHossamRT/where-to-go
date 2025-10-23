const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes
const placesRoutes = require("./routes/placeRoutes");
app.use("/api/places", placesRoutes);

module.exports = app;
