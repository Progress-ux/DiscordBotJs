const musicHandlers = new Map();
const MusicHandler = require("./music-handler");

function getMusicHandler(guild_id) {
   if(!musicHandlers.has(guild_id)) {
      musicHandlers.set(guild_id, new MusicHandler());
      console.log(`Created MusicHandler for ${guild_id}`);
   }
   return musicHandlers.get(guild_id);
}

module.exports = { getMusicHandler };