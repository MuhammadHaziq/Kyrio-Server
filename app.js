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

dotenv.config();
var app = express();
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

module.exports = app;
