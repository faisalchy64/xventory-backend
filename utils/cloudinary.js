import { unlinkSync } from "fs";
import { v2 } from "cloudinary";

// Cloudinary configuration
v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file) => {
  try {
    if (file) {
      const { public_id } = await v2.uploader.upload(file, {
        folder: "xventory",
      });
      const optimize_url = v2.url(public_id, {
        fetch_format: "auto",
        quality: "auto",
      });

      unlinkSync(file);

      return { optimize_url, public_id };
    }
  } catch (err) {
    unlinkSync(file);
  }
};

export const destroyImage = async (public_id) => {
  try {
    await v2.api.delete_resources([public_id]);
  } catch (err) {
    console.log(err.message);
  }
};
