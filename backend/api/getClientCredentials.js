import { URL } from 'node:url';

async function fetchOAuthToken() {
  const OAUTH_TOKEN_URL = new URL("https://osu.ppy.sh/oauth/token");

  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "public"
    })
  });

  const data = await response.json();
  console.log(data);
  return data;
}

export default fetchOAuthToken;
