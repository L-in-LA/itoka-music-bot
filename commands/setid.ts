import { Message, MessageEmbed, Permissions } from "discord.js";
import { i18n } from "../utils/i18n";
import { bot } from "../index";
import crypto from "crypto";
const sha256 = require("sha256");
const { Ed25519KeyIdentity, Secp256k1KeyIdentity } = require("@dfinity/identity");

export default {
  name: "setid",
  description: i18n.__("set voiceChannel and CommandChannel"),
  async execute(message: Message) {
    const member = await message.guild!.members.fetch({ user: message.author.id });
    if (member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
      const { channel } = message.member!.voice;
      if (!channel) return message.reply(i18n.__("play.errorNotChannel")).catch(console.error);
      // console.log(member.user);
      // console.log("member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)",member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS));
      let guildId = channel.guildId;
      let voiceChannel = channel.id;
      let commandChannel = message.channelId;
      if (guildId.toString() in Object.keys(bot.guild2channel) == false) {
        let icPem = crypto.randomBytes(64).toString("hex");
        const privateKey = Uint8Array.from(sha256(icPem, { asBytes: true }));
        const identity = Secp256k1KeyIdentity.fromSecretKey(privateKey);

        bot.guild2identity[guildId.toString()] = {
          identity: icPem.toString(),
          principal: identity.getPrincipal().toText()
        };
      }

      bot.guild2channel[guildId.toString()] = {
        voiceChannelId: voiceChannel.toString(),
        commandChannelId: commandChannel.toString()
      };

      for (const item of Object.values(bot.guild2channel)) {
        bot.pre_member[item.voiceChannelId] = {};
      }

      // console.log(bot.guild2channel);

      // console.log("guild2identity", bot.guild2identity);
      message
        .reply(
          `Channel set up successful:\n` +
            `Server: ${channel.guild.name}\n` +
            `VoiceChannel: ${channel}\n` +
            `CommandChannel: ${message.channel}\n` +
            `GuildId: \`${guildId.toString()}\`\n` +
            `CommandChannelId: \`${bot.guild2channel[guildId.toString()].commandChannelId}\`\n` +
            `VoiceChannelId: \`${bot.guild2channel[guildId.toString()].voiceChannelId}\`\n`
        )
        .catch(console.error);
    } else {
      message
        .reply(
          `Sorry you do not have the permission to set up the channels. Please contact admin to set up Itoka Jukebox thank you!`
        )
        .catch(console.error);
    }

    // console.log("member.permissions.has(Permissions.FLAGS.KICK_MEMBERS )",member.permissions.has(Permissions.FLAGS.KICK_MEMBERS));

    // .me.hasPermission("MUTE_MEMBERS");

    // console.log(member.hasPermission("MUTE_MEMBERS"));

    // let guildId = channel.guildId;
    // let voiceChannel = channel.id;
    // let commandChannel = message.channelId;

    // console.log("guildId", guildId);
    // console.log("voiceChannel", voiceChannel);
    // console.log("commandChannel", commandChannel);

    // message
    //   .reply(i18n.__mf("ping.result", { ping: Math.round(message.client.ws.ping) }))
    //   .catch(console.error);
  }
};
