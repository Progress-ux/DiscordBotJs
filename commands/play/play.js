const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const { getMusicHandler } = require('../../handler/manager');
// const { request } = require('undici');
const ytdl = require('@distube/ytdl-core'); 

module.exports = {
   data: new SlashCommandBuilder()
      .setName("play")
      .setDescription("Play audio")
      
      .addSubcommand(subcommand =>
         subcommand
            .setName('link')
            .setDescription('Play via URL link')
            .addStringOption(option =>
               option.setName('url')
                  .setDescription('The audio link (URL)')
                  .setRequired(true) 
            )
      )
     
      .addSubcommand(subcommand =>
         subcommand
            .setName('title')
            .setDescription('Find and play by title')
            .addStringOption(option =>
               option.setName('query') 
                  .setDescription('The title/query to search for')
                  .setRequired(true) 
            )
      )
      
      .addSubcommand(subcommand =>
         subcommand
            .setName('playlist')
            .setDescription('Play an entire playlist via link')
            .addStringOption(option =>
               option.setName('playlist_url')
                  .setDescription('The playlist link (URL)')
                  .setRequired(true) 
            )
      ),
      
   async execute(interaction) {

      const channel = interaction.member.voice.channel;
      if (!channel) return interaction.reply("Сначала зайдите в голосовой канал!");

      await interaction.deferReply()

      let track;

      const connection = joinVoiceChannel({
         channelId: channel.id,
         guildId: channel.guild.id,
         adapterCreator: channel.guild.voiceAdapterCreator,
      });

      const subcommand = interaction.options.getSubcommand();
      const musicHandler = getMusicHandler(interaction.guild.id);
      if (subcommand === 'link') {
         let url = interaction.options.getString('url');
         
         // Логика для обработки URL
         if(!musicHandler.isValidUrl(url))
            {
               await interaction.editReply("Введена неправильная ссылка.");
               return;
            }
            
         url = url.replace(/(\?|&)list=[^&]+/, "");

         try {
            await musicHandler.addTrack(url);
         } catch (error) {
            console.error("Ошибка при извлечении метаданных: " + error);
            
            if (interaction.deferred || interaction.replied) {
               return await interaction.editReply("Произошла ошибка при получении информации о видео.");
            } else {
               return await interaction.reply({ 
                  content: "Произошла ошибка при получении информации о видео.", 
                  flags: [MessageFlags.Ephemeral] 
               });
            }
         }

         track = await musicHandler.getLast();
         const duration = musicHandler.formatDuration(track.duration);

         try {
            const embed = new EmbedBuilder()
               .setColor(0x5865F2)
               .setTitle(track.title)
               .setURL(track.url)
               .addFields(
                  { name: "Автор", value: track.author || "Неизвестно", inline: true },
                  { name: "Длительность", value: String(duration) || "—", inline: true },
                  { name: "Добавил", value: `<@${interaction.user.id}>`, inline: false }
               )
               .setThumbnail(track.thumbnail);
            
            await interaction.editReply({ embeds: [embed] });

         } catch (error) {
            console.error("Произошла ошибка при построении embed: " + error);
            
            if (interaction.deferred || interaction.replied) {
               return await interaction.editReply("Произошла ошибка при построении embed.");
            } else {
               return await interaction.reply({ 
                  content: "Произошла ошибка при построении embed.", 
                  flags: [MessageFlags.Ephemeral] 
               });
            }
         }
         // await interaction.reply(`Playing from URL: ${url}`);
      } else if (subcommand === 'title') {
         const title = interaction.options.getString('query');
         // Логика для обработки названия

         await interaction.reply(`Searching for title: ${title}`);
      } else if (subcommand === 'playlist') {
         const playlistUrl = interaction.options.getString('playlist_url');
         // Логика для обработки плейлиста

         await interaction.reply(`Playing playlist from URL: ${playlistUrl}`);
      }
      // ! БАГ: нет воспроизведения аудио
      // ! после исправления перенести воспроизведения в musicHandler!
      try {
         const player = createAudioPlayer();
         const resource = createAudioResource(track.stream_url);
   
         connection.subscribe(player);
         player.play(resource);
   
         player.on('error', (error) => {
            console.error('Error:', error.message, 'while playing track URL:', track ? track.url : 'Unknown');
         });

         player.on(AudioPlayerStatus.Idle, () => {
            console.log("Трек завершился");
            // Здесь можно запускать следующий трек из очереди
         });
      } catch (error) {
         console.error("Error: " + error);
      }

   }
}