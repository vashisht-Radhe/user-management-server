import { unlink } from "fs/promises";

export const safeDelete = async function (filePath) {
  if (!filePath) return;
  try {
    await unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
};
