import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    let folder = "smartscholar_uploads";

    if (file.fieldname === "profileImage") {
      folder = "student_profiles";
    }

    if (file.fieldname === "cvFile") {
      folder = "student_cvs";
    }

    if (file.fieldname === "logoFile") {
      folder = "provider_logos";
    }

    if (file.fieldname === "verificationDocument") {
      folder = "verification_docs";
    }

    if (file.fieldname === "bannerImage") {
      folder = "provider_banners";
    }

    if (file.fieldname === "flyerImage") {
      folder = "provider_flyers";
    }

    return {
      folder,
      resource_type: "auto",
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

export const upload = multer({ storage });
