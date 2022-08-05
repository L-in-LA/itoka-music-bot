const dynamoose = require("dynamoose");
const { getuid } = require("process");

const data_schema = new dynamoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now(),
    hashKey: true
  },

  user_id: {
    type: String,
    required: true
  },

  isStreaming: {
    type: Boolean,
    require: true
  },

  guildId: {
    type: String,
    require: true
  },

  channelId: {
    type: String,
    require: true
  }
});

module.exports = dynamoose.model("UserStreaming", data_schema);
