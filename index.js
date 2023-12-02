import express from "express";
import env from "dotenv";
import connect from "./config/db.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import initApi from "./routes/api.js";
import session from "express-session";
import passport from "passport";
import "./middleware/passport.js";

const app = express();
//environment
env.config();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  })
);
const port = process.env.PORT;
app.use("/assets", express.static("../frontend/assets"));
//connect to database
connect();
//api routes
app.get("/", (req, res) => {
  const welcomeHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
      </head>
      <body>
          <h1>Welcome to our ZenClass!</h1>
          <p>The Back End is running</p>
      </body>
      </html>
  `;
  res.send(welcomeHTML);
});
initApi(app);
//Connect to server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
