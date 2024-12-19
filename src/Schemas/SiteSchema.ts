import { model, Schema } from "mongoose";

const siteSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    optional: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const SiteModel = model("Site", siteSchema);
