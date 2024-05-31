const express = require("express")
const app = express()
const port = 3000
// const {startBotOnServer} = require("./src/bot")


const myMiddleware = (req, res, next) => {
    console.log("Server Request");
    next();
  };

app.get("/", myMiddleware, (req, res, next) =>
    res.send("Nodejs fuelPriceapi Server is Running")
  );
