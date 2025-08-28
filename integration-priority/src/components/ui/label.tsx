import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  // Add any custom props if needed
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900",
          className
        )}
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

export { Label }