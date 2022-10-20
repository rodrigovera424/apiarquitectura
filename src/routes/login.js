const { Router } = require("express");
const User = require("./../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");

const router = new Router();

router.get("/", (req, res) => {
  if (req.user) {
    res.redirect("/api");
  } else {
    res.redirect("/login");
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/login-error", (req, res) => {
  res.render("login-error");
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "login-error" }),
  (req, res) => {
    res.redirect("/api");
  }
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const { username, password, name } = req.body;
  User.findOne({ username }, async (err, user) => {
    if (err) console.log(err);
    if (user) res.render("register-error");
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashedPassword,
        name,
      });
      await newUser.save();
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.render("logout");
  });
});

router.get("/api", async (req, res) => {
  if (req.user) {
    const datosUsuario = await User.findById(req.user._id).lean();
    res.render("index", {
      usuario: req.user.name,
      username: req.user.username,
    });
    return datosUsuario;
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
