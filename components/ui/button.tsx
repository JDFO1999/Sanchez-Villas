import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Acción principal: contorno dorado, sin relleno (formato estándar de la app).
        primary: "border-2 border-primary bg-transparent text-primary hover:bg-primary/10",
        // Relleno dorado: solo si se pide explícitamente.
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Acciones secundarias
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        success: "bg-success text-success-foreground hover:bg-success/90",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        "danger-outline": "border border-destructive/60 bg-transparent text-destructive hover:bg-destructive/10",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = "Button"

/** Mismas clases para `<Link>` que debe verse como botón (evita <a><button/></a>). */
export { Button, buttonVariants }
