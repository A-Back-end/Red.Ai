import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const loadingVariants = cva(
  "animate-spin",
  {
    variants: {
      variant: {
        default: "border-4 border-purple-500/30 border-t-purple-500 rounded-full",
        dual: "border-4 border-purple-500/30 border-t-purple-500 rounded-full",
        dots: "flex space-x-1",
        pulse: "bg-gradient-to-r from-purple-500 to-blue-600 rounded-full",
        bars: "flex space-x-1"
      },
      size: {
        sm: "w-4 h-4",
        default: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant, size, text, ...props }, ref) => {
    if (variant === "dual") {
      return (
        <div ref={ref} className={cn("relative", className)} {...props}>
          <div className={cn(loadingVariants({ variant, size }))}>
            <div className="absolute inset-0 border-4 border-blue-500/30 border-r-blue-500 rounded-full animate-spin animate-reverse"></div>
          </div>
          {text && <p className="text-slate-400 text-sm mt-3 text-center">{text}</p>}
        </div>
      )
    }

    if (variant === "dots") {
      return (
        <div ref={ref} className={cn("flex flex-col items-center", className)} {...props}>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-purple-500 rounded-full animate-pulse",
                  size === "sm" && "w-2 h-2",
                  size === "default" && "w-3 h-3",
                  size === "lg" && "w-4 h-4",
                  size === "xl" && "w-5 h-5"
                )}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          {text && <p className="text-slate-400 text-sm mt-3 text-center">{text}</p>}
        </div>
      )
    }

    if (variant === "pulse") {
      return (
        <div ref={ref} className={cn("flex flex-col items-center", className)} {...props}>
          <div className={cn(loadingVariants({ variant, size }), "animate-pulse")} />
          {text && <p className="text-slate-400 text-sm mt-3 text-center">{text}</p>}
        </div>
      )
    }

    if (variant === "bars") {
      return (
        <div ref={ref} className={cn("flex flex-col items-center", className)} {...props}>
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-purple-500 animate-bounce",
                  size === "sm" && "w-1 h-6",
                  size === "default" && "w-2 h-8",
                  size === "lg" && "w-3 h-10",
                  size === "xl" && "w-4 h-12"
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          {text && <p className="text-slate-400 text-sm mt-3 text-center">{text}</p>}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("flex flex-col items-center", className)} {...props}>
        <div className={cn(loadingVariants({ variant, size }))} />
        {text && <p className="text-slate-400 text-sm mt-3 text-center">{text}</p>}
      </div>
    )
  }
)
Loading.displayName = "Loading"

export { Loading, loadingVariants } 