import 'dotenv/config';
import { setTimeout } from 'node:timers/promises';
import getScores from './api/getScores.js';
import parseScoreData from './payload/parseScoreData.js';
import postToDiscord from './webhook/postToDiscord.js';
import fetchOAuthToken from './api/getClientCredentials.js';
import express from 'express';
import userDB from './database/db.js';


// Import the route files
import userRoutes from './api/routes/userRoutes.js';
import serverRoutes from './api/routes/serverRoutes.js';

// make instance of express app
const app = express();

// parse JSON request bodies
app.use(express.json());
// Serve static files the public/ directory
app.use(express.static('public'));

// Connect the routes to the app
app.use('/api/user', userRoutes);
app.use('/api/server', serverRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  // If it's a validation error it's the client's mistake, let them know.
  if (err.isJoi) {
    return res.status(400).send({ message: err.message });
  }

  // Other errors are internal, log it and hide it from the user.
  console.error(err);
  return res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(3000, (err) => {
  if (err) throw err;
  console.log('Server is running on port 3000');
});

let tokenData = process.env.ACCESS_TOKEN;
const announceNewUserScores = async (user) => {
  console.log(user);

  try {
    // Check if initData is undefined or if it expires within the next hour
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
    if (!tokenData || tokenData.update_at <= currentTimestamp) {
      tokenData = await fetchOAuthToken();
      process.env.ACCESS_TOKEN = tokenData.access_token;

      // Calculate the time to update epoch timestamp by adding the expires_in value to the current time minus an hour
      const hourBeforeExpiresInEpoch = currentTimestamp + (tokenData.expires_in - 3600);
      tokenData.update_at = hourBeforeExpiresInEpoch; // Add expires_at property to tokenData
    }

    // Get the current date
    // which ensures that even if a user sets a play during getScores/ParseScoreData functions
    // the play will still be added to a payload on next iteration
    const currentDate = new Date();
    console.log(currentDate);
    const response = await getScores(user.osu_user_id, user.num_tracked_top_plays);

    const data = await parseScoreData(user.last_updated, response);

    if (data.embeds.length > 0) {
      console.log(user.osu_user_id + " " + currentDate);
      await userDB.updateLastModified(user.osu_user_id, currentDate);
    }

    if (data.embeds.length > 9) {
      console.log("More than 9 scores were found!");
    } else if (data.embeds.length > 0) {
      await postToDiscord(data, user.discord_webhooks);
    } else {
      console.log("No scores were found");
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const running = true;
while (running) {
  // Get users [{osu_id, webhooks[], last_updated},...]
  const users = await userDB.getUsers();

  for (const user of users) {
    await announceNewUserScores(user);
    await setTimeout(2500);
  }
}
