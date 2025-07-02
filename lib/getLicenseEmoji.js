const getLicenseEmoji = (licenseType) => {
  let licenseEmoji;

  switch (licenseType) {
    case "premium":
      licenseEmoji = "<:PREMIUM:1389865191730057286>";
      break;
    case "standard":
      licenseEmoji = "<:STANDARD:1389865249485619241>";
      break;
    case "partnerships":
      licenseEmoji = "<:PARTNERSHIPS:1389876688690872330>";
      break;
    default:
      licenseEmoji = "❓";
      break;
  }

  return licenseEmoji;
};

module.exports = { getLicenseEmoji };
