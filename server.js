

const express = require("express");
const path = require("path");
const process = require("process");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const connectMongo = require("connect-mongo");
const session = require("express-session");
const exphbs = require("express-handlebars");
const bcrypt = require("bcrypt");

require("dotenv").config(".env");
const User = require("./src/models/user.js");
const passport = require("passport");
const Strategy = require("passport-local");

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://mongocrud:VerboStudio2022@cluster0.sumuwkx.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("Base de Datos conectada"))
  .catch((err) => console.log(err));

const LocalStrategy = Strategy;
const options = { useNewUrlParser: true, useUnifiedTopology: true };
const MongoStore = connectMongo.create({
  mongoUrl: process.env.MONGO_URL,
  mongoOptions: options,
  ttl: 60,
});

const productsController = require("./src/controller/productController");
const messagesController = require("./src/controller/messageController");

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.set("view engine", "handlebars");

// eslint-disable-next-line no-undef
app.set("views", path.join(__dirname + "/public/views"));

app.engine("handlebars", exphbs.engine());

app.use(express.json());
app.use(express.urlencoded({ extend: true }));

// eslint-disable-next-line no-undef
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    store: MongoStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/**
 *
 * `PASSPORT` CONFIGURATION
 */

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) console.log(err);
      if (!user) return done(null, false);
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) console.log(err);
        if (isMatch) return done(null, user);
        return done(null, false);
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

app.use("/", require("./src/routes/login"));

io.on("connection", (socket) => {
  socket.emit("socketConnected");

  socket.on("productListRequest", async () => {
    const allProducts = await productsController.getAllProducts();
    socket.emit("updateProductList", allProducts);
  });

  socket.on("chatMessagesRequest", async () => {
    const allMessages = await messagesController.getAllMessages();
    socket.emit("updateChatRoom", allMessages);
  });

  socket.on("addNewProduct", async (newProduct) => {
    await productsController.addNewProduct(newProduct);
    const allProducts = await productsController.getAllProducts();
    socket.emit("updateProductList", allProducts);
  });

  socket.on("addNewMessage", async (newMessage) => {
    await messagesController.addNewMessage(newMessage);
    const allMessages = await messagesController.getAllMessages();
    socket.emit("updateChatRoom", allMessages);
  });
});

const PORT = process.env.PORT;
const server = httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
server.on("error", (err) => console.error(err));
