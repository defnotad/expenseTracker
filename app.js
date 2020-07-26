const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const lodash = require("lodash");
// const index = require(__dirname + "/index.js");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/expenseTrackerDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const dateSchema = {
    monthName: String,
    range: String,
};

const Date = mongoose.model("Date", dateSchema);

const date1 = new Date({
    monthName: "June",
    range: "1 - 7",
});
const date2 = new Date({
    monthName: "June",
    range: "8 - 14",
});
const date3 = new Date({
    monthName: "June",
    range: "15 - 21",
});
const date4 = new Date({
    monthName: "June",
    range: "22 - 28",
});
const date5 = new Date({
    monthName: "June",
    range: "29 -",
});

const defaultDates = [date1, date2, date3, date4, date5];


const vendorSchema = {
    name: String,
    tag: String,
    expense: {
        amount: [Number],
    },
};

const VendorExpenditure = mongoose.model("VendorExpenditure", vendorSchema);

const vendorExpenditure1 = VendorExpenditure({
    name: "Vendor 1",
    tag: "Salary",
    expense: {
        amount: [14000, 0, 0, 0, 0],
    },
});

const vendorExpenditure2 = VendorExpenditure({
    name: "Vendor 2",
    tag: "Raw Materials",
    expense: {
        amount: [4878, 0, 0, 0, 0],
    },
});

const editingVendor = [false, false, false, false, false];

const defaultVendors = [vendorExpenditure1, vendorExpenditure2];

app.get("/", function (req, res) {
    Date.find({}, function (err, dateResults) {
        if (dateResults.length == 0) {
            Date.insertMany(defaultDates, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Added");
                }
            });
        }
        VendorExpenditure.find({}, function (err, vendorResults) {
            if (vendorResults.length == 0) {
                VendorExpenditure.insertMany(defaultVendors, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Vendors added");
                    }
                });
            }
            res.render("index", { dateArray: dateResults, vendorResults: vendorResults });
        });
    });
});

app.post("/", function (req, res) {
    const vendorName = req.body.vendorName;
    const vendorTag = req.body.vendorTag;
    const newValue = req.body.newValue;
    const valIndex = req.body.valueIndex;
    let amountArray;
    VendorExpenditure.findOne({name: vendorName, tag: vendorTag}, function (err, result) {
        if(err) {
            console.log(err);
        } else {
            amountArray = result.expense.amount;
            amountArray[valIndex] = newValue;
            VendorExpenditure.findOneAndUpdate({name: vendorName, tag: vendorTag}, {'expense.amount': amountArray}, function (err) {
                if(err) {
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


app.listen(3000, function () {
    console.log("Server started on port 3000")
});