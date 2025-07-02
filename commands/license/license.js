const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");

const License = require("../../models/license");
const { generateUniqueLicenseCode } = require("../../lib/generateLicenseCode");
const { getLicenseEmoji } = require("../../lib/getLicenseEmoji");

const licenseTypes = [
  { label: "Premium", value: "premium" },
  { label: "Standard", value: "standard" },
  { label: "Partnerships", value: "partnerships" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("license")
    .setDescription("Manage licenses")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("generate")
        .setDescription("Generate a license code")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("The type of license to generate")
            .setRequired(true)
            .addChoices(
              ...licenseTypes.map((type) => ({
                name: type.label,
                value: type.value,
              }))
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("Info about a license")
        .addStringOption((option) =>
          option
            .setName("code")
            .setDescription("The license code to get info about")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a license")
        .addStringOption((option) =>
          option
            .setName("code")
            .setDescription("The license code to delete")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List all licenses")
    ),
  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    const type = interaction.options.getString("type");

    if (subcommand === "generate") {
      const generatedLicenseCode = await generateUniqueLicenseCode();

      const newLicense = new License({
        type,
        code: generatedLicenseCode,
      });

      await newLicense.save();

      const embed = new EmbedBuilder()
        .setColor(mConfig.embedColorPrimary)
        .setTitle("License generated!")
        .setDescription("Sucessfully generated a new license code!")
        .setFields([
          {
            name: "License code",
            value: `\`${generatedLicenseCode}\``,
          },
          {
            name: "License type",
            value: `${getLicenseEmoji(newLicense.type)}`,
          },
        ])
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } else if (subcommand === "info") {
      const code = interaction.options.getString("code");

      const license = await License.findOne({ code });

      if (!license) {
        return interaction.reply({
          content: "No license found with that code!",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(mConfig.embedColorPrimary)
        .setTitle("License info")
        .setDescription("Here is the info about your license:")
        .setFields([
          {
            name: "License code",
            value: `\`${license.code}\``,
          },
          {
            name: "License type",
            value: `${getLicenseEmoji(license.type)}`,
          },
          {
            name: "Created at",
            value: `<t:${Math.floor(license.createdAt.getTime() / 1000)}:f>`,
          },
          {
            name: "Realized",
            value: license.realized
              ? "<a:YES:1389859682935373866>"
              : "<a:NO:1389859658570793002>",
          },
        ])
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      if (license.realized) {
        embed.addFields({
          name: "Realized at",
          value: `<t:${Math.floor(license.realizedAt.getTime() / 1000)}:f>`,
        });
        embed.addFields({
          name: "Realized by",
          value: `<@${license.realizedById}> (${license.realizedById})`,
        });
      }

      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } else if (subcommand === "delete") {
      const code = interaction.options.getString("code");

      const license = await License.findOne({ code });

      if (!license) {
        return interaction.reply({
          content: "No license found with that code!",
          ephemeral: true,
        });
      }

      await license.deleteOne();

      const embed = new EmbedBuilder()
        .setColor(mConfig.embedColorPrimary)
        .setTitle("License deleted!")
        .setDescription("Sucessfully deleted a license!")
        .setFields([
          {
            name: "License code",
            value: `\`${license.code}\``,
          },
          {
            name: "License type",
            value: `${getLicenseEmoji(license.type)}`,
          },
        ])
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } else if (subcommand === "list") {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_license_type")
        .setPlaceholder("Choose license type")
        .addOptions(licenseTypes);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const startEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorPrimary)
        .setTitle("Licenses list")
        .setDescription("Choose license type from the menu below")
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      await interaction.reply({
        embeds: [startEmbed],
        components: [row],
        ephemeral: true,
      });

      const filter = (i) =>
        i.customId === "select_license_type" &&
        i.user.id === interaction.user.id;

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        await i.deferUpdate();
        const selectedType = i.values[0];

        const licenses = await License.find({ type: selectedType });

        if (licenses.length === 0) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(mConfig.embedColorPrimary)
                .setTitle("No licenses found")
                .setDescription(`There are no licenses of type ${selectedType}`)
                .setFooter({ text: mConfig.footerText })
                .setTimestamp(),
            ],
            components: [row],
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor(mConfig.embedColorPrimary)
          .setTitle("Licenses")
          .setDescription(`Here are all licenses of type ${selectedType}:`)
          .setFields(
            licenses.map((license) => {
              const guild = client.guilds.cache.get(license.guildId);

              return {
                name: license.code,
                value: `${
                  license.realized
                    ? "<a:YES:1389859682935373866>"
                    : "<a:NO:1389859658570793002>"
                }︲${guild ? `\`${guild.name}\`︲` : ""}${getLicenseEmoji(
                  license.type
                )}`,
              };
            })
          )
          .setFooter({ text: mConfig.footerText })
          .setTimestamp();

        await interaction.editReply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });
      });

      collector.on("end", () => {
        interaction.editReply({ components: [] });
      });
    } else {
      interaction.reply({
        content: "Subcommand not found!",
        ephemeral: true,
      });
    }
  },
};
