import { Guild, Message, MessageEmbed, Permissions } from "discord.js";
import { i18n } from "../utils/i18n";
import { bot } from "../index";

export default {
  name: "server",
  description: i18n.__("display all severs which are listening to Itoka NFT music"),
  async execute(message: Message) {
    let res = `communities are listening to Itoka NFT music: \n`;
    let temp_arr: (string | undefined)[] = [];
    Object.keys(bot.guild2channel).forEach((guildId) => {
      res = res + `\`${bot.client.guilds.cache.get(guildId)}\` \n`;
      temp_arr.push(bot.client.guilds.cache.get(guildId)?.name);
    });

    res = res + `\`${temp_arr.length}\` communities are streaming Itoka NFT music! \n`;

    message.reply(res).catch(console.error);
  }
};
