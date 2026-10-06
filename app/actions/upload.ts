"use server";
import { saveBase64Image } from "@/lib/image-utils";
import { guard } from "@/lib/authz";

/**
 * Endpoint público de subida: exige sesión. La validación (tipo real, tamaño, nombre) vive en
 * lib/image-utils.ts y es la misma que usan las demás acciones.
 */
export async function processBase64Image(base64String: string | undefined | null, prefix = "img"): Promise<string | undefined | null> {
  const g = await guard();
  if (!g.ok) throw new Error(g.error);
  if (!base64String) return base64String;
  return await saveBase64Image(base64String, prefix);
}
