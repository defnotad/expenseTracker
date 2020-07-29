require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const lodash = require("lodash");
const encryption = require("mongoose-encryption");
const md5 = require("md5");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-aditya:Aditya1007@cluster0.3qnto.mongodb.net/expenseTrackerDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const expenditureSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    vendorDetails: [{
        name: String,
        tag: String,
        expenditure: [
            {
                month: String,
                spending: [
                    {
                        dates: String,
                        amount: Number,
                    }
                ],
            }
        ],
    },
    ],
});

const Expenditure = new mongoose.model("expenditure", expenditureSchema);



const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = new mongoose.model("user", userSchema);

const monthList = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
const dateList = ["1 - 7", "8 - 14", "15 - 21", "22 - 28", "28 -"];

let defaultArray = [];

for (let i = 0; i < monthList.length; i++) {
    let newDoc = [];
    for (let j = 0; j < dateList.length; j++) {
        const newDocInput = {
            dates: dateList[j],
            amount: 0,
        };
        newDoc.push(newDocInput);
    }
    const newEntry = {
        month: monthList[i],
        spending: newDoc
    };
    defaultArray.push(newEntry);
}

let USERNAME;
let USERID;



app.get("/budget", function (req, res) {
    Expenditure.findOne({ userID: USERID }, function (err, foundResult) {
        if (err) {
            console.log(err);
        } else {
            if (foundResult) {
                const vendorDetails = foundResult.vendorDetails;
                const vendorList = [];
                console.log(vendorDetails);
                for (let i = 0; i < vendorDetails.length; i++) {
                    const currentMonth = vendorDetails[i].expenditure[0].month;
                    if (currentMonth === "Jan") {
                        const amountResult = [];
                        for (let j = 0; j < 5; j++) {
                            amountResult.push(vendorDetails[i].expenditure[0].spending[j].amount);
                        }
                        const vendorListItem = {
                            id: vendorDetails[i].expenditure[0]._id,
                            name: vendorDetails[i].name,
                            tag: vendorDetails[i].tag,
                            amount: amountResult
                        };
                        vendorList.push(vendorListItem);
                    }
                }
                console.log(vendorList);
                res.render("index", {monthName: "Jan", vendorList: vendorList});
            }
        }
    });
});

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/login", function (req, res) {
    res.render("login");
});


app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            User.findOne({ email: req.body.username }, function (err, foundUser) {
                if (err) {
                    console.log(err);
                } else {
                    if (foundUser) {
                        const expenditure = new Expenditure({
                            userID: foundUser._id,
                            vendorDetails: {
                                name: "Vendor",
                                tag: "Salary",
                                expenditure: defaultArray
                            },
                        });
                        expenditure.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                USERNAME = req.body.username;
                                USERID = foundUser._id;
                                res.redirect("/budget");
                            }
                        });
                    }
                }
            });
        }
    });
});

app.post("/login", function (req, res) {
    const email = req.body.username;
    const password = md5(req.body.password);
    User.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password == password) {
                    USERNAME = email;
                    USERID = foundUser._id;
                    res.redirect("/budget");
                }
            }
        }
    });
});




app.post("/budget", function (req, res) {
    const vendorName = req.body.vendorName;
    const vendorTag = req.body.vendorTag;
    const newValue = req.body.newValue;
    const valIndex = req.body.valueIndex;
    let amountArray;
    VendorExpenditure.findOne({ name: vendorName, tag: vendorTag }, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            amountArray = result.expense.amount;
            amountArray[valIndex] = newValue;
            VendorExpenditure.findOneAndUpdate({ name: vendorName, tag: vendorTag }, { 'expense.amount': amountArray }, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/");
                }
            });
        }
    });
});

app.post("/newVendorEntry", function (req, res) {
    const vendorExpenditure = new VendorExpenditure({
        name: "Vendor",
        tag: "Tag",
        expense: {
            amount: [0, 0, 0, 0, 0],
        },
    });
    vendorExpenditure.save();
    res.redirect("/");
});

app.post("/editVendor", function (req, res) {
    const vendorID = req.body.editItem;
});



let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server started succesfully")
});