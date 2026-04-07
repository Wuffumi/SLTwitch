import express from "express";
import fetch from "node-fetch";

const app = express();

const PORT = process.env.PORT || 10000;

app.get("/twitch", async (req, res) => {
  const username = req.query.user;

  if (!username) {
    return res.status(400).json({ error: "Missing user" });
  }

  const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
  const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

  try {
    // Get token
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    // User info
    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
      headers: {
        "Client-ID": CLIENT_ID,
        "Authorization": `Bearer ${token}`
      }
    });

    const userData = await userRes.json();
    const user = userData.data[0];

    // Stream info
    const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
      headers: {
        "Client-ID": CLIENT_ID,
        "Authorization": `Bearer ${token}`
      }
    });

    const streamData = await streamRes.json();
    const stream = streamData.data[0];

    res.json({
      profile_image: user.profile_image_url,
      game_name: stream ? stream.game_name : "Offline",
      viewer_count: stream ? stream.viewer_count : 0,
      url: `https://twitch.tv/${username}`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});