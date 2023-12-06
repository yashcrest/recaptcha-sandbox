const sqlite3 = require('sqlite3');
const {v4 : uuid} = require('uuid');

//initialize sqlite database
const db = new sqlite3.Database('./mydatabase.db' ,(err) => {
    if (err) {
        console.error(err.message);
    } 
    console.log('Connected to db');
})

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fname TEXT NOT NULL,
        lname TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Table created or already exists');
        }
    })
})

module.exports = db;