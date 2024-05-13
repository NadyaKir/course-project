import mongoose from "mongoose";

const enumCategories = ["Books", "Signs", "Silverware", "Other"];

const collectionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: enumCategories,
    required: true,
  },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
});

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
