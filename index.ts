import { Client, Intents } from "discord.js";
import { Bot } from "./structs/Bot";
import { config } from "./utils/config";

import dynamoose from "dynamoose";
dynamoose.aws.sdk.config.update(config.AWS);

export const bot = new Bot(
  new Client({
    restTimeOffset: 0,
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.DIRECT_MESSAGES
    ]
  })
);
