import Swal from "sweetalert2"

/** Lee un token HSL de globals.css (p. ej. "card") y devuelve un color CSS utilizable por SweetAlert. */
export function themeColor(token: string): string {
  if (typeof document === "undefined") return ""
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim()
  return v ? `hsl(${v})` : ""
}

/** Colores base de SweetAlert tomados del tema activo (claro/oscuro). */
export function swalTheme() {
  return {
    background: themeColor("card"),
    color: themeColor("card-foreground"),
    confirmButtonColor: themeColor("primary"),
    cancelButtonColor: themeColor("muted-foreground"),
  }
}

interface ConfirmOptions {
  title: string
  text?: string
  confirmText?: string
  cancelText?: string
  /** Acción destructiva: el botón de confirmar usa el color de peligro. */
  danger?: boolean
}

/** Reemplazo de window.confirm() con el tema de la app. Devuelve true si el usuario confirma. */
export async function confirmAction({ title, text, confirmText = "Aceptar", cancelText = "Cancelar", danger }: ConfirmOptions): Promise<boolean> {
  const theme = swalTheme()
  const res = await Swal.fire({
    title,
    text,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: danger,
    reverseButtons: true,
    ...theme,
    confirmButtonColor: danger ? themeColor("destructive") : theme.confirmButtonColor,
  })
  return res.isConfirmed
}
