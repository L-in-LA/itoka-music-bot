import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { Message, MessageEmbed } from "discord.js";
import { bot } from "../index";
import { MusicQueue } from "../structs/MusicQueue";
import { Playlist } from "../structs/Playlist";
import { i18n } from "../utils/i18n";

export default {
  name: "playlist",
  cooldown: 5,
  aliases: ["pl"],
  description: i18n.__("playlist.description"),
  permissions: ["CONNECT", "SPEAK", "ADD_REACTIONS", "MANAGE_MESSAGES"],
  async execute(message: Message, args: any[]) {
    const { channel } = message.member!.voice;

    const queue = bot.queues.get(message.guild!.id);

    if (!args.length)
      return message.reply(i18n.__mf("playlist.usagesReply", { prefix: bot.prefix })).catch(console.error);

    if (!channel) return message.reply(i18n.__("playlist.errorNotChannel")).catch(console.error);

    if (queue && channel.id !== queue.connection.joinConfig.channelId)
      return message
        .reply(i18n.__mf("play.errorNotInSameChannel", { user: message.client.user!.username }))
        .catch(console.error);

    let playlist;

    try {
      playlist = await Playlist.from();
    } catch (error) {
      console.error(error);

      return message.reply(i18n.__("playlist.errorNotFoundPlaylist")).catch(console.error);
    }

    const newQueue = new MusicQueue({
      message,
      connection: joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
      })
    });
    bot.queues.set(message.guild!.id, newQueue);

    let songs = playlist.songs;
    let songIndex = 0;

    while (songs.length!=0) {
      newQueue.enqueue(songs[songIndex]);
      await new Promise(f => setTimeout(f, 60));
      songIndex++;
      if (songIndex == songs.length) {
        songIndex = 0;
        songs.sort(() => (Math.random() > .10) ? 1 : -1);
      }
    }

    message
      .reply({
        content: i18n.__mf("playlist.startedPlaylist", { author: message.author })
      })
      .catch(console.error);
  }
};
