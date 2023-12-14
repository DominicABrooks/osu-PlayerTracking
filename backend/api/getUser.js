import { URL } from 'node:url';

async function getUser(osu_id) {
  const apiUrl = new URL(`https://osu.ppy.sh/api/v2/users/${osu_id}`);
  const params = new URLSearchParams({
    mode: 'osu'
  });

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
  };

  try {
    const response = await fetch(`${apiUrl}?${params.toString()}`, { headers });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export default getUser;
