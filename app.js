require('dotenv').config();
const express = require('express');
const path = require("path");

const carmodelsRouter = require('./node_scripts/routes/carmodels');
const employeesRouter = require('./node_scripts/routes/employees');
const viewsRouter = require('./node_scripts/routes/views');
const salesRouter = require('./node_scripts/routes/sales');
const profileRouter = require('./node_scripts/routes/profile');

const app = express();

// Use respective router js file to handle all the specific endpoints
app.use("/views", viewsRouter);
app.use("/carmodels", carmodelsRouter);
app.use("/employees", employeesRouter);
app.use("/sales", salesRouter);
app.use("/profile", profileRouter);

// Handle static files in public dir
app.use(express.static("./public"));

// Serving index.html on GET at root
app.get("/", (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

// Setting up server
const port = process.env.PORT || 4001
let server = app.listen(port, () => {
  let port = server.address().port;
  console.log("Listening on port", port);
});

