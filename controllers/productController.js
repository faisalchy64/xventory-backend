import Product from "../models/productModel.js";
import { uploadImage, destroyImage } from "../utils/cloudinary.js";

export const getProducts = async (req, res, next) => {
  try {
    const { search = "", page = 1 } = req.query;
    const limit = 6;
    const skip = page > 1 ? (page - 1) * limit : 0;
    const result = await Product.aggregate([
      {
        $match: {
          name: {
            $regex: search,
            $options: "i",
          },
        },
      },
      {
        $facet: {
          products: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          total: [{ $count: "count" }],
        },
      },
      {
        $unwind: {
          path: "$total",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          products: 1,
          total: { $ifNull: ["$total.count", 0] },
        },
      },
    ]);
    const { products, total } = result[0] || { products: [], total: 0 };

    res.send({ status: 200, data: { products, total } });
  } catch (err) {
    next({ message: "Fetch products request failed." });
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("seller", "name");

    res.send({ status: 200, data: { ...product._doc } });
  } catch (err) {
    next({ message: "Fetch product request failed." });
  }
};

export const manageProducts = async (req, res, next) => {
  try {
    const { seller = "", page = 1 } = req.query;

    if (req.decoded._id === seller || req.decoded.isAdmin) {
      const query = req.decoded.isAdmin ? {} : { seller };
      const limit = 6;
      const skip = page > 1 ? (page - 1) * limit : 0;
      const result = await Product.aggregate([
        {
          $match: query,
        },
        {
          $facet: {
            products: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limit },
            ],
            total: [{ $count: "count" }],
          },
        },
        {
          $unwind: {
            path: "$total",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            products: 1,
            total: { $ifNull: ["$total.count", 0] },
          },
        },
      ]);
      const { products, total } = result[0] || { products: [], total: 0 };

      return res.send({ status: 200, data: { products, total } });
    }

    next({ status: 403, message: "Forbidden user access." });
  } catch (err) {
    next({ message: "Fetch products request failed." });
  }
};

export const createProduct = async (req, res, next) => {
  try {
    if (req.decoded._id === req.body.seller) {
      req.body.image = await uploadImage(req.file.path);
      const product = await Product.create({ ...req.body });

      if (product) {
        return res
          .status(201)
          .send({ status: 201, message: "Product created successfully." });
      }
    }

    next({ status: 403, message: "Forbidden user access." });
  } catch (err) {
    next({ message: "Create product request failed." });
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { image, seller } = await Product.findById(id);

    if (req.decoded._id === seller.toString() || req.decoded.isAdmin) {
      if (req.file) {
        await destroyImage(image.public_id);
        const { optimize_url, public_id } = await uploadImage(req.file.path);
        req.body.image = { optimize_url, public_id };
      }

      const product = await Product.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true }
      );

      return res.send({ status: 200, data: { ...product._doc } });
    }

    next({ status: 403, message: "Forbidden user access." });
  } catch (err) {
    console.log(err.message);
    next({ message: "Update product request failed." });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { image, seller } = await Product.findById(id);

    if (req.decoded._id === seller.toString() || req.decoded.isAdmin) {
      await destroyImage(image.public_id);
      const product = await Product.findByIdAndDelete(id);

      return res.send({ status: 200, data: { ...product._doc } });
    }

    next({ status: 403, message: "Forbidden user access." });
  } catch (err) {
    next({ message: "Delete product request failed." });
  }
};
