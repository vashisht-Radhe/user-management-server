import path from "path";

export const getUploadPath = (filename) => {
  const safeName = path.basename(filename);
  return path.join(process.cwd(), "uploads", safeName);
};
