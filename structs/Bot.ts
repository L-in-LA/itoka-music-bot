import { Client, Collection, Snowflake } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { Command } from "../interfaces/Command";
import { checkPermissions } from "../utils/checkPermissions";
import { config } from "../utils/config";
import { i18n } from "../utils/i18n";
import { MissingPermissionsException } from "../utils/MissingPermissionsException";
import { MusicQueue } from "./MusicQueue";
let userStreaming = require("../schemas/userStreaming");

// ICP
const { idlFactory: idlFactory_nft } = require("../declarations/itoka_nft.did");
const Identity = require("@dfinity/identity");
const { Actor, HttpAgent } = require("@dfinity/agent");
const { Principal } = require("@dfinity/principal");
const sha256 = require("sha256");
const { Ed25519KeyIdentity, Secp256k1PublicKey } = require("@dfinity/identity");
// const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
import fetch from "node-fetch";
import crypto from "crypto";
// crypto.randomBytes(64).toString("hex");

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function parseMilliseconds(milliseconds: number) {
  const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

  return {
    days: roundTowardsZero(milliseconds / 86400000),
    hours: roundTowardsZero(milliseconds / 3600000) % 24,
    minutes: roundTowardsZero(milliseconds / 60000) % 60,
    seconds: roundTowardsZero(milliseconds / 1000) % 60
  };
}

export class Bot {
  public readonly prefix = config.PREFIX;
  public commands = new Collection<string, Command>();
  public cooldowns = new Collection<string, Collection<Snowflake, number>>();
  public queues = new Collection<Snowflake, MusicQueue>();
  public userTotalStreaming: { [key: string]: string }; // memberId: duration
  public guildTotalStreaming: { [key: string]: string }; // guildId: duration
  public pre_member: { [key1: string]: { [key2: string]: string } }; //channelId:{user:jointime}
  public guild2channel: { [key1: string]: { [key2: string]: string } } = {}; // guildId: {voiceChannelId,commandChannelId}
  public guild2identity: { [key1: string]: { [key2: string]: string } } = {}; // guildId: {principal,seedphase}

  public constructor(public readonly client: Client) {
    this.client.login(config.TOKEN);

    // voiceStateUpdate

    this.client.on("ready", () => {
      console.log(`${this.client.user!.username} ready!`);
      client.user!.setActivity(`${this.prefix}help and ${this.prefix}play`, { type: "LISTENING" });
    });

    this.client.on("warn", (info) => console.log(info));
    this.client.on("error", console.error);
    this.userTotalStreaming = {};
    this.guildTotalStreaming = {};
    this.pre_member = {};
    this.guild2channel = {};
    this.guild2identity = {};

    this.importCommands();
    this.onMessageCreate();
    this.monitorParticipation();
    // this.setGuild();
  }
  // private async setGuild() {
  //   // test server
  //   // guild 948698306819801190
  //   // voicechannel 1003430523819008101
  //   // commandchannel 1003500905309671475

  //   // Itoka
  //   // guild 927794239507685456
  //   // voicechannel 1003454912862105731
  //   // commandchannel 1003528029756194867

  //   this.guild2channel["948698306819801190"] = {
  //     voiceChannelId: "1003430523819008101",
  //     commandChannelId: "1003500905309671475"
  //   };

  //   this.guild2channel["927794239507685456"] = {
  //     voiceChannelId: "1003454912862105731",
  //     commandChannelId: "1003528029756194867"
  //   };

  //   for (const item of Object.values(this.guild2channel)) {
  //     this.pre_member[item.voiceChannelId] = {};
  //   }
  // }

