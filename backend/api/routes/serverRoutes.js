import Router from 'express-promise-router';
import userDB from '../../database/db.js';
import Joi from 'joi';
import validator, { DISCORD_WEBHOOK_PATTERN } from "./validator.js";

const schema = Joi.object({
  invite_url: Joi
    .string()
    .required(),

  webhook_url: Joi
    .string()
    .pattern(DISCORD_WEBHOOK_PATTERN)
    .message('Invalid Discord Webhook URL')
    .required()
});

const router = new Router();

router.post('/add', validator(schema), async (req, res) => {
  console.log(req.body);
  const { invite_url, webhook_url } = req.body;

  // Add server logic here
  console.log("Server Webhook: " + webhook_url);
  console.log("Dicord Server Invite Link: " + invite_url);

  await userDB.addServer(invite_url, webhook_url);
  res.send('Server added successfully');
});


router.get('/:id', (req, res) => {
  // TODO: if 'id' (discord_webhook_id), exist in discord_server db, when user adds account through /server, create user with that webhook
  const serverId = req.params.id;
  // Now you can use the captured serverId in your code
  res.send(`Requested server with ID: ${serverId}`);
});

export default router;
