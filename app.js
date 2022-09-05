import indexRouter from "./routes/index";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import { Server } from "socket.io";
import redisAdapter from "socket.io-redis";
var axios = require("axios");
var app = express();
// app.io = require("socket.io")();

const io = new Server();
io.adapter(redisAdapter());

app.io = io;

dotenv.config();
app.use(cors());
// Bind Socket
app.use(async function (req, res, next) {
  req.io = app.io;
  next();
});
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
app.use(express.json({ limit: "50mb", type: "application/json" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.get("/mealme/searach/cart", (req, res) => {
  // const { comment_id } = req.params;
  // const { community_id } = req.query;
  var query = "crushed tomatoes, olive oil";
  // https://mealme-4.mealme.ai/groceries/search/cart/v2?query=Whole%20Milk%2C%20Eggs&user_latitude=37.7786357&user_longitude=-122.3918135&pickup=false&budget=20&user_street_num=188&user_street_name=King%20Street&user_city=San%20Francisco&user_state=CA&user_zipcode=94107&user_country=US&user_time_zone=America%2FLos_Angeles&fetch_quotes=false&sort=relevance&open=false&maximum_miles=1.5&autocomplete=false
  var url = `https://mealme-4.mealme.ai/groceries/search/cart/v2?query=${query}&user_latitude=37.7786357&user_longitude=-122.3918135&pickup=false&budget=20&user_street_num=188&user_street_name=King%20Street&user_city=San%20Francisco&user_state=CA&user_zipcode=94107&user_country=US&user_time_zone=America%2FLos_Angeles&fetch_quotes=false&sort=cheapest&open=false&maximum_miles=1.5&autocomplete=false`;
  //var url = `https://app.circle.so/api/v1/comments/${comment_id}?community_id=${community_id}`;
  //${params.comment_id}
  console.log(url);
  var config = {
    method: "get",
    url: url,
    headers: {
      "Id-Token": "morphood:3386bf6a-2546-421c-9ed2-24ec20efc68f",
    },
  };
  // const testData = require("./data.json");
  // res.status(200).send(testData);
  axios(config)
    .then(function (response) {
      var mealmeResponse = response.data;
      //console.log(mealmeResponse['carts']['products'][0])
      // res.status(200).send(mealmeResponse["carts"][2]["products"]);
      res.status(200).send(mealmeResponse);
    })
    .catch(function (error) {
      res.status(200).send(error);
    });
});
app.use("/", indexRouter);
app.use(`/kyrio/v1`, indexRouter);

app.use(logger("dev"));
app.use(cookieParser());

app.use("/media", express.static(path.join(__dirname, "./uploads")));
app.use(
  "/media/items/:account",
  express.static(path.join(__dirname, "./uploads/items"))
);
app.use(
  "/media/receipt/:storeId",
  express.static(path.join(__dirname, "./uploads/receipt"))
);
app.use(
  "/media/csv/:fileName",
  express.static(path.join(__dirname, "./uploads/csv"))
);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});
// Connect client with this server and then check if a user has made a connection or not

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
      ? console.log("Connected to Mongodb Production Server")
      : console.log("Connected to Mongodb Staging Server");
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
