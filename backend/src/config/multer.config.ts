import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config";
import path from "path";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    let folder = "smartscholar_uploads";

    // Student uploads
    if (file.fieldname === "profileImage") {
      folder = "student_profiles";
    }
    if (file.fieldname === "cvFile") {
      folder = "student_cvs";
    }

    // Provider profile uploads
    if (file.fieldname === "logoFile") {
      folder = "provider_logos";
    }
    if (file.fieldname === "verificationDocument") {
      folder = "verification_docs";
    }

    // Scholarship uploads
    if (file.fieldname === "bannerImage" || file.fieldname === "banner") {
      folder = "scholarship_banners";
    }
    if (file.fieldname === "flyerImage" || file.fieldname === "flyer") {
      folder = "scholarship_flyers";
    }
    if (file.fieldname === "verificationDocuments") {
      folder = "verification_docs";
    }

    // ✅ FIX: Remove extension from originalname to prevent double extension
    const fileExtension = path.extname(file.originalname); // e.g., ".pdf"
    const fileNameWithoutExt = path.basename(file.originalname, fileExtension); // e.g., "document"
    const publicId = `${Date.now()}-${fileNameWithoutExt}`;

    // ✅ CRITICAL: Use 'raw' resource type for documents (PDFs, DOCs, etc.)
    const isPdf = fileExtension.toLowerCase() === ".pdf";
    const isDoc = [".doc", ".docx"].includes(fileExtension.toLowerCase());
    const resourceType = isPdf || isDoc ? "raw" : "auto";

    return {
      folder,
      resource_type: resourceType, // ✅ 'raw' for PDFs/docs, 'auto' for images
      public_id: publicId, // ✅ No extension here - Cloudinary adds it
      format: fileExtension.slice(1), // ✅ ".pdf" -> "pdf"
    };
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
