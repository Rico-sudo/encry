//jshint esversion:6

//ordine per passport
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "oursecret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);
// the schema for the mongoose encryption
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/logout" ,(req , res)=> {
    req.logout();
    res.redirect("/");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
              });
        }
    })
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );

  // User.register({username:'username', active: false}, 'password', function(err, user) {
  //     if (err) { ... }

  //     var authenticate = User.authenticate();
  //     authenticate('username', 'password', function(err, result) {
  //       if (err) { ... }

  //       // Value 'result' is set to false. The user could not be authenticated since the user is not active
  //     });
  //   });
});

app.listen(3000, function () {
  console.log("serv start on 3000");
});
