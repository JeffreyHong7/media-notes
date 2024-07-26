import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";

// initialize important variables
const app = express();
const port = 3000;

// initialize middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// initialize route-handlers/additional middleware

// start server
app.listen(port, () => {
  console.log(`Listening in on Port ${port}`);
});
