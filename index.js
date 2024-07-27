import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";

/*--------------------- initialize important variables ------------------------*/
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
let checkedType = "both";
let checkedOrder = "rating";
let direction = "DESC";

/*--------------------- initialize helpers -----------------------------------*/
// format date retrieved from API for database input
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

// extract date from database record and format as necessary
function extractDate(date) {
  const dateString = date.toString();
  return dateString.slice(4, 10) + "," + dateString.slice(10, 15);
}

/*--------------------- initialize middleware --------------------------------*/
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

/*------------ initialize route-handlers/additional middleware ---------------*/
app.get("/", async (req, res) => {
  try {
    const where =
      checkedType === "both" ? "" : "WHERE type = '" + checkedType + "' ";
    direction = checkedOrder === "title" ? "ASC" : "DESC";
    const result = await client.query(
      "SELECT * FROM reviews JOIN media ON imdb_id = show_id " +
        where +
        "ORDER BY " +
        checkedOrder +
        " " +
        direction
    );
    res.render("index.ejs", {
      media: result.rows,
      extractDate,
      checkedType,
      checkedOrder,
    });
  } catch (err) {
    console.error(
      "Error Cause: Error retrieving data from media-notes \n",
      err.stack
    );
  }
});

app.post("/create", async (req, res) => {
  if (req.body.id) {
    const id = req.body.id;
    const result = await client.query(
      "SELECT * FROM reviews JOIN media ON show_id = imdb_id WHERE imdb_id = $1",
      [id]
    );
    res.render("create.ejs", { edit: result.rows[0] });
  } else {
    res.render("create.ejs");
  }
});

app.post("/", async (req, res) => {
  try {
    checkedType = req.body.type;
    checkedOrder = req.body.order;
    const where =
      checkedType === "both" ? "" : "WHERE type = '" + checkedType + "' ";
    direction = checkedOrder === "title" ? "ASC" : "DESC";
    const result = await client.query(
      "SELECT * FROM reviews JOIN media ON imdb_id = show_id " +
        where +
        "ORDER BY " +
        req.body.order +
        " " +
        direction
    );
    res.render("index.ejs", {
      media: result.rows,
      extractDate,
      checkedType,
      checkedOrder,
    });
  } catch (err) {
    console.error("Error Cause: Cannot filter media \n", err.stack);
  }
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
      await client.query("INSERT INTO media VALUES ($1, $2, $3, $4, $5, $6)", [
        id,
        title,
        releaseDate,
        watchDate,
        poster,
        showType,
      ]);
      try {
        await client.query("INSERT INTO reviews VALUES ($1, $2, $3)", [
          rating,
          review,
          id,
        ]);
        res.redirect("/");
      } catch (err) {
        console.error(
          "Error Cause: Could not insert data into reviews \n",
          err.stack
        );
        res.render("create.ejs", { error: "duplicate media not allowed" });
      }
    } catch (err) {
      console.error(
        "Error Cause: Could not insert data into media \n",
        err.stack
      );
      res.render("create.ejs", { error: "duplicate media not allowed" });
    }
  } catch (err) {
    console.error("Error Cause: Could not fetch movie \n", err.stack);
    res.render("create.ejs", { error: "invalid IMDb ID" });
  }
});

app.post("/edit", async (req, res) => {
  try {
    // grab IMDb ID
    const id = req.body.id;
    // initialize data for record to be updated in database;
    const review = req.body.review;
    const watchDate = req.body.watchDate;
    const rating = parseInt(req.body.rating);
    const showType = req.body.type;
    // query data
    try {
      await client.query(
        "UPDATE media SET watch_date = $1, type = $2 WHERE imdb_id = $3",
        [watchDate, showType, id]
      );
      try {
        await client.query(
          "UPDATE reviews SET rating = $1, review = $2 WHERE show_id = $3",
          [rating, review, id]
        );
        res.redirect("/");
      } catch (err) {
        console.error(
          "Error Cause: Could not update data in reviews \n",
          err.stack
        );
      }
    } catch (err) {
      console.error(
        "Error Cause: Could not update data in media \n",
        err.stack
      );
    }
  } catch (err) {
    console.error("Error Cause: Could not fetch movie \n", err.stack);
  }
});

app.post("/delete", async (req, res) => {
  try {
    const id = req.body.id;
    await client.query("DELETE FROM reviews WHERE show_id = $1", [id]);
    await client.query("DELETE FROM media WHERE imdb_id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error("Error Cause: Could not delete media \n", err.stack);
  }
});

/*---------------------------- start server ----------------------------------*/
app.listen(port, () => {
  console.log(`Listening in on Port ${port}`);
});
