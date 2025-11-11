const express = require("express");
const Authrouter = require("./routes/Authrouter");
const app = express();
const port = process.env.PORT || 4500;
const cors = require("cors");
const connectDB = require("./config/Db");
const Adminauth = require("./routes/Adminauth");
const Adminrouter = require("./routes/Adminroute");
const Userrouter = require("./routes/Userroute");
const router = require("./routes/router");
const Affiliateroute = require("./routes/Affiliateroute");
const Masteraffiliateroute = require("./routes/Masteraffiliateroute");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "https://bajibet24.live",
      "https://admin.bajibet24.live",
      "https://jstlive.net",
      "https://admin.jstlive.net",
      "https://1xwin.live",
      "http://1xwin.live",
      "http://www.1xwin.live",
      "https://api.1xwin.live",
      "http://api.1xwin.live",
      "http://www.api.1xwin.live",
      "http://admin.1xwin.live",
      "http://www.admin.1xwin.live",
      "https://admin.1xwin.live",
      "http://admin.1xwin.live",
      "http://www.admin.1xwin.live",
      "https://7z0gvwz0-3000.asse.devtunnels.ms",
      "http://7z0gvwz0-3000.asse.devtunnels.ms",
      'https://affiliate.1xwin.live',
       'https://m-affiliate.1xwin.live',
      "*",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-key",
      "x-merchant-id", // Added the problematic header
      "x-timestamp", // Added other custom headers
      "x-nonce",
      "x-sign",
      "Access-Control-Allow-Origin",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use("/api/auth", Authrouter);
// -------admin-auth-----------------
app.use("/api/auth/admin", Adminauth);
app.use("/api/admin", Adminrouter);
app.use("/api/user", Userrouter);
app.use("/api", router);
app.use("/api/auth/admin", Adminauth);
app.use("/api/admin", Adminrouter);
app.use("/api/user", Userrouter);
app.use("/api/affiliate", Affiliateroute);
app.use("/api/master-affiliate", Masteraffiliateroute);
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("server is running");

  try {
    console.log("server is running ");
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
