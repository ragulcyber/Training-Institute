const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/images',express.static('images'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html')); 
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html')); 
    
});

//register
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        password1: req.body.password1
    }

    const existingUser = await collection.findOne({ name: data.name });
    const existingEmail = await collection.findOne({ email: data.email });
    if (existingUser) {
        res.send("User already exists.");
    } 
    else if(existingEmail){
        res.send("Email already exists.");
    }
    else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        const userdata = await collection.insertMany(data);
        res.sendFile(path.join(__dirname, 'views', 'login.html')); 
        console.log(userdata);
   
    }
  
});

//login
app.post("/login", async (req, res) => {
    try {
        const user = await collection.findOne({ email: req.body.email });
        if (!user) {
             return res.send("Email not found.");
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch) {
            res.sendFile(path.join(__dirname, 'views', 'home.html')); 
        } else {
            res.send("Wrong Password");
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred.");
    }
});

const port = 4014;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
