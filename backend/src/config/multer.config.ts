import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from "./cloudinary.config"

//define where and how files will be stored in cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (register, file) => {
        let folder = 'smartscholar_uploads'
        if (file.fieldname === 'logoFile') folder = 'provider_logos'
        if (file.fieldname === 'verificationDocument') folder = 'verification_docs'
        
        return {
          folder,
          resource_type: "auto", //allows image, pdf, etc
          public_id: `${Date.now()}-${file.originalname}`,
        };
    }
})

export const upload = multer({ storage })

