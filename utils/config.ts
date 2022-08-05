import "dotenv/config";
import { Config } from "../interfaces/Config";

let config: Config;

try {
  config = require("../config.json");
} catch (error) {
  config = {
    TOKEN: "MTAwMzQyNzY3ODM2MTIyNzI4NA.GFUF_2.C6Zev3re2Auxq9SrSQskfYaT4udMAMfjRWPwkc",
    PREFIX: process.env.PREFIX || "!",
    MAX_PLAYLIST_SIZE: parseInt(process.env.MAX_PLAYLIST_SIZE!) || 10,
    PRUNING: process.env.PRUNING === "true" ? true : false,
    STAY_TIME: parseInt(process.env.STAY_TIME!) || 30,
    DEFAULT_VOLUME: parseInt(process.env.DEFAULT_VOLUME!) || 100,
    LOCALE: process.env.LOCALE || "en",
    AWS: {
      accessKeyId: "AKIARFHWK4WFH4USYN7G",
      region: "us-east-1",
      secretAccessKey: "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"
    }
  };
}

export { config };
