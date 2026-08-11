const express = require("express");
const router = express.Router();

const Score = require("../models/Score");


// =========================================================
// GET LEADERBOARD
// =========================================================

router.get("/", async (req, res) => {

    try {

        const leaderboard = await Score
            .find()
            .sort({
                bestTime: 1
            })
            .limit(10);


        return res.status(200).json(
            leaderboard
        );


    } catch (error) {

        console.error(
            "GET leaderboard error:",
            error
        );


        return res.status(500).json({

            message:
                "Gagal mengambil leaderboard",

            error:
                error.message

        });

    }

});


// =========================================================
// POST SCORE
// =========================================================

router.post("/", async (req, res) => {

    try {

        // =================================================
        // AMBIL DATA REQUEST
        // =================================================

        const {

            playerId,
            username,
            bestTime

        } = req.body || {};


        // =================================================
        // VALIDASI PLAYER ID
        // =================================================

        if (

            playerId === undefined ||
            playerId === null ||
            String(playerId).trim() === ""

        ) {

            return res.status(400).json({

                message:
                    "playerId wajib diisi"

            });

        }


        // =================================================
        // VALIDASI USERNAME
        // =================================================

        if (

            username === undefined ||
            username === null ||
            String(username).trim() === ""

        ) {

            return res.status(400).json({

                message:
                    "username wajib diisi"

            });

        }


        // =================================================
        // VALIDASI BEST TIME
        // =================================================

        if (

            bestTime === undefined ||
            bestTime === null ||
            bestTime === ""

        ) {

            return res.status(400).json({

                message:
                    "bestTime wajib diisi"

            });

        }


        // Konversi bestTime menjadi Number
        const newTime =
            Number(bestTime);


        // Pastikan nilainya angka valid
        if (

            !Number.isFinite(newTime) ||
            newTime <= 0

        ) {

            return res.status(400).json({

                message:
                    "bestTime harus berupa angka lebih dari 0"

            });

        }


        // =================================================
        // NORMALISASI DATA
        // =================================================

        const normalizedPlayerId =
            String(playerId).trim();


        const normalizedUsername =
            String(username).trim();


        console.log({

            playerId:
                normalizedPlayerId,

            username:
                normalizedUsername,

            newTime

        });


        // =================================================
        // CARI PLAYER
        // =================================================

        let player =
            await Score.findOne({

                playerId:
                    normalizedPlayerId

            });


        // =================================================
        // PLAYER SUDAH ADA
        // =================================================

        if (player) {

            // Update username terbaru
            player.username =
                normalizedUsername;


            // =============================================
            // HANYA SIMPAN BEST TIME YANG LEBIH CEPAT
            // =============================================

            if (
                newTime <
                player.bestTime
            ) {

                player.bestTime =
                    newTime;

            }


            // =============================================
            // TAMBAH TOTAL RACE
            // =============================================

            player.totalRace =
                Number(
                    player.totalRace || 0
                ) + 1;


            // =============================================
            // UPDATE WAKTU
            // =============================================

            player.updatedAt =
                Date.now();


            await player.save();

        }


        // =================================================
        // PLAYER BARU
        // =================================================

        else {

            player =
                new Score({

                    playerId:
                        normalizedPlayerId,

                    username:
                        normalizedUsername,

                    bestTime:
                        newTime,

                    totalRace:
                        1,

                    checkpoint:
                        2

                });


            await player.save();

        }


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            message:
                "Score berhasil disimpan",

            data:
                player

        });


    } catch (error) {

        console.error(
            "POST score error:",
            error
        );


        return res.status(500).json({

            message:
                "Gagal menyimpan score",

            error:
                error.message

        });

    }

});


// =========================================================
// STATISTIK LEADERBOARD
// =========================================================

router.get("/stats", async (req, res) => {

    try {

        // =================================================
        // TOTAL PLAYER
        // =================================================

        const totalPlayer =
            await Score.countDocuments();


        // =================================================
        // TOTAL RACE
        // =================================================

        const races =
            await Score.aggregate([

                {

                    $group: {

                        _id: null,

                        total: {
                            $sum:
                                "$totalRace"
                        }

                    }

                }

            ]);


        // =================================================
        // BEST PLAYER
        // =================================================

        const best =
            await Score
                .findOne()
                .sort({

                    bestTime: 1

                });


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            totalPlayer,

            totalRace:

                races.length > 0

                    ? races[0].total

                    : 0,

            bestTime:

                best

                    ? best.bestTime

                    : 0,

            checkpoint:

                best

                    ? best.checkpoint

                    : 0

        });


    } catch (error) {

        console.error(
            "GET stats error:",
            error
        );


        return res.status(500).json({

            message:
                "Gagal mengambil statistik",

            error:
                error.message

        });

    }

});


// =========================================================
// DETAIL PLAYER
// =========================================================

router.get(
    "/player/:id",
    async (req, res) => {

        try {

            const id =
                String(
                    req.params.id || ""
                ).trim();


            // =============================================
            // VALIDASI ID
            // =============================================

            if (!id) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Player ID tidak valid"

                    });

            }


            // =============================================
            // CARI PLAYER
            // =============================================

            const player =
                await Score.findOne({

                    playerId:
                        id

                });


            // =============================================
            // PLAYER TIDAK DITEMUKAN
            // =============================================

            if (!player) {

                return res
                    .status(404)
                    .json({

                        message:
                            "Player tidak ditemukan"

                    });

            }


            // =============================================
            // RESPONSE
            // =============================================

            return res
                .status(200)
                .json(
                    player
                );


        } catch (error) {

            console.error(
                "GET player error:",
                error
            );


            return res
                .status(500)
                .json({

                    message:
                        "Gagal mengambil data player",

                    error:
                        error.message

                });

        }

    }
);


module.exports = router;
