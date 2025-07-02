require("colors");
require("dotenv").config();
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { TOKEN } = process.env;

const {
  Guilds,
  GuildMembers,
  GuildMessages,
  MessageContent,
  GuildBans,
  GuildVoiceStates,
} = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel } = Partials;

const client = new Client({
  partials: [User, Message, GuildMember, ThreadMember, Channel],
  intents: [
    Guilds,
    GuildMembers,
    GuildMessages,
    MessageContent,
    GuildBans,
    GuildVoiceStates,
  ],
});

client.commands = new Collection();
const commandHandler = require("./handlers/commandHandler");
const eventHandler = require("./handlers/eventHandler");

const deployCommands = require("./scripts/deployCommands");

commandHandler(client);
eventHandler(client);

deployCommands(client);

client.login(TOKEN);
