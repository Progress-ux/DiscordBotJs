class MusicHandler {
   constructor() {
      this.current = null;
      this.queue = [];
      this.history = [];
   }
   addTrack(track) {
      if(!(track instanceof require("./track")))
         throw new Error("Expected instance of Track");
      this.queue.push(track);
      return this.queue.length;
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

   skip() {
      return this.next();
   }

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

   clearQueue() {
      this.queue = [];
   }
   clearHistory() {
      this.history = [];
   }
   clearAll() {
      this.clearQueue();
      this.clearHistory();
      this.current = null;
   }
}

module.exports = MusicHandler;