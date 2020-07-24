const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.listen(3000, function () {
    console.log("Server started on port 3000")
});


let dateArray = ["June 1 - 7", "June 8 - 14", "June 15 - 21", "June 22 - 28"];

app.get("/", function (req, res) {
    res.render("index", { dateArray: dateArray });
});