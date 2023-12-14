-- Create a new database
CREATE DATABASE osuflexdb;

-- Switch to the newly created database
\c osuflexdb;

-- Create the osu user table
CREATE TABLE osu_user (
  osu_user_id INTEGER PRIMARY KEY,
  discord_webhooks TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE,
  num_tracked_top_plays INTEGER DEFAULT 100
);

-- Create the discord server table
CREATE TABLE discord_server (
  discord_webhook_id TEXT PRIMARY KEY,
  discord_server_invite TEXT,
  discord_webhook TEXT
);