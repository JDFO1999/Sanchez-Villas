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

  const extension = matches[1] === "jpeg" ? "jpg" : matches[1];
  const data = Buffer.from(matches[2], "base64");
  
  const fileName = `${prefix}_${crypto.randomBytes(8).toString("hex")}.${extension}`;
  const filePath = path.join(process.cwd(), "public", "uploads", fileName);
  
  await fs.writeFile(filePath, data);
  return `/uploads/${fileName}`;
}
