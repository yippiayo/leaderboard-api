const express = require("express");
const router = express.Router();

const Score = require("../models/Score");


// Menampilkan leaderboard
router.get("/", async (req,res)=>{

    try{

        const leaderboard = await Score
        .find()
        .sort({bestTime: 1})
        .limit(10);


        res.json(leaderboard);


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});



// Menambah atau update score
router.post("/", async(req,res)=>{

    try{

        const { playerId, username, bestTime } = req.body;
        console.log(req.body);

        let player = await Score.findOne({
    playerId: playerId
});

if (player) {

    if (bestTime < player.bestTime) {
        player.bestTime = bestTime;
    }

    player.totalRace += 1;
    player.updatedAt = Date.now();

    await player.save();

} else {

    player = new Score({
        playerId,
        username,
        bestTime,
        totalRace: 1,
        checkpoint: 2
    });

    await player.save();

}


        res.json({
            message:"Score berhasil disimpan",
            data:player
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});


module.exports = router;