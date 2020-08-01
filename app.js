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
    vendorDetails: [
        {
            name: String,
            tag: String,
            editing: Boolean,
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



const receivableSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    vendorDetails: [
        {
            name: String,
            tag: String,
            editing: Boolean,
            receivable: [
                {
                    month: String,
                    receiving: [
                        {
                            dates: String,
                            amount: Number,
                        },
                    ],
                },
            ],
        },
    ],
});

const Receivable = new mongoose.model("receivable", receivableSchema);



const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = new mongoose.model("user", userSchema);



const monthList = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
const dateList = ["1 - 7", "8 - 14", "15 - 21", "22 - 28", "28 -"];

let defaultArray = [];
let receivableDefaultArray = [];

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
    const newReceivableEntry = {
        month: monthList[i],
        receiving: newDoc
    };
    defaultArray.push(newEntry);
    receivableDefaultArray.push(newReceivableEntry);
}

let USERNAME;
let USERID;
let monthIndex = 0;



app.get("/budget", function (req, res) {
    if (USERID != null) {
        Expenditure.findOne({ userID: USERID }, function (err, foundResult) {
            if (err) {
                console.log(err);
            } else {
                if (foundResult) {
                    const vendorDetails = foundResult.vendorDetails;
                    const vendorList = [];
                    for (let i = 0; i < vendorDetails.length; i++) {
                        const currentMonth = vendorDetails[i].expenditure[monthIndex].month;
                        if (currentMonth === monthList[monthIndex]) {
                            const amountResult = [];
                            for (let j = 0; j < 5; j++) {
                                amountResult.push(vendorDetails[i].expenditure[monthIndex].spending[j].amount);
                            }
                            const vendorListItem = {
                                id: vendorDetails[i]._id,
                                name: vendorDetails[i].name,
                                tag: vendorDetails[i].tag,
                                amount: amountResult,
                                editing: vendorDetails[i].editing
                            };
                            vendorList.push(vendorListItem);
                        }
                    }
                    vendorsGlobalList = vendorList;
                    Receivable.findOne({ userID: USERID }, function (err, foundReceivableResult) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (foundResult) {
                                const receivableVendorDetails = foundReceivableResult.vendorDetails;
                                const receivableVendorList = [];
                                for (let i = 0; i < receivableVendorDetails.length; i++) {
                                    const currentMonth = receivableVendorDetails[i].receivable[monthIndex].month;
                                    if (currentMonth === monthList[monthIndex]) {
                                        const receivableAmountResult = [];
                                        for (let j = 0; j < 5; j++) {
                                            receivableAmountResult.push(receivableVendorDetails[i].receivable[monthIndex].receiving[j].amount);
                                        }
                                        const receivableVendorListItem = {
                                            id: receivableVendorDetails[i]._id,
                                            name: receivableVendorDetails[i].name,
                                            tag: receivableVendorDetails[i].tag,
                                            amount: receivableAmountResult,
                                            editing: receivableVendorDetails[i].editing,
                                        };
                                        receivableVendorList.push(receivableVendorListItem);
                                    }
                                }
                                receivableVendorsGlobalList = receivableVendorList;
                                res.render("index", { monthName: monthList[monthIndex], vendorList: vendorList, receivableVendorList: receivableVendorList });
                            }
                        }
                    });
                }
            }
        });
    } else {
        res.redirect("/");
    }
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
    User.findOne({ email: req.body.username }, function (err, foundResult) {
        if (foundResult) {
            res.send("User already exists");
        } else {
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
                                        editing: false,
                                        expenditure: defaultArray
                                    },
                                });
                                expenditure.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        USERNAME = req.body.username;
                                        USERID = foundUser._id;
                                        const receivable = new Receivable({
                                            userID: foundUser._id,
                                            vendorDetails: {
                                                name: "Vendor",
                                                tag: "Salary",
                                                editing: false,
                                                receivable: receivableDefaultArray
                                            },
                                        });
                                        receivable.save(function (err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.redirect("/budget");
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
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
            } else {
                res.send("No user found");
            }
        }
    });
});




app.post("/editVendorAmount", function (req, res) {
    const vendorID = req.body.vendorID;
    const valIndex = req.body.valueIndex;
    const newValue = req.body.newValue;
    Expenditure.findOne({ userID: USERID }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            for (let i = 0; i < foundUser.vendorDetails.length; i++) {
                if (foundUser.vendorDetails[i]._id == vendorID) {
                    foundUser.vendorDetails[i].expenditure[monthIndex].spending[valIndex].amount = newValue;
                    foundUser.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.redirect("/budget");
                        }
                    });
                }
            }
        }
    });
});

app.post("/newVendorEntry", function (req, res) {
    Expenditure.findOne({ userID: USERID }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            const newVendor = {
                name: "Vendor",
                tag: "Salary",
                editing: false,
                expenditure: defaultArray,
            };
            foundUser.vendorDetails.push(newVendor);
            foundUser.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/budget");
                }
            });
        }
    });
});

app.post("/editVendor", function (req, res) {
    const vendorID = req.body.editItem;
    Expenditure.findOne({ userID: USERID }, function (err, foundResult) {
        for (let i = 0; i < foundResult.vendorDetails.length; i++) {
            if (foundResult.vendorDetails[i]._id == vendorID) {
                foundResult.vendorDetails[i].editing = true;
                foundResult.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("/budget");
                    }
                });
            }
        }
    });
});

