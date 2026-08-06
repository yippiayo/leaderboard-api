const express = require("express");
const router = express.Router();

const Score = require("../models/Score");


// =========================
// GET LEADERBOARD
// =========================

router.get("/", async (req, res) => {

    try {

        const leaderboard = await Score
            .find()
            .sort({
                bestTime: 1
            })
            .limit(10);


        res.json(leaderboard);


    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

});




// =========================
// POST SCORE
// =========================

router.post("/", async(req,res)=>{

    try {


        const {
            playerId,
            username,
            bestTime
        } = req.body;



        const newTime = Number(bestTime);



        console.log({
            playerId,
            username,
            newTime
        });



        let player = await Score.findOne({
            playerId
        });



        // PLAYER SUDAH ADA

        if(player){


            // update username terbaru
            player.username = username;



            // hanya ambil waktu terbaik

            if(newTime < player.bestTime){

                player.bestTime = newTime;

            }



            // tambah jumlah permainan

            player.totalRace += 1;



            player.updatedAt = Date.now();



            await player.save();



        }



        // PLAYER BARU

        else {


            player = new Score({

                playerId,

                username,

                bestTime:newTime,

                totalRace:1,

                checkpoint:2

            });


            await player.save();


        }



        res.json({

            message:
            "Score berhasil disimpan",

            data:player

        });



    } catch(error){


        res.status(500).json({

            message:error.message

        });


    }


});



module.exports = router;
