import { URL } from 'node:url';

async function getScores(osu_id, num_of_top_plays_tracked) {
  const apiUrl = new URL(`https://osu.ppy.sh/api/v2/users/${osu_id}/scores/best`);
  const params = new URLSearchParams({
    mode: 'osu',
    limit: num_of_top_plays_tracked
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

export default getScores;
