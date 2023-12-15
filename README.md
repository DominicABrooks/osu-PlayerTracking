# osu!Flex Reborn - Player Tracking System

## Overview

osu!Flex Reborn is a Node.js-based backend, utilizing Express, PostgreSQL, and OAuth2, designed to replace a discontinued application. The primary goal is to allow users to poll tracked user accounts, post to user-supplied webhooks to post on applications such as Discord. 

![image](https://github.com/DominicABrooks/osuFlexBackend/assets/51772450/831fb496-8cfa-4c44-b4d8-27bfe591f0d4)
![image](https://github.com/DominicABrooks/osuFlexBackend/assets/51772450/1b117e3d-285a-41c9-aab3-f1404c84016e)

## Features

1. **High Score Announcements:**
   - Automatic posting to user-submitted Discord webhooks when new high scores are set.
   - Users can submit their Discord webhooks for personalized notifications.

2. **Database Design:**
   - PostgreSQL database is utilized for efficient storage of user and server data.
   - Implemented JOI in Node.js for robust input validation to ensure data integrity.

3. **Custom JSON Templator:**
   - Created a Node.js module that employs RegEx in JSON files to replace variable names with corresponding values, making it easy to tweak and edit the current announcement layout. 

## Getting Started

To run the osu!Flex Reborn backend, follow these steps:

1. Clone the repository:
``` git clone https://github.com/DominicABrooks/osuFlexBackend.git```
2. Install dependencies:
``` cd osuFlexBackend ```
```npm install```

3. Set up PostgreSQL:
- Create a PostgreSQL database and update the configuration in the project accordingly.

4. Configure OAuth2:
- Obtain OAuth2 credentials and update the .env in the project for connection to osu! protected api's.

5. Run the application:
``` cd backend && npm start ```

## Discord Webhook Configuration

1. Users can submit their Discord webhooks through the osu!Flex Reborn web interface, which isn't included in this repo as it is not complete.
2. High scores for specified users will be automatically announced to the specified Discord webhooks.
