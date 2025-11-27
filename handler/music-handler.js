const Track = require("./track");
const YTDlpWrap = require('yt-dlp-wrap').default;

// Опции HTTP-заголовков можно объединить
const userAgentHeader = "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";
const acceptHeader = "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
const acceptLanguageHeader = "Accept-Language: en-us,en;q=0.5";
const secFetchModeHeader = "Sec-Fetch-Mode: navigate";

const args = [
   "-f", "bestaudio",
   "--no-playlist",
   `--add-header=User-Agent: ${userAgentHeader}`,
   `--add-header=Accept: ${acceptHeader}`,
   `--add-header=Accept-Language: ${acceptLanguageHeader}`,
   `--add-header=Sec-Fetch-Mode: ${secFetchModeHeader}`,
];

/**
 * Needed for audio playback, queue and history storage
 */
class MusicHandler {
   /**
    * Empty constructor, creates an empty queue and history
    * 
    */
   constructor() {
      this.current = null; 
      this.queue = [];
      this.history = [];
   }
   /**
    * 
    * @param {String} url track to add to queue
    * @returns Queue length
    */
   async addTrack(url) {
      try {
         this.queue.push(await this.extractInfoUrl(url));
         return this.queue.length;
      } catch(error) {
         throw new Error("Error from addTrack: " + error);
      }
   }

   async getLast() {
      if (this.queue.length === 0) return null;
      return this.queue[this.queue.length - 1];
   }


   /**
    * Single video is always processed 
    * @param {String} url video link
    * @returns New Track class object
    */
   async extractInfoUrl(url) {
      const yt_dlp = new YTDlpWrap();
      const metadata = await yt_dlp.getVideoInfo(url, args);
      
      const track = new Track();

      
      
      track.title = metadata.title;
      track.author = metadata.uploader;
      track.duration = metadata.duration;
      track.url = url;
      track.stream_url = metadata.url;
      track.thumbnail = metadata.thumbnails?.[0]?.url || "";

      return track;
   }

   getQueue() {
      return [...this.queue];
   }
   getHistory() {
      return [...this.history];
   }
   getCurrent() {
      return this.current;
   }

   /**
    * Checks the queue and if it is not empty, assigns the next one to the current track, and adds the previous one to the history
    * @returns null if queue empty || next track
    */
   next() {
      if(this.queue.length === 0) {
         this.current = null;
         return null;
      }
      if(this.current)
         this.history.push(this.current);

      this.current = this.queue.shift();
      return this.current;
   }

   /**
    * Checks the queue and if it is not empty, assigns the next one to the current track, and adds the previous one to the history
    * @returns null if queue empty else next track
    */
   skip() {
      return this.next();
   }

   /**
    * Checks the history and if it is not empty, assigns the next one to the current track, and adds the previous one to the queue
    * @returns null if history empty else back track
    */
   back() {
      if(this.history.length === 0) {
         this.current = null;
         return null;
      }
      if(this.current)
         this.queue.push(this.current);

      this.current = this.history.pop();
      return this.current;
   }

   isValidUrl(url) {
      const urlRegex = new RegExp(
         /^https?:\/\/[a-zA-Z0-9\-\._~:/?#\[\]@!#&'()*+,;=%]+$/
      );
      return urlRegex.test(url);
   }

   formatDuration(sec) {
      sec = Number(sec);
      if (!sec || isNaN(sec)) return "—";

      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;

      if (h > 0) {
         return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      } else {
         return `${m}:${s.toString().padStart(2, "0")}`;
      }
   }


   clearQueue() {
      this.queue = [];
   }
   clearHistory() {
      this.history = [];
   }
   clearAll() {
      this.queue = [];
      this.history = [];
      this.current = null;
   }
}

module.exports = MusicHandler;