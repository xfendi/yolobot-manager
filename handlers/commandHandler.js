const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const loadCommands = (client) => {
  const commandsPath = path.join(__dirname, "../commands");
  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));

      if ("data" in command && "execute" in command) {
        if (typeof command.data.toJSON !== "function") {
          console.error(
            `Command ${file} in folder ${folder} does not have a valid data.toJSON() function.`
          );
        } else {
          client.commands.set(command.data.name, command);
          console.log(
            `[COMMAND HANDLER]: Loaded command: ${command.data.name}`
          );
        }
      } else {
        console.log(
          `[WARNING] Command ${file} in folder ${folder} is missing "data" or "execute" property.`
        );
      }
    }
  }
};

module.exports = (client) => {
  client.commands = new Map();

  loadCommands(client);
};
