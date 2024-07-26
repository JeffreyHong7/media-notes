import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";

// initialize important variables
const app = express();
const port = 3000;
const URL = "https://www.omdbapi.com";
const apiKey = "1bf76971";
const client = new pg.Client({
  user: "postgres",
  password: "Jalapeno.70",
  host: "localhost",
  port: 5432,
  database: "media-notes",
});
client.connect();

// initialize helpers
function formatDate(date) {
  const year = date.slice(-4);
  const day = date.slice(0, 2);
  let month = date.slice(3, 6);
  switch (month) {
    case "Jan":
      month = "01";
      break;
    case "Feb":
      month = "02";
      break;
    case "Mar":
      month = "03";
      break;
    case "Apr":
      month = "04";
      break;
    case "May":
      month = "05";
      break;
    case "Jun":
      month = "06";
      break;
    case "Jul":
      month = "07";
      break;
    case "Aug":
      month = "08";
      break;
    case "Sep":
      month = "09";
      break;
    case "Oct":
      month = "10";
      break;
    case "Nov":
      month = "11";
      break;
    case "Dec":
      month = "12";
      break;
    default:
      console.log(month);
  }
  return year + "-" + month + "-" + day;
}

// initialize middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// initialize route-handlers/additional middleware
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/add", async (req, res) => {
  try {
    // grab IMDb ID
    const id = req.body.id;
    const response = await axios.get(URL, {
      params: {
        apikey: apiKey,
        i: id,
      },
    });
    // initialize data for record to be inputted into database
    const title = response.data["Title"];
    const releaseDate = formatDate(response.data["Released"]);
    const poster = response.data["Poster"];
    const review = req.body.review;
    const watchDate = req.body.watchDate;
    const rating = parseInt(req.body.rating);
    const showType = req.body.type;
    // query data
    try {
      await client.query("INSERT INTO shows VALUES ($1, $2, $3, $4, $5, $6)", [
        id,
        title,
        releaseDate,
        watchDate,
        poster,
        showType,
      ]);
      try {
        await client.query(
          "INSERT INTO reviews (rating, review, show_id) VALUES ($1, $2, $3)",
          [rating, review, id]
        );
        res.redirect("/");
      } catch (err) {
        console.error("Could not insert data into reviews", err.stack);
      }
    } catch (err) {
      console.error("Could not insert data into shows", err.stack);
    }
  } catch (err) {
    console.error("Could not fetch movie", err.stack);
  }
});

app.get("/delete", async (req, res) => {});
app.get("/edit", async (req, res) => {});

// start server
app.listen(port, () => {
  console.log(`Listening in on Port ${port}`);
});
