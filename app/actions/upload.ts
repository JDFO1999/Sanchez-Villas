"use server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function processBase64Image(base64String: string | undefined | null, prefix = "img"): Promise<string | undefined | null> {
  if (!base64String) return base64String;
  // If it's already a URL (e.g. /uploads/...), return it
  if (base64String.startsWith("/")) return base64String;
  
  // Basic validation for base64 data URI
  const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64String; // Return as is, might be a regular URL
  }

  const rawExtension = matches[1].toLowerCase();
  const allowedExtensions: Record<string, string> = {
    jpeg: "jpg",
    jpg: "jpg",
    png: "png",
    webp: "webp",
  };

  const extension = allowedExtensions[rawExtension];
  if (!extension) {
    throw new Error("Formato de imagen no permitido. Solo se aceptan JPG, PNG y WEBP.");
  }

  const data = Buffer.from(matches[2], "base64");
  
  // Enforce 5MB limit
  const MAX_SIZE = 5 * 1024 * 1024;
  if (data.length > MAX_SIZE) {
    throw new Error("El archivo excede el tamaño máximo permitido de 5MB.");
  }
  
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const fileName = `${prefix}_${crypto.randomBytes(8).toString("hex")}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  
  await fs.writeFile(filePath, data);
  return `/uploads/${fileName}`;
}
