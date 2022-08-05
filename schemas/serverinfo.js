const dynamoose = require("dynamoose");
const { getuid } = require("process");

const data_schema = new dynamoose.Schema({

  guildId: {
    type: String,
    require: true
  },

  commandChannelId: {
    type: String,
    require: true
  },  

  timestamp: {
    type: Date,
    default: Date.now(),
    hashKey: true
  },
});

module.exports = dynamoose.model("serverinfo", data_schema);
