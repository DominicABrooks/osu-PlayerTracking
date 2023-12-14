import Router from 'express-promise-router';
import userDB from '../../database/db.js';
import Joi from 'joi';
import validator, { DISCORD_WEBHOOK_PATTERN } from './validator.js';
import postToDiscord from '../../webhook/postToDiscord.js';
import getUser from '../getUser.js'

const testAddingUserWebhook = async (osu_username, num_of_top_plays_tracked, webhooks) => {
  const payload = {
    "avatar_url": "https://github.com/DominicABrooks/Sandbox/blob/main/Flex.png?raw=true",
    "content": `Now tracking ${osu_username} top ${num_of_top_plays_tracked} plays on osu!flex`
  }

  const res = await postToDiscord(payload, webhooks);

  return res[0].ok;
}

const testDeletingUserWebhook = async (osu_username, webhooks) => {
  const payload = {
    "avatar_url": "https://github.com/DominicABrooks/Sandbox/blob/main/Flex.png?raw=true",
    "content": `No longer tracking ${osu_username} on osu!flex`
  }

  const res = await postToDiscord(payload, webhooks);

  return res[0].ok;
}

const schema = Joi.object({
  osu_user: Joi
    .string()
    .required(),
    // .number()
    // .integer()
    // .min(2)
    // .max(35_000_000)
    // .required(),

  webhook_url: Joi
    .string()
    .pattern(DISCORD_WEBHOOK_PATTERN)
    .message('Invalid Discord Webhook URL')
    .required(),

  num_of_top_plays_tracked: Joi
    .number()
    .integer()
    .min(1)
    .max(100)
    .default(100)
});

const router = new Router();

router.post('/add', validator(schema), async (req, res) => {
  console.log(req.body);
  let { osu_user, webhook_url, num_of_top_plays_tracked } = req.body;

  // Add user logic here
  console.log("OSU User: " + osu_user);
  console.log("User Webhook: " + webhook_url);
  console.log("User Num Of Top Plays to Track: " + num_of_top_plays_tracked);
  const webhooks = [webhook_url];

  const user = await getUser(osu_user);
  //console.log(user);
  if (user.hasOwnProperty('error')) {
    res.status(400).json({
      success: false,
      message: "Invalid OSU User " + osu_user
    });

    return false;
  }

  let osu_id = user.id;

  const webhookSuccess = await testAddingUserWebhook(user.username, num_of_top_plays_tracked, webhooks);

  if (!webhookSuccess) {
    return res.status(400).json({
      message: 'Invalid Webhook URL'
    });
  }

  await userDB.addUser(osu_id, webhooks, Date.now(), num_of_top_plays_tracked);

  return res.json({ 
    osu_user: user.username,
    num_of_top_plays_tracked: num_of_top_plays_tracked
  }); 
});

const delete_schema = Joi.object({
  osu_user: Joi
    .string()
    .required(),
    // .number()
    // .integer()
    // .min(2)
    // .max(35_000_000)
    // .required(),

  webhook_url: Joi
    .string()
    .pattern(DISCORD_WEBHOOK_PATTERN)
    .message('Invalid Discord Webhook URL')
    .required()
});

router.delete('/delete', validator(delete_schema), async (req, res) => {
  console.log(req.body);
  let { osu_user, webhook_url } = req.body;

  // Add user logic here
  console.log("\nRemoving Webhook from OSU User: " + osu_user);
  console.log("User Webhook: " + webhook_url + "\n");
  const webhooks = [webhook_url];

  const user = await getUser(osu_user);

  if (user.hasOwnProperty('error')) {
    res.status(400).json({
      success: false,
      message: "Invalid OSU User " + osu_user
    });

    return false;
  }

  let osu_id = user.id;

  const webhookSuccess = await testDeletingUserWebhook(user.username, webhooks);

  if (!webhookSuccess) {
    return res.status(400).json({
      message: 'Invalid Webhook URL'
    });
  }

  await userDB.removeUserWebhook(osu_id, webhooks);

  return res.json({ 
    osu_user: user.username
  }); 
});

export default router;
