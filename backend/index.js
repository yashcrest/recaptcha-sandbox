const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();
const app = express();
const path = require("path");
const port = 3000 || process.env.PORT;

//importing db to main file
const db = require("./db");

//adding password hashing npm module
const bcrypt = require("bcrypt");
const saltRounds = 10;

//body parser middleware, since express now comes with body-parser middle by default we don't need to use the body-parser npm package.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//static files middleware
app.use(express.static("public"));

//handling the post request from client
app.post("/submit-form", async (req, res) => {
  const recaptchaToken = req.body["g-recaptcha-response"]; // you can view google documentation for this.
  const secretKey = process.env.SECRET_KEY;

  //verify the token with Google's recaptcha API
  const googleVerifyUrl = "https://www.google.com/recaptcha/api/siteverify";
  const params = new URLSearchParams();
  params.append("secret", secretKey);
  params.append("response", recaptchaToken);

  //sending the api call
  const response = await fetch(googleVerifyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const data = await response.json();
  console.log("data : ", data);

  if (data.success) {
    //inserting data into database
    const { fname, lname, email, password } = req.body;

    try {
      //hashing password before saving in database
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      //SQL query statment
      const sql = `INSERT INTO users (fname, lname, email, password) VALUES(?, ?, ?, ?)`;

      // Inserting data into database
      db.run(sql, [fname, lname, email, hashedPassword], function (err) {
        if (err) {
          console.error(err.message);
          res.status(500).send("database ma save garda error ayo");
        } else {
          console.log(`A row has been inserted with the rowid ${this.lastID}`);
          res.sendFile(path.join(__dirname, "views", "success.html"));
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while hashing the password");
    }
  } else {
    res.sendFile(path.join(__dirname, "views", "failed.html"));
  }
});

//getting data from db
app.get("/get-users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).send("Eror fetching data");
      return;
    }
    res.json(rows);
  });
});

//endpoint to delete the data
app.delete("/delete-user/:id", (req, res) => {
  const userID = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";

  db.run(sql, userID, function (err) {
    if (err) {
      res.status(500).json({ success: false, message: "Error deleting user" });
      return;
    }
    res.json({ success: true, message: `User with ID ${userID} deleted` });
  });
});
app.listen(port, () => console.log(`Server running port ${port}`));
