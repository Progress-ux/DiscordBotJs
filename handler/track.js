class Track {
   constructor() {
      this.title = "";
      this.author = "";
      this.duration = 0;
      this.url = "";
      this.stream_url = "";
      this.BEGIN_URL = "https://youtu.be/";
   }

   // set title(value) { this.title = value; }
   // set author(value) { this.author = value; }
   // set duration(value) { this.duration = value; }
   // set url(value) { this.url = value; }
   // set stream_url(value) { this.stream_url = value; }

   // get title() { return this.title; }
   // get author() { return this.author; }
   // get duration() { return this.duration; }
   // get url() { return this.url; }
   // get stream_url() { return this.stream_url; }
   // get BEGIN_URL() { return this.BEGIN_URL; }
}

module.exports = Track;