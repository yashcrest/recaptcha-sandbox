const express = require('express');
const app = express();
const port = 3000 || process.env.PORT


//body parser middleware, since express now comes with body-parser middle by default we don't need to use the body-parser npm package.
app.use(express.json());

//handling the post request from client
app.post('/submit-form' , async (req, res) => {
    
})


app.listen(port, () => console.log(`Server running port ${port}`));