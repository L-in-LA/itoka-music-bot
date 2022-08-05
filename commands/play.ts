import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { Message } from "discord.js";
import { bot } from "../index";
import { MusicQueue } from "../structs/MusicQueue";
import { Song } from "../structs/Song";
import { i18n } from "../utils/i18n";
import { playlistPattern } from "../utils/patterns";
// import request from "request-promise";
import request from "request";
import NodeID3 from "node-id3";
import fs from "fs";

// ICP
import { Ed25519KeyIdentity, Secp256k1KeyIdentity } from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
import Identity from "@dfinity/identity";
import { Actor, HttpAgent } from "@dfinity/agent";
// const { idlFactory: idlFactory_nft } = require("../declarations/itoka_nft.did");
// @ts-ignore
import { idlFactory } from "../declarations/itoka_nft.did";
const sha256 = require("sha256");
// const fetch = (input: any, init?: any) => import("node-fetch").then(({ default: fetch }) => fetch(input, init));
import { RequestInfo, RequestInit } from "node-fetch";
const fetch = (url: any, init?: any) => import("node-fetch").then(({ default: fetch }) => fetch(url, init));
import crypto from "crypto";

const getActor = (canisterId: string, idlFactory: any, identity: any) => {
  const agent = new HttpAgent({
    fetch: fetch as any,
    identity: identity,
    host: `https://${canisterId}.ic0.app`
  });

  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId: canisterId
  });
  return actor;
};

let canisterId_nft = "4y4bz-6aaaa-aaaai-acj4a-cai";

let getTokenInfo = async (actor: any, tokenId: any) => {
  const res = await actor.getTokenInfo(tokenId).catch((e: any) => {
    return "Error" + e;
  });
  return res;
};

let retriveAudioCompressedSrc = async (actor: any, tokenId: any, to: string) => {
  const res = await actor.retriveAudioCompressedSrc(tokenId, Principal.fromText(to)).catch((e: any) => {
    return "Error" + e;
  });
  return res;
};

export default {
  name: "play",
  cooldown: 3,
  aliases: ["p"],
  description: i18n.__("play.description"),
  permissions: ["CONNECT", "SPEAK", "ADD_REACTIONS", "MANAGE_MESSAGES"],
  async execute(message: Message, args: string[]) {
    const { channel } = message.member!.voice;

    if (!channel) return message.reply(i18n.__("play.errorNotChannel")).catch(console.error);

    const queue = bot.queues.get(message.guild!.id);

    if (queue && channel.id !== queue.connection.joinConfig.channelId)
      return message
        .reply(i18n.__mf("play.errorNotInSameChannel", { user: bot.client.user!.username }))
        .catch(console.error);

    // if (!args.length) return message.reply(i18n.__mf("play.usageReply", { prefix: bot.prefix })).catch(console.error);

    // if (args.length) return

    // get the first song
    if (!bot.guild2identity[message.guild!.id]) {
      return message.reply(i18n.__("play.errorNotChannel")).catch(console.error);
    }

    let icPem = bot.guild2identity[message.guild!.id].identity;
    const privateKey = Uint8Array.from(sha256(icPem, { asBytes: true }));
    const identity = Secp256k1KeyIdentity.fromSecretKey(privateKey);
    // console.log("icPem", icPem);
    // console.log("identity.getPrincipal()", identity.getPrincipal().toText());
    let actor_nft = getActor(canisterId_nft, idlFactory, identity);

    // const url = args[0];

    const loadingReply = await message.reply("⏳ Connecting to ICP canister...");

    // TODO
    // randomize the first song

    let tokenId = Number("7");

    // get url
    retriveAudioCompressedSrc(actor_nft, tokenId, identity.getPrincipal().toText()).then(async (res_src) => {
      if (res_src.Err) {
        await loadingReply.delete();
        console.error(res_src.Err);
        return message.reply(i18n.__("common.errorCommand")).catch(console.error);
      }
      let url = res_src.Ok.AudioSrc[0].split(",")[1];
      // const mp3FileURL = url;
      // const mp3FileHEAD = await request.head(mp3FileURL);
      // const serverAcceptRangeReq =
      // mp3FileHEAD.headers["Accept-Ranges"] && mp3FileHEAD.headers["Accept-Ranges"].toLowerCase() != "none";
      // const mp3FileSize = mp3FileHEAD.headers;
      // content-range
      // console.log(mp3FileHEAD.getHeader("Content-Length"));
      // const tagBytesHeader = { Range: `${mp3FileSize - 355}-${mp3FileSize}` };
      // const tagBytes = await request.get(mp3FileURL, { headers: tagBytesHeader });
      // console.log("tagBytes", tagBytes);
      // get album cover the rest of atrributes
      getTokenInfo(actor_nft, tokenId).then(async (res_info) => {
        if (res_info.Err) {
          await loadingReply.delete();
          console.error(res_info.Err);
          return message.reply(i18n.__("common.errorCommand")).catch(console.error);
        }
        console.log(res_info);
        let tokenId = Number(res_info.index).toString();
        let albumCoverLocation = res_info.metadata[0].albumCoverLocation.icp;
        let attributes = {
          bpm: Number(res_info.metadata[0].attributes.bpm).toString(),
          key: res_info.metadata[0].attributes.key,
          backbone: res_info.metadata[0].attributes.backbone,
          collection: res_info.metadata[0].attributes.collection,
          title: res_info.metadata[0].attributes.name,
          genre: res_info.metadata[0].attributes.genre[0],
          index: tokenId.toString(),
          url: url,
          albumCoverLocation: albumCoverLocation
        };

        // Start the playlist if playlist url was provided
        // if (playlistPattern.test(url)) {
        //   await loadingReply.delete();
        //   return bot.commands.get("playlist")!.execute(message, args);
        // }

        let song;

        try {
          song = await Song.from(attributes);
        } catch (error) {
          console.error(error);
          return message.reply(i18n.__("common.errorCommand")).catch(console.error);
        } finally {
          await loadingReply.delete();
        }

        if (queue) {
          queue.songs.push(song);

          return message
            .reply(i18n.__mf("play.queueAdded", { title: song.title, author: message.author }))
            .catch(console.error);
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
        newQueue.enqueue(song);
      });
    });
  }
};
