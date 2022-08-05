import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import youtube from "youtube-sr";
import { getInfo } from "ytdl-core";
import ytdl from "ytdl-core-discord";
import { i18n } from "../utils/i18n";
import { videoPattern } from "../utils/patterns";
import { MessageEmbed } from "discord.js";

export interface SongData {
  url: string;
  title: string;
  duration: number;
  bpm: string;
  key: string;
  backbone: string;
  collection: string;
  genre: string;
  index: string;
  albumCoverLocation: string;
}

export class Song {
  public readonly url: string;
  public readonly title: string;
  public readonly bpm: string;
  public readonly key: string;
  public readonly backbone: string;
  public readonly collection: string;
  public readonly genre: string;
  public readonly index: string;
  public readonly duration: number;
  public readonly albumCoverLocation: string;

  public constructor({
    url,
    title,
    duration,
    bpm,
    key,
    backbone,
    collection,
    genre,
    index,
    albumCoverLocation
  }: SongData) {
    this.url = url;
    this.title = title;
    this.duration = duration;
    this.title = title;
    this.bpm = bpm;
    this.key = key;
    this.backbone = backbone;
    this.collection = collection;
    this.genre = genre;
    this.index = index;
    this.albumCoverLocation = albumCoverLocation;
  }

  public static async from(attributes: any) {
    return new this({
      url: attributes.url,
      title: attributes.title,
      duration: 180,
      bpm: attributes.bpm,
      key: attributes.key,
      backbone: attributes.backbone,
      collection: attributes.collection,
      genre: attributes.genre,
      index: attributes.index,
      albumCoverLocation: attributes.albumCoverLocation
    });
  }

  // public static async from(url: string = "", search: string = "") {
  //   return new this({
  //     url,
  //     title: "Itoka Jukebox",
  //     duration: 60
  //   });
  // }

  public async makeResource(): Promise<AudioResource<Song> | void> {
    return createAudioResource(this.url, { metadata: this, inputType: StreamType.Arbitrary, inlineVolume: true });
  }

  public startMessage() {
    let muxivURL = "https://ku323-qyaaa-aaaai-ackgq-cai.ic0.app/airdrop/detail/" + this.index;

    const exampleEmbed = new MessageEmbed()
      .setColor(0x0099ff)
      .setTitle(this.title)
      .setURL(`${muxivURL}`)
      .setAuthor({
        name: "Itoka µxiv",
        iconURL: "https://5avu2-qaaaa-aaaai-acjya-cai.raw.ic0.app/favicon.png",
        url: "https://www.itoka.xyz/"
      })
      .setDescription("Streaming From ICP Blockchain")
      // .setDescription("Some description here")
      // .setThumbnail("https://i.imgur.com/AfFp7pu.png")
      .addFields(
        { name: this.backbone, value: this.collection },
        { name: ":notes: Genre", value: this.genre, inline: true },
        { name: ":star: View on ", value: `[µxiv](${muxivURL})`, inline: true },
        { name: ":rocket: Buy on ", value: `[Marketplace](${muxivURL})`, inline: true }
      )
      // .addFields({ name: `:point_right: View this song on [µxiv](${muxivURL})` , inline: true })
      .setImage(this.albumCoverLocation)
      .setTimestamp()
      .setFooter({ text: "Itoka Jukebox Present" });
    return exampleEmbed;
    // return "hello";
    // return i18n.__mf("play.startedPlaying", { title: this.title, url: this.url });
  }
}
