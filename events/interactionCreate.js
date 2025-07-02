const { Events } = require("discord.js");
const config = require("../config.json");

const allowedGuilds = config.allowedGuilds;
const allowedChannels = config.allowedChannels;
const isDevMode = config.devMode === true;

module.exports = {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    if (isDevMode && !allowedGuilds.includes(interaction.guild.id)) {
      return interaction.reply({
        content: "This interaction can only be used on allowed servers.",
        ephemeral: true,
      });
    }

    if (isDevMode && !allowedChannels.includes(interaction.channel.id)) {
      return interaction.reply({
        content: "This interaction can only be used in specific channels.",
        ephemeral: true,
      });
    }

    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({
          content: `\`${interaction.commandName}\` is not a command!`,
          ephemeral: true,
        });
      }

      try {
        await command.execute(client, interaction);
      } catch (e) {
        console.log(e);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};