app.post("/editVendorDetails", function (req, res) {
    const vendorName = req.body.newName;
    const vendorTag = req.body.newTag;
    const vendorId = req.body.editItem;
    Expenditure.findOne({ userID: USERID }, function (err, foundResult) {
        for (let i = 0; i < foundResult.vendorDetails.length; i++) {
            if (foundResult.vendorDetails[i]._id == vendorId) {
                if (vendorName == "" || vendorTag == "") {
                    foundResult.vendorDetails[i].editing = false;
                    foundResult.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.redirect("/budget");
                        }
                    });
                } else {
                    foundResult.vendorDetails[i].name = vendorName;
                    foundResult.vendorDetails[i].tag = vendorTag;
                    foundResult.vendorDetails[i].editing = false;
                    foundResult.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.redirect("/budget");
                        }
                    });
                }
            }
        }
    });
});

app.post("/deleteVendor", function (req, res) {
    const vendorId = req.body.editItem;
    Expenditure.findOne({ userID: USERID }, function (err, foundResult) {
        for (let i = 0; i < foundResult.vendorDetails.length; i++) {
            if (foundResult.vendorDetails[i]._id == vendorId) {
                foundResult.vendorDetails.splice(i, 1);
                foundResult.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("/budget");
                    }
                });
            }
        }
    });
});


app.post("/changeMonth", function (req, res) {
    const selectedMonth = req.body.chosenMonth;
    console.log(req.body);
    switch (selectedMonth) {
        case "Jan":
            monthIndex = 0;
            res.redirect("/budget");
            break;
        case "Feb":
            monthIndex = 1;
            res.redirect("/budget");
            break;
        case "March":
            monthIndex = 2;
            res.redirect("/budget");
            break;
        case "April":
            monthIndex = 3;
            res.redirect("/budget");
            break;
        case "May":
            monthIndex = 4;
            res.redirect("/budget");
            break;
        case "June":
            monthIndex = 5;
            res.redirect("/budget");
            break;
        case "July":
            monthIndex = 6;
            res.redirect("/budget");
            break;
        case "Aug":
            monthIndex = 7;
            res.redirect("/budget");
            break;
        case "Sept":
            monthIndex = 8;
            res.redirect("/budget");
            break;
        case "Oct":
            monthIndex = 9;
            res.redirect("/budget");
            break;
        case "Nov":
            monthIndex = 10;
            res.redirect("/budget");
            break;
        case "Dec":
            monthIndex = 11;
            res.redirect("/budget");
            break;
        default:
            break;
    };
});



app.post("/editReceivableVendorAmount", function (req, res) {
    const vendorID = req.body.vendorID;
    const valIndex = req.body.valueIndex;
    const newValue = req.body.newValue;
    Receivable.findOne({ userID: USERID }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            for (let i = 0; i < foundUser.vendorDetails.length; i++) {
                if (foundUser.vendorDetails[i]._id == vendorID) {
                    foundUser.vendorDetails[i].receivable[monthIndex].receiving[valIndex].amount = newValue;
                    foundUser.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.redirect("/budget");
                        }
                    });
                }
            }
        }
    });
});

app.post("/newReceivableVendorEntry", function (req, res) {
    Receivable.findOne({ userID: USERID }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            const newVendor = {
                name: "Vendor",
                tag: "Salary",
                editing: false,
                receivable: receivableDefaultArray,
            };
            foundUser.vendorDetails.push(newVendor);
            foundUser.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/budget");
                }
            });
        }
    });
});

app.post("/editReceivableVendor", function (req, res) {
    const vendorID = req.body.editItem;
    Receivable.findOne({ userID: USERID }, function (err, foundResult) {
        for (let i = 0; i < foundResult.vendorDetails.length; i++) {
            if (foundResult.vendorDetails[i]._id == vendorID) {
                foundResult.vendorDetails[i].editing = true;
                foundResult.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("/budget");
                    }
                });
            }
        }
    });
});

app.post("/editReceivableVendorDetails", function (req, res) {
    const vendorName = req.body.newName;
    const vendorTag = req.body.newTag;
    const vendorId = req.body.editItem;
    Receivable.findOne({ userID: USERID }, function (err, foundResult) {
        for (let i = 0; i < foundResult.vendorDetails.length; i++) {
            if (foundResult.vendorDetails[i]._id == vendorId) {
                if (vendorName == "" || vendorTag == "") {
                    foundResult.vendorDetails[i].editing = false;
                    foundResult.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.redirect("/budget");
                        }
                    });
                } else {
                    foundResult.vendorDetails[i].name = vendorName;
                    foundResult.vendorDetails[i].tag = vendorTag;
                    foundResult.vendorDetails[i].editing = false;
                    foundResult.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.redirect("/budget");
                        }
                    });
                }
            }
        }
    });
});


app.post("/deleteReceivableVendor", function (req, res) {
    const vendorId = req.body.editItem;
    Receivable.findOne({ userID: USERID }, function (err, foundResult) {
        for (let i = 0; i < foundResult.vendorDetails.length; i++) {
            if (foundResult.vendorDetails[i]._id == vendorId) {
                foundResult.vendorDetails.splice(i, 1);
                foundResult.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("/budget");
                    }
                });
            }
        }
    });
});



let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server started succesfully")
});