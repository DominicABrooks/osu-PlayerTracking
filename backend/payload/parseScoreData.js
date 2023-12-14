import { readFile } from 'node:fs/promises';

const parseSingleScore = (singleScoreResponse, index) => {
  const {
    beatmapset,
    pp,
    beatmap,
    mods,
    rank,
    accuracy,
    statistics,
    user,
    created_at
  } = singleScoreResponse;

  // Sample data for placeholders
  return {
    title: beatmapset.title,
    version: beatmap.version,
    mods: mods.length === 0 ? "NoMod" : mods,
    star_rating: beatmap.difficulty_rating,
    bpm: beatmap.bpm,
    duration: formatTime(beatmap.total_length),
    rank,
    accuracy: parseFloat((accuracy * 100).toFixed(2)).toString(),
    hits: `${statistics.count_300}/${statistics.count_100}/${statistics.count_50}/${statistics.count_miss}`,
    pp: parseFloat(pp.toFixed(1)).toString(),
    beatmap_url: beatmap.url,
    beatmap_cover: beatmapset.covers.cover,
    i: index + 1,
    username: user.username,
    user_url: `https://osu.ppy.sh/users/${user.id}`,
    avatar_url: user.avatar_url,
    created_at
  };
};

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

const buildEmbed = async (data) => {
  try {
    const jsonString = await readFile('./payload/templates/embeds/newPlayEmbed.json', 'utf8');
    const template = JSON.parse(jsonString);
    replaceFields(template, data);
    return template;
  } catch (err) {
    console.error("Error modifying JSON template:", err);
    throw err;
  }
};

const replaceFields = (template, data) => {
  for (const [key, value] of Object.entries(template)) {
    // If the value is a string, perform the replacement using regular expressions
    if (typeof value === 'string') {
      template[key] = value.replace(/{([^}]+)}/g, (match, key) => data[key]);
    } else if (typeof value === 'object') {
      // If the value ls an object, recursively call the replaceFields function to handle nested objects
      replaceFields(value, data);
    }

    // Output the field and its updated value
    // console.log(`Field: ${field}, Value: ${template[field]}`);
  }
};

function playChecked(index, created, last_updated) {

  const dateCreated = new Date(created);
  const dateUpdated = new Date(last_updated);

  return dateCreated <= dateUpdated;
}

const parseScoreData = async (last_updated, response) => {
  const embeds = [];

  for (const [index, element] of response.entries()) {
    try {
      if (playChecked(index, element.created_at, last_updated)) {
        continue;
      }

      console.log("Play " + (index + 1) + " is a new play!");

      const data = parseSingleScore(element, index);
      const embed = await buildEmbed(data);
      embeds.push(embed);
    } catch (error) {
      // Handle and log the error appropriately
      console.error(`Error processing score data at index ${index}:`, error);
    }
  }

  return {
    "avatar_url": "https://github.com/DominicABrooks/Sandbox/blob/main/Flex.png?raw=true",
    "content": null,
    embeds
  };
};

export default parseScoreData;
