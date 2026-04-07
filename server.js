import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_TOKEN = process.env.TWITCH_TOKEN;

/*
  GET TWITCH USER INFO (PROFILE IMAGE, ID)
*/
async function getTwitchUser(username)
{
    try
    {
        const url = `https://api.twitch.tv/helix/users?login=${username}`;

        const res = await fetch(url, {
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${TWITCH_TOKEN}`
            }
        });

        const data = await res.json();

        return data?.data?.[0] || null;
    }
    catch (e)
    {
        console.log("User fetch error:", e);
        return null;
    }
}

/*
  GET STREAM INFO (LIVE GAME + VIEWERS)
*/
async function getStream(username)
{
    try
    {
        const url = `https://api.twitch.tv/helix/streams?user_login=${username}`;

        const res = await fetch(url, {
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${TWITCH_TOKEN}`
            }
        });

        const data = await res.json();

        return data?.data?.[0] || null;
    }
    catch (e)
    {
        console.log("Stream fetch error:", e);
        return null;
    }
}

/*
  MAIN API ENDPOINT
*/
app.get("/twitch", async (req, res) =>
{
    try
    {
        const user = (req.query.user || "").toLowerCase().trim();

        if (!user)
        {
            return res.json({
                profile_image: "",
                game_name: "No user",
                viewer_count: 0
            });
        }

        const userData = await getTwitchUser(user);
        const streamData = await getStream(user);

        // SAFE PROFILE IMAGE (ALWAYS FROM USER API)
        const profile_image = userData?.profile_image_url || "";

        // STREAM DATA ONLY IF LIVE
        const isLive = streamData !== null;

        const game_name = isLive ? (streamData?.game_name || "Live") : "Offline";
        const viewer_count = isLive ? (streamData?.viewer_count || 0) : 0;

        return res.json({
            profile_image,
            game_name,
            viewer_count
        });
    }
    catch (err)
    {
        console.log("GLOBAL ERROR:", err);

        return res.json({
            profile_image: "",
            game_name: "Offline",
            viewer_count: 0
        });
    }
});

/*
  HEALTH CHECK
*/
app.get("/", (req, res) =>
{
    res.send("SL Twitch API Running");
});

app.listen(PORT, () =>
{
    console.log("Server running on port " + PORT);
});
