import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import youtube from "youtube-sr";
import { getInfo } from "ytdl-core";
import ytdl from "ytdl-core-discord";
import { i18n } from "../utils/i18n";
import { videoPattern } from "../utils/patterns";

export interface SongData {
  url: string;
  title: string;
  duration: number;
}

export class Song {
  public readonly url: string;
  public readonly title: string;
  public readonly duration: number;

  public constructor({ url, title, duration }: SongData) {
    this.url = url;
    this.title = title;
    this.duration = duration;
  }

  public static async from(url: string = "", search: string = "") {
    return new this({
      url,
      title: "Itoka Jukebox",
      duration: 60
    });
  }

  public async makeResource(): Promise<AudioResource<Song> | void> {
    return createAudioResource(this.url, { metadata: this, inputType: StreamType.Arbitrary, inlineVolume: true });
  }

  public startMessage() {
    return i18n.__mf("play.startedPlaying", { title: this.title, url: this.url });
  }
}
