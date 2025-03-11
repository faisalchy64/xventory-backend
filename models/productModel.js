import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      lowercase: true,
      trim: true,
    },
    image: {
      optimize_url: {
        type: String,
        required: [true, "Image is required."],
      },
      public_id: {
        type: String,
        required: [true, "Id is required."],
      },
    },
    description: {
      type: String,
      required: [true, "Description is required."],
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required."],
    },
    sold: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      required: [true, "Unit is required."],
      enum: ["kg", "dz", "pc"],
    },
    seller: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Id is required."],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
