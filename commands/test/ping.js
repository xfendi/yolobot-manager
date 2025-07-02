const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Checks the bot latecy"),
  async execute(client, interaction) {
    const embed = new EmbedBuilder()
      .setColor(mConfig.embedColorPrimary)
      .setTitle("Pong!")
      .setDescription(`Application latecy is: **${client.ws.ping} ms**`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
