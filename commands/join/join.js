const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('join')
      .setDescription('join voice'),

   async execute(interaction) {
      const member = interaction.member;
      const voiceChannel = member.voice.channel;

      if(!voiceChannel)
      {
         return interaction.reply({
            content: "You need to be in a voice channel for me to join", 
            flags: [MessageFlags.Ephemeral]
         });
      }

      try {
         const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
         });
         await interaction.reply({ 
            content: `Joined voice channel: ${voiceChannel.name}`, 
            // ephemeral: false
         });
      } catch (error) {
         console.error(`Error joing voice channel ${voiceChannel.name} from ${interaction.guild.id}: ${error}`);
         await interaction.reply({ 
            content: 'Could not join the voice channel.', 
            flags: [MessageFlags.Ephemeral]
         });
      }
   }
}