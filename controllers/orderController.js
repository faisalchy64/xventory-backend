import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import stripe from "../utils/stripe.js";

export const getOrders = async (req, res, next) => {
  try {
    const { seller, page } = req.query;
    const skip = page > 1 ? (page - 1) * 6 : 0;

    if (req.decoded._id === seller || req.decoded.isAdmin) {
      const query = req.decoded.isAdmin
        ? {}
        : { "products.seller": { $eq: seller } };
      const orders = await Order.find(query)
        .populate("products.product", "name image")
        .populate("products.seller", "name email")
        .populate("customer", "name email")
        .limit(6)
        .skip(skip);
      const total = await Order.countDocuments(query);

      return res.send({ status: 200, data: { orders, total } });
    }

    next({ status: 403, message: "Forbidden user access." });
  } catch (err) {
    next({ message: "Fetch orders request failed." });
  }
};

export const getPurchaseHistory = async (req, res, next) => {
  try {
    const { customer, page } = req.query;
    const skip = page > 1 ? (page - 1) * 6 : 0;

    if (req.decoded._id === customer) {
      const orders = await Order.find({ customer })
        .populate("products.product", "name image")
        .populate("customer", "name email")
        .populate("products.seller", "name email")
        .limit(6)
        .skip(skip);
      const total = await Order.countDocuments({ customer });

      return res.send({ status: 200, data: { orders, total } });
    }

    next({ status: 403, message: "Forbidden user access." });
  } catch (err) {
    next({ message: "Fetch orders request failed." });
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { customer } = req.body;

    if (req.decoded._id === customer) {
      const order = await Order.create({ ...req.body });

      if (order) {
        for (const item of order.products) {
          const product = await Product.findById(item.product);
          product.quantity -= item.orderQty;
          product.sold += item.orderQty;
          await product.save();
        }

        return res.status(201).send({ status: 201, data: { ...order._doc } });
      }
    }

    next({ status: 403, message: "Forbidden user access." });
  } catch (err) {
    next({ message: "Create order request failed." });
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { products } = await Order.findById(id);

    if (
      req.decoded._id === products[0].seller.toString() ||
      req.decoded.isAdmin
    ) {
      const order = await Order.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true }
      );

      if (order) {
        return res.send({ status: 200, data: { ...order._doc } });
      }
    }

    next({ status: 403, message: "Forbidden user access." });
  } catch (err) {
    console.log(err.message);
    next({ message: "Fetch orders request failed." });
  }
};

export const getCheckoutSession = async (req, res, next) => {
  try {
    const { session_id } = req.query;

    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (
        session &&
        session.id === session_id &&
        session.payment_status === "paid"
      ) {
        return res.send({ status: 200, message: "Payment successful." });
      }
    }

    next({ status: 404, message: "Checkout session not found." });
  } catch (error) {
    next({ message: "Fetch checkout session request failed." });
  }
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { cart, orderId } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.FRONTEND_ORIGIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_ORIGIN}/cancel`,
      line_items: cart.map((product) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name.toUpperCase(),
          },
          unit_amount: Math.ceil(product.price * 100),
        },
        quantity: product.orderQty,
      })),
      metadata: { orderId },
    });

    res.send({ status: 200, data: { sessionId: session.id } });
  } catch (error) {
    console.log(error.message);
    next({ message: "Create checkout session request failed." });
  }
};

export const webhook = async (req, res, next) => {
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_KEY
    );

    if (event.type === "checkout.session.completed") {
      const order = await Order.findById(event.data.object.metadata.orderId);

      if (
        order &&
        order.payment_id === "" &&
        order.payment_intent === "" &&
        order.payment_status === "pending"
      ) {
        order.payment_id = event.data.object.id;
        order.payment_intent = event.data.object.payment_intent;
        order.payment_status = event.data.object.payment_status;
        await order.save();
      }

      return res.send({
        status: 200,
        message: "Payment info successfully added to database.",
      });
    }

    next({ status: 404, message: "Webhook payload not found." });
  } catch (error) {
    next({ message: "Webhook request failed." });
  }
};
