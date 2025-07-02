const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },

  realized: { type: Boolean, required: true, default: false },
  realizedAt: { type: Date },
  realizedById: { type: String },

  guildId: { type: String },
});

module.exports = mongoose.model("License", licenseSchema);
