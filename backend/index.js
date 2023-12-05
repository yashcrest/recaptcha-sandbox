const express = require('express')
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3');
require('dotenv').config();
const app = express();
const path = require('path');
const port = 3000 || process.env.PORT

//body parser middleware, since express now comes with body-parser middle by default we don't need to use the body-parser npm package.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//static files middleware
app.use(express.static('public'));



//initialize sqlite database
const db = new sqlite3.Database('./mydatabase.db' ,(err) => {
    if (err) {
        console.error(err.message);
    } 
    console.log('Connected to db');
})

//db logic
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users(
        id INTEGER KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Table created or already exists');
        }
    })
})




//handling the post request from client
app.post('/submit-form' , async (req, res) => {
    const recaptchaToken = req.body['g-recaptcha-response']; // you can view google documentation for this.
    const secretKey = process.env.SECRET_KEY;


    //verify the token with Google's recaptcha API
    const googleVerifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', recaptchaToken);

    //sending the api call
    const response = await fetch(googleVerifyUrl, {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        body: params
    });
    console.log("response: " , response);
    const data = await response.json();
    console.log("data: " , data);

    if(data.success) {
        // still need to write the logic of saving the form data into DB.
        res.sendFile(path.join(__dirname, 'views', 'success.html'));
    } else {
        res.sendFile(path.join(__dirname, 'views', 'failed.html'));
    }
})


app.listen(port, () => console.log(`Server running port ${port}`));