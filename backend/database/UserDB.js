import pkg from 'pg';
import url from 'node:url';
const { Pool } = pkg;

class UserDB {
  constructor() {
    this.pool = new Pool();
  }

  async connect() {
    try {
      // PGHOST=localhost
      console.log("PGHOST: " + process.env.PGHOST);
      // PGUSER=postgres
      console.log("PGUSER: " + process.env.PGUSER);
      // PGDATABASE=osuflexdb
      console.log("PGDATABASE: " + process.env.PGDATABASE);
      // PGPASSWORD=password
      console.log("PGPASSWORD: " + process.env.PGPASSWORD);
      // PGPORT=5432
      console.log("PGPORT: " + process.env.PGPORT);
      
      await this.pool.connect();
      console.log('Connection made to PostgreSQL...');
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error);
    }
  }

  async addUser(osuId, webhooks, lastUpdated, num_of_top_plays_tracked) {
    const postgresTimestamp = new Date(lastUpdated).toISOString();

    // Check if the webhook already exists in the array
    const existingUserQuery = 'SELECT discord_webhooks FROM osu_user WHERE osu_user_id = $1';
    console.log("existingUserQuery:", existingUserQuery);
    const existingUserResult = await this.pool.query(existingUserQuery, [osuId]);
    console.log("existingUserResult:", existingUserResult);
    const existingWebhooks = existingUserResult.rows[0]?.discord_webhooks || [];
    console.log("existingWebhooks:", existingWebhooks);

    if (existingWebhooks.includes(webhooks[0])) {
      throw new Error('Webhook already exists for this user.');
    }

    const query = 'INSERT INTO osu_user (osu_user_id, discord_webhooks, last_updated, num_tracked_top_plays) VALUES ($1, $2, $3, $4) ON CONFLICT (osu_user_id) DO UPDATE SET discord_webhooks = osu_user.discord_webhooks || $2';
    const values = [osuId, webhooks, postgresTimestamp, num_of_top_plays_tracked];

    await this.pool.query(query, values);
    console.log('User added successfully.');
  }

  async addServer(invite_url, webhook) {
    const webhook_url = new url.URL(webhook);
    const pathSegments = webhook_url.pathname.split('/');
    const webhook_id = pathSegments[3];
    console.log('Webhook ID added: ' + webhook_id);

    const query = 'INSERT INTO discord_server (discord_webhook_id, discord_server_invite, discord_webhook) VALUES ($1, $2, $3)';
    const values = [webhook_id, invite_url, webhook];

    await this.pool.query(query, values);
    console.log('Server added successfully.');
  }

  async getUser(osuId) {
    const query = 'SELECT * FROM osu_user WHERE osu_user_id = $1';
    const values = [osuId];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getUsers() {
    const query = 'SELECT * FROM osu_user';

    const result = await this.pool.query(query);
    return result.rows;
  }

  async updateLastModified(osuId, lastUpdated) {
    const postgresTimestamp = new Date(lastUpdated).toISOString();

    const query = 'UPDATE osu_user SET last_updated = $1 WHERE osu_user_id = $2';
    const values = [postgresTimestamp, osuId];

    await this.pool.query(query, values);
    console.log('User last_updated updated successfully.');

  }

  async removeUserWebhook(osuId, webhooks) {
    // Get the existing webhooks for the user
    const existingUserQuery = 'SELECT discord_webhooks FROM osu_user WHERE osu_user_id = $1';
    const existingUserResult = await this.pool.query(existingUserQuery, [osuId]);
    const existingWebhooks = existingUserResult.rows[0]?.discord_webhooks || [];
    console.log("Original Webhooks: " + existingWebhooks);
    console.log("Webhooks to delete: " + webhooks);

    // Check if the webhook to be removed exists in the array
    if (!existingWebhooks.includes(webhooks[0])) {
      throw new Error('Webhook does not exist for this user.');
    }

    // Remove the webhook from the array
    const updatedWebhooks = existingWebhooks.filter(url => url !== webhooks[0]);
    console.log("Update Webhooks: " + webhooks + "\n");

    // Update the user's webhook array
    const updateQuery = 'UPDATE osu_user SET discord_webhooks = $1 WHERE osu_user_id = $2';
    const updateValues = [updatedWebhooks, osuId];
    await this.pool.query(updateQuery, updateValues);

    if (updatedWebhooks.length === 0) {
      // Delete the user if there are no webhooks left
      const deleteUserQuery = 'DELETE FROM osu_user WHERE osu_user_id = $1';
      await this.pool.query(deleteUserQuery, [osuId]);
      console.log('User deleted successfully.');
    } else {
      console.log('Webhook removed successfully.');
    }
  }
}

export default UserDB;
