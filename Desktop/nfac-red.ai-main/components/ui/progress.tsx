import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-slate-800/50",
  {
    variants: {
      variant: {
        default: "bg-slate-800/50",
        success: "bg-emerald-800/50",
        warning: "bg-amber-800/50",
        error: "bg-red-800/50",
        info: "bg-blue-800/50",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const progressBarVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500 to-blue-600",
        success: "bg-gradient-to-r from-emerald-500 to-teal-600",
        warning: "bg-gradient-to-r from-amber-500 to-orange-600",
        error: "bg-gradient-to-r from-red-500 to-rose-600",
        info: "bg-gradient-to-r from-blue-500 to-indigo-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  showValue?: boolean
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, variant, size, value = 0, max = 100, showValue = false, animated = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    return (
      <div className="w-full">
        {showValue && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-medium text-white">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(progressVariants({ variant, size, className }))}
          {...props}
        >
          <div
            className={cn(
              progressBarVariants({ variant }),
              animated && "animate-pulse"
            )}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress, progressVariants } 