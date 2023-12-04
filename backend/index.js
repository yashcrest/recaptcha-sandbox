const express = require('express')
const fetch = require('node-fetch');
require('dotenv').config();
const app = express();
const port = 3000 || process.env.PORT


//body parser middleware, since express now comes with body-parser middle by default we don't need to use the body-parser npm package.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//handling the post request from client
app.post('/submit-form' , async (req, res) => {
    const recaptchaToken = req.body['g-recaptcha-response']; // you can view google documentation for this.
    const secretKey = process.env.SECRET_KEY;


    //verify the token with Google's recaptcha API
    const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify/?secret=${secretKey}&response=${recaptchaToken}`;
    const response = await fetch(googleVerifyUrl, {method: 'POST'});
    console.log(response);
    const data = await response.text();

    if(data.success) {
        // still need to write the logic of saving the form data into DB.
        res.send('Form received and recaptcha verified!')
    } else {
        res.send('recaptcha verification failed');
    }
})


app.listen(port, () => console.log(`Server running port ${port}`));