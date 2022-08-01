import { Song } from "./Song";

export class Playlist {
  private static demoFilePattern: string = "https://5avu2-qaaaa-aaaai-acjya-cai.raw.ic0.app/audio/*_short.mp3";
  private static demoFileSize: number = 6;
  public songs: Song[];

  public constructor(playlist: Song[]) {
    this.songs = playlist;
  }

  public static async from() {
    let playlist = [];
    for (let i=1; i<this.demoFileSize+1; i++) {
      playlist.push(new Song({
        url: this.demoFilePattern.replace("*", String(i)),
        title: "Itoka Jukebox",
        duration: 60
      }));
    }

    return new this(playlist);
  }
}
