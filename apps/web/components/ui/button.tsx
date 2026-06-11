"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 interactive",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white hover:bg-black/90 hover:scale-105 duration-300",
        primary:
          "bg-primary text-white hover:bg-primary/90 hover:scale-105 duration-300 shadow-lg shadow-primary/20",
        outline:
          "border border-black/10 bg-transparent text-black hover:bg-black/5",
        ghost: "hover:bg-slate-100 hover:text-black",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "bg-accent text-black hover:bg-white hover:scale-105 duration-300 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]",
        destructive: "bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600 shadow-sm",
      },
      size: {
        default: "h-12 px-8 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-full px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
