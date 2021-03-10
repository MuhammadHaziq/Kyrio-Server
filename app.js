import indexRouter from "./routes/index";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

var app = express();
var server = require('http').createServer(app)
var io = require('socket.io')(server)

dotenv.config();
app.use(cors());
// app.use(
//   fileUpload({
//     limits: { fileSize: '50mb' },
//     abortOnLimit: true,
//     createParentPath: true,
//     limitHandler: (req, res, next) => {
//       return res.status(422).send({
//         success: "false",
//         message: "File size limit has been reached",
//       });
//     },
//   })
// );
app.use(fileUpload());
app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use("/", indexRouter);
app.use(`/kyrio/v1`, indexRouter);

app.use(logger("dev"));
app.use(cookieParser());

app.use("/media", express.static(path.join(__dirname, "./uploads")));
app.use(
  "/media/items/:accountId",
  express.static(path.join(__dirname, "./uploads/items"))
);
app.use(
  "/media/receipt/:storeId",
  express.static(path.join(__dirname, "./uploads/receipt"))
);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});
// Connect client with this server and then check if a user has made a connection or not
io.on('connection', (socket) => {
    console.log('a user connected');
  socket.on('chat message', () => {
    console.log('New Message');
  });
});
mongoose.connect(
  process.env.NODE_ENV == "production"
    ? process.env.MONGO_LIVE_URL
    : process.env.MONGO_LOCAL_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => {
    process.env.NODE_ENV == "production"
      ? console.log("Connected to Mongodb Cloud Server")
      : console.log("Connected to Mongodb Local Server");
      io.emit('chat message', "test");
  }
);
mongoose.connection.on("error", (err) => {
  console.log(err.message);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.title = "Kyrio POS Server";
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = { app, server };
