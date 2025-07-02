const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();
require("colors");

module.exports = (client) => {
  const commands = [];
  const foldersPath = path.join(__dirname, "../commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            .yellow
        );
      }
    }
  }

  const rest = new REST().setToken(process.env.TOKEN);

  (async () => {
    try {
      console.log(
        `[DEPLOY COMMANDS] Started refreshing ${commands.length} application (/) commands.`
          .gray
      );

      const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );

      console.log(
        `[DEPLOY COMMANDS] Successfully reloaded ${data.length} application (/) commands.`
          .green
      );
    } catch (e) {
      console.error(e);
    }
  })();
};
