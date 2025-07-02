const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Displays information about the bot'),

  async execute(client, interaction) {
    const embed = new EmbedBuilder()
      .setColor(mConfig.embedColorPrimary)
      .setTitle(`${client.user.tag} Information`)
      .addFields(
        { name: 'Bot ID', value: client.user.id },
        { name: 'Total Servers', value: `${client.guilds.cache.size}` },
        { name: 'Uptime', value: `${Math.floor(client.uptime / 1000)} seconds` },
        { name: 'Created At', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:D>` }
      )
      .setFooter({ text: mConfig.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
