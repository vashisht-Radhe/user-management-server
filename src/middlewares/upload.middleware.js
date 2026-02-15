import multer from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromFile } from "file-type";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 },
});

const validateSignature = async (filePath) => {
  const type = await fileTypeFromFile(filePath);

  if (!type || !ALLOWED_EXTENSIONS.includes(type.ext)) {
    await fs.unlink(filePath);
    throw new Error("Invalid file signature");
  }
};

export const uploadSingle = (fieldName) => [
  upload.single(fieldName),

  async (req, res, next) => {
    try {
      if (req.file) {
        await validateSignature(req.file.path);
      }
      next();
    } catch (err) {
      next(err);
    }
  },
];
