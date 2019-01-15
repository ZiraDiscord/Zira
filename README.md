# Zira
[![discord](https://discordapp.com/api/guilds/532372609476591626/widget.png?style=shield)](https://zira.pw/support)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/765b4d42b5b74bbc853a8d8da7b695e9)](https://www.codacy.com/app/Zira/Zira?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ZiraDiscord/Zira&amp;utm_campaign=Badge_Grade)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/zira/localized.svg)](https://translate.zira.pw/project/zira)
# Update
Zira is getting revived. Along with this revive there will be a rewrite of the bot and [dashboard](https://zira.pw).

For updates join the [support guild](https://zira.pw/support).

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

4. Copy `pm2.example.json` to `pm2.json` and fill in the env variables

5. Run `git submodule init` and `git submodule update` to get the language files

6. Start the bot with `pm2 start pm2.json`
