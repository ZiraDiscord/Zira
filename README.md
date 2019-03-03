# Zira

[![discord](https://discordapp.com/api/guilds/532372609476591626/widget.png?style=shield)](https://zira.ovh/support)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/zira/localized.svg)](https://translate.zira.ovh/project/zira)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/765b4d42b5b74bbc853a8d8da7b695e9)](https://www.codacy.com/app/Zira/Zira?utm_source=github.com&utm_medium=referral&utm_content=ZiraDiscord/Zira&utm_campaign=Badge_Grade)
[![Discord Bots](https://discordbots.org/api/widget/status/275813801792634880.svg)](https://discordbots.org/bot/275813801792634880)

# Support

We do not offer support in hosting your own version of Zira, if you find a bug, please make an issue here, do not create an issue to ask for help setting up a self-hosted version of Zira.

If you find issues with the public version of Zira, please [join our support server](https://discord.gg/txeTgNr)

# Update

Zira has been revived. Invite the bot here: https://zira.ovh/invite

# Install Guide

## Prerequisites

[MongoDB](https://www.mongodb.com/)

[Node JS](https://nodejs.org)

## Installation

1. Clone this repo

   ```
   git clone https://github.com/ZiraDiscord/Zira.git
   ```

2. Run `npm i -g pm2` to install [PM2](http://pm2.keymetrics.io/)

3. Run `npm i` to install dependencies

4. Copy `pm2.example.json` to `pm2.json` and fill in the env variables, if your mongo database has no auth setup you can omit the `username:password@` part of the DB_URI

5. Run `git submodule init` and `git submodule update` to get the language files

6. Start the bot with `pm2 start pm2.json`

# Info

If you no longer want to host your own version of Zira, [join our support guild](https://discord.gg/txeTgNr) and we can import your configuration into the public version of the bot.