  private async monitorParticipation() {
    this.client.on("voiceStateUpdate", async (oldState, newState) => {
      // if (message.author.bot || !message.guild) return;

      // Test if the use join the jukebox channel and regitered guild
      if (this.guild2channel[oldState.guild.id] == null && this.guild2channel[newState.guild.id] == null) {
        // console.log("Wrong guild");
        return;
      }
      if (
        this.guild2channel[oldState.guild.id].voiceChannelId != oldState.channelId &&
        this.guild2channel[newState.guild.id].voiceChannelId != newState.channelId
      ) {
        // console.log("Wrong channel");
        return;
      }
      let time_now = new Date();

      // member joins reg channel from a unreg channel
      if (
        this.guild2channel[newState.guild.id].voiceChannelId == newState.channelId &&
        this.guild2channel[oldState.guild.id].voiceChannelId != oldState.channelId
      ) {
        console.log("\x1b[42m%s\x1b[0m", "JOIN", " channelId: ", newState.channelId);
        if (newState.channel) {
          for (const [memberID, member] of newState.channel?.members) {
            // prevent a bot
            if (member.user.bot == false) {
              if (memberID in this.pre_member[newState.channelId] == false) {
                // memberID joined
                let data = {
                  timestamp: Date.now(),
                  user_id: String(memberID),
                  isStreaming: Boolean(true),
                  guildId: String(newState.guild.id),
                  channelId: String(newState.channelId)
                };
                console.log("data", data);
                await userStreaming.create(data).then(async (_: any, err: any) => {
                  if (err) {
                    console.log(err);
                    return;
                  }
                  if (newState.channelId != null) {
                    this.pre_member[newState.channelId][memberID] = time_now.getTime().toString();
                  }

                  console.log();
                  console.log("DB update for join");
                  console.log("guild2channel", this.guild2channel);
                  console.log("this.pre_member(join)", this.pre_member);
                  console.log("this.userTotalStreaming(join)", this.userTotalStreaming);
                  console.log("this.guildTotalStreaming(join)", this.guildTotalStreaming);
                  console.log();
                });
              }
            }
          }
        }
      }

      // member quits reg channel to a unreg channel
      if (
        this.guild2channel[oldState.guild.id].voiceChannelId == oldState.channelId &&
        this.guild2channel[newState.guild.id].voiceChannelId != newState.channelId
      ) {
        console.log("\x1b[41m%s\x1b[0m", "QUIT", " channelId: ", oldState.channelId);
        Object.keys(this.pre_member[oldState.channelId]).forEach(async (memberID) => {
          if (oldState.channel != null && oldState.channelId != null) {
            console.log("oldState.channel.members.keys()", oldState.channel.members.keys());
            console.log("this.pre_member", this.pre_member);
            if (memberID in oldState.channel.members.keys() == false) {
              // console.log(
              //   oldState.channel.members.find((u) => {
              //     u.id == memberID;
              //   })
              // );

              let data = {
                timestamp: Date.now(),
                user_id: String(memberID),
                isStreaming: Boolean(false),
                guildId: String(oldState.guild.id),
                channelId: String(oldState.channelId)
              };
              await userStreaming.create(data).then(async (_: any, err: any) => {
                if (err) {
                  console.log(err);
                  return;
                }
                // memberID quit
                if (oldState.channelId) {
                  let joinedMoment = this.pre_member[oldState.channelId][memberID];
                  delete this.pre_member[oldState.channelId][memberID];
                  if (this.userTotalStreaming[memberID]) {
                    this.userTotalStreaming[memberID] = (
                      Number(this.userTotalStreaming[memberID]) +
                      time_now.getTime() -
                      Number(joinedMoment)
                    ).toString();
                  } else {
                    this.userTotalStreaming[memberID] = (time_now.getTime() - Number(joinedMoment)).toString();
                  }

                  if (this.guildTotalStreaming[oldState.guild.id]) {
                    this.guildTotalStreaming[oldState.guild.id] = (
                      Number(this.guildTotalStreaming[oldState.guild.id]) +
                      time_now.getTime() -
                      Number(joinedMoment)
                    ).toString();
                  } else {
                    this.guildTotalStreaming[oldState.guild.id] = (
                      time_now.getTime() - Number(joinedMoment)
                    ).toString();
                  }
                }
                console.log();
                console.log("DB update for quit");
                console.log("guild2channel", this.guild2channel);
                console.log("this.pre_member(quit)", this.pre_member);
                console.log("this.userTotalStreaming(quit)", this.userTotalStreaming);
                console.log("this.guildTotalStreaming(quit)", this.guildTotalStreaming);
                console.log();
              });
            }
          }
        });
      }
    });
  }

  private async importCommands() {
    const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter((file) => file.endsWith(".ts"));

    for (const file of commandFiles) {
      const command = await import(join(__dirname, "..", "commands", `${file}`));
      this.commands.set(command.default.name, command.default);
    }
  }

  private async onMessageCreate() {
    this.client.on("messageCreate", async (message: any) => {
      if (message.content != "!setid") {
        if (this.guild2channel[message.guild.id] == null) {
          // console.log("Wrong guild");
          return;
        }
        if (this.guild2channel[message.guild.id].commandChannelId != message.channelId) {
          // console.log("Wrong channel");
          return;
        }
      }
      // console.log("message.content", message.content);

      if (message.author.bot || !message.guild) return;

      const prefixRegex = new RegExp(`^(<@!?${this.client.user!.id}>|${escapeRegex(this.prefix)})\\s*`);
      if (!prefixRegex.test(message.content)) return;

      const [, matchedPrefix] = message.content.match(prefixRegex);

      const args: string[] = message.content.slice(matchedPrefix.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      console.log(commandName);

      // @ts-ignore
      const command =
        // @ts-ignore
        this.commands.get(commandName!) ?? this.commands.find((cmd) => cmd.aliases?.includes(commandName));

      if (!command) return;
      // console.log("!command", !command);

      if (!this.cooldowns.has(command.name)) {
        this.cooldowns.set(command.name, new Collection());
      }

      const now = Date.now();
      const timestamps: any = this.cooldowns.get(command.name);
      const cooldownAmount = (command.cooldown || 1) * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.reply(i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name }));
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

      try {
        const permissionsCheck: any = await checkPermissions(command, message);

        if (permissionsCheck.result) {
          command.execute(message, args);
        } else {
          throw new MissingPermissionsException(permissionsCheck.missing);
        }
      } catch (error: any) {
        console.error(error);

        if (error.message.includes("permissions")) {
          message.reply(error.toString()).catch(console.error);
        } else {
          message.reply(i18n.__("common.errorCommand")).catch(console.error);
        }
      }
    });
  }
}
