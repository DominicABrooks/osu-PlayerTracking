async function postToDiscord(payload, webhooks) {

  const responses = [];

  for (const url of webhooks) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      responses.push(response);
    } catch (err) {
      console.error('Error:', err);
      responses.push({ error: err }); // Handle the error case
    }
  }

  return responses;
}

export default postToDiscord;
