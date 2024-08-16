import axios from "axios";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_URL,
} from "../app/config";

// UPLOAD AVATAR IMAGE IN REACT APP by cloudinary.com
export const cloudinaryUpload = async (image) => {
  if (!image) return "";

  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios({
      url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      // url: CLOUDINARY_URL,
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    const imageUrl = response.data.secure_url;
    return imageUrl;
  } catch (error) {
    throw error;
  }
};
