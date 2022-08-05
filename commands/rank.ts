import { Guild, Message, MessageEmbed, Permissions } from "discord.js";
import { i18n } from "../utils/i18n";
import { bot } from "../index";

function parseMilliseconds(milliseconds: number) {
  const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

  return {
    days: roundTowardsZero(milliseconds / 86400000),
    hours: roundTowardsZero(milliseconds / 3600000) % 24,
    minutes: roundTowardsZero(milliseconds / 60000) % 60,
    seconds: roundTowardsZero(milliseconds / 1000) % 60
  };
}

export default {
  name: "rank",
  description: i18n.__("Streaming Ranking"),
  async execute(message: Message) {
    let res = `===Community Streaming Ranking===\n`;

    const sortable_guild = Object.entries(bot.guildTotalStreaming)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    let counter = 0;
    let totalStreaming = 0;
    for (const [guildId, streamingAmount] of Object.entries(sortable_guild)) {
      totalStreaming = totalStreaming + Number(streamingAmount);
      if (counter < 10) {
        let streamingAmount_parsed = parseMilliseconds(Number(streamingAmount));
        res =
          res +
          `\`${bot.client.guilds.cache.get(guildId)}\`:${streamingAmount_parsed.days} days,${
            streamingAmount_parsed.hours
          } hours,${streamingAmount_parsed.minutes} minutes,${streamingAmount_parsed.seconds} seconds  \n`;
        counter++;
      }
    }

    res = res + `===User Streaming Ranking===\n`;

    const sortable_user = Object.entries(bot.userTotalStreaming)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    counter = 0;
    for (const [userId, streamingAmount] of Object.entries(sortable_user)) {
      if (counter < 10) {
        let streamingAmount_parsed = parseMilliseconds(Number(streamingAmount));
        res =
          res +
          `${bot.client.users.cache.get(userId)}:${streamingAmount_parsed.days} days,${
            streamingAmount_parsed.hours
          } hours,${streamingAmount_parsed.minutes} minutes,${streamingAmount_parsed.seconds} seconds  \n`;
        counter++;
      }
    }

    res = res + `\n===Jukebox Summary===\n`;
    let streamingAmount_parsed = parseMilliseconds(Number(totalStreaming));
    res =
      res +
      `:point_right: \`${streamingAmount_parsed.days}\` days,\`${streamingAmount_parsed.hours}\` hours,\`${streamingAmount_parsed.minutes}\` minutes,\`${streamingAmount_parsed.seconds}\` seconds in total!\n`;

    res =
      res +
      `:point_right: \`${
        Object.keys(bot.userTotalStreaming).length
      }\` users listened Itoka music NFT! \n`;
    res = res + `:point_right: \`${Object.keys(sortable_guild).length}\` communities are streaming Itoka music NFT! \n`;

    message.reply(res).catch(console.error);
  }
};
