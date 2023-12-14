
export default function (schema) {
  return async function (req, res, next) {
    req.body = await schema.validateAsync(req.body);
    return next();
  }
}

export const DISCORD_WEBHOOK_PATTERN = /^https:\/\/discord\.com\/api\/webhooks\/\d{17,19}\/\S+$/;
