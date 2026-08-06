const leaderboardRoute = require("./routes/leaderboard");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/leaderboard", leaderboardRoute);


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB berhasil terhubung");
})
.catch((error) => {
    console.log("MongoDB gagal terhubung:", error);
});


app.get("/", (req, res) => {
    res.send("Leaderboard API berjalan");
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});