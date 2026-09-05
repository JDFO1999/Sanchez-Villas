import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function saveBase64Image(base64Str: string | null | undefined): Promise<string | null> {
  if (!base64Str) return null;
  if (!base64Str.startsWith('data:image')) return base64Str; // If it's already a URL, just return it
  
  try {
    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str; // Fallback to raw string if parsing fails
    
    let ext = matches[1];
    if (ext === 'jpeg') ext = 'jpg';
    
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // Ignore if already exists
    }
    
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    
    await writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Error saving image:", err);
    return base64Str; // Fallback to storing base64 if saving to disk fails
  }
}
