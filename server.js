const leaderboardRoute = require("./routes/leaderboard");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const https = require("https");

require("dotenv").config();

const app = express();


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());

app.use(express.json());


// =========================================================
// LEADERBOARD ROUTES
// =========================================================

app.use(
    "/api/leaderboard",
    leaderboardRoute
);


// =========================================================
// HELPER REQUEST JSON
// =========================================================

function getJson(url) {

    return new Promise(
        (resolve, reject) => {

            const request = https.get(

                url,

                {
                    headers: {

                        "Accept":
                        "application/json",

                        "User-Agent":
                        "HYUHYU-Leaderboard/1.0"

                    }
                },

                (response) => {

                    let data = "";


                    response.on(
                        "data",
                        (chunk) => {

                            data += chunk;

                        }
                    );


                    response.on(
                        "end",
                        () => {

                            try {

                                if (
                                    response.statusCode < 200 ||
                                    response.statusCode >= 300
                                ) {

                                    return reject(
                                        new Error(
                                            `Roblox API HTTP ${response.statusCode}`
                                        )
                                    );

                                }


                                const parsed =
                                    JSON.parse(data);


                                resolve(parsed);

                            }

                            catch(error) {

                                reject(error);

                            }

                        }
                    );

                }

            );


            request.on(
                "error",
                (error) => {

                    reject(error);

                }
            );

        }
    );

}


// =========================================================
// ROBLOX AVATAR
// =========================================================

app.get(
    "/api/avatar/:userId",
    async (req, res) => {

        try {

            const userId =
                String(
                    req.params.userId || ""
                ).trim();


            // =========================
            // VALIDASI USER ID
            // =========================

            if (!/^\d+$/.test(userId)) {

                return res
                    .status(400)
                    .json({

                        message:
                        "Roblox User ID tidak valid"

                    });

            }


            // =========================
            // TIPE AVATAR
            // =========================

            const requestedType =
                String(
                    req.query.type ||
                    "headshot"
                ).toLowerCase();


            let endpoint;

            let size;


            // HEADSHOT
            if (
                requestedType ===
                "headshot"
            ) {

                endpoint =
                    "/v1/users/avatar-headshot";

                size =
                    "150x150";

            }


            // BUST
            else if (
                requestedType ===
                "bust"
            ) {

                endpoint =
                    "/v1/users/avatar-bust";

                size =
                    "420x420";

            }


            // FULL BODY
            else if (
                requestedType ===
                "full"
            ) {

                endpoint =
                    "/v1/users/avatar";

                size =
                    "420x420";

            }


            // TIPE TIDAK VALID
            else {

                return res
                    .status(400)
                    .json({

                        message:
                        "Tipe avatar harus headshot, bust, atau full"

                    });

            }


            // =========================
            // URL ROBLOX API
            // =========================

            const robloxUrl =

                "https://thumbnails.roblox.com" +

                endpoint +

                "?userIds=" +
                encodeURIComponent(userId) +

                "&size=" +
                encodeURIComponent(size) +

                "&format=Png" +

                "&isCircular=false";


            // =========================
            // REQUEST KE ROBLOX
            // =========================

            const result =
                await getJson(
                    robloxUrl
                );


            const item =
                Array.isArray(
                    result.data
                )
                    ? result.data[0]
                    : null;


            // =========================
            // AVATAR TIDAK DITEMUKAN
            // =========================

            if (!item) {

                return res
                    .status(404)
                    .json({

                        message:
                        "Avatar Roblox tidak ditemukan"

                    });

            }


            // =========================
            // THUMBNAIL BELUM SIAP
            // =========================

            if (
                item.state &&
                item.state !==
                "Completed"
            ) {

                return res
                    .status(503)
                    .json({

                        message:
                        "Thumbnail Roblox belum tersedia",

                        state:
                        item.state

                    });

            }


            // =========================
            // TIDAK ADA IMAGE URL
            // =========================

            if (!item.imageUrl) {

                return res
                    .status(404)
                    .json({

                        message:
                        "URL avatar Roblox tidak tersedia"

                    });

            }


            // =========================
            // CACHE
            // =========================

            res.set(
                "Cache-Control",
                "public, max-age=300"
            );


            // =========================
            // REDIRECT KE GAMBAR ROBLOX
            // =========================

            return res.redirect(
                302,
                item.imageUrl
            );

        }

        catch(error) {

            console.error(
                "Avatar API error:",
                error
            );


            return res
                .status(500)
                .json({

                    message:
                    "Gagal mengambil avatar Roblox",

                    error:
                    error.message

                });

        }

    }
);


// =========================================================
// DATABASE
// =========================================================

mongoose
    .connect(
        process.env.MONGO_URI
    )

    .then(
        () => {

            console.log(
                "MongoDB berhasil terhubung"
            );

        }
    )

    .catch(
        (error) => {

            console.log(
                "MongoDB gagal terhubung:",
                error
            );

        }
    );


// =========================================================
// HOME
// =========================================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "Leaderboard API berjalan"
        );

    }
);


// =========================================================
// SERVER
// =========================================================

const PORT =
    process.env.PORT ||
    3000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server berjalan di port ${PORT}`
        );

    }
);
