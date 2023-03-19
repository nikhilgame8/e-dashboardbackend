require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const upload = multer();

const routes = require("./routes/Routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(upload.array());

mongoose.connect(process.env.DATABASE_URL)
.then(()=>console.log("Connection Successfull"))
.catch((err)=>console.log("Connection failed"));

app.use(routes);

app.listen(PORT, ()=>console.log(`Server running at PORT ${PORT}`));

