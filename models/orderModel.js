import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Id is required."],
        },
        orderQty: {
          type: Number,
          required: [true, "Quantity is required."],
        },
        price: {
          type: Number,
          required: [true, "Price is required."],
        },
        unit: {
          type: String,
          required: [true, "Unit is required."],
          enum: ["kg", "dz", "pc"],
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "Id is required."],
        },
      },
    ],
    amount: {
      type: Number,
      required: [true, "Amount is required."],
    },
    payment_id: {
      type: String,
      default: "",
    },
    payment_intent: {
      type: String,
      default: "",
    },
    payment_method: {
      type: String,
      enum: ["cod", "card"],
      default: "cod",
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    order_status: {
      type: String,
      enum: ["pending", "delivered", "cancelled"],
      default: "pending",
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Id is required."],
    },
    phone_number: {
      type: String,
      required: [true, "Number is required."],
    },
    address: {
      type: String,
      required: [true, "Address is required."],
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
