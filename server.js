import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_TOKEN = process.env.TWITCH_TOKEN;

async function getTwitchUser(username)
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

async function getStream(username)
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

        // SAFE FALLBACK (this fixes your crash)
        const profile_image = userData?.profile_image_url || "";
        const game_name = streamData?.game_name || "Offline";
        const viewer_count = streamData?.viewer_count || 0;

        return res.json({
            profile_image,
            game_name,
            viewer_count
        });
    }
    catch (err)
    {
        console.log("ERROR:", err);

        return res.json({
            profile_image: "",
            game_name: "Offline",
            viewer_count: 0
        });
    }
});

app.get("/", (req, res) =>
{
    res.send("SL Twitch API running");
});

app.listen(PORT, () =>
{
    console.log("Server running on port " + PORT);
});
