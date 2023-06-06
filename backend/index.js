const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv");
const pinRoute = require("./routes/pins");
const userRoute = require("./routes/users");
const commentRoute = require("./routes/comments");


var cors = require('cors')

app.use(cors())

dotenv.config();

app.use(express.json());

mongoose 
.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true   
})   
 .then(() => console.log("MongoDB connected!"))
 .catch(err => console.log(err));

app.use("/api/pins", pinRoute)
app.use("/api/users", userRoute)
app.use("/api/comments", commentRoute);




app.listen(5000, ()=>{
    console.log("Backend server is running !");
})
