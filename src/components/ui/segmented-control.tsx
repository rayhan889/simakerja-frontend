import { cn } from "@/lib/utils"

interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedControlOption<T>[]
  className?: string
  disabled?: boolean
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  disabled = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={cn(
            "px-4 py-2 text-sm w-full font-medium rounded-md transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 cursor-pointer focus-visible:ring-teal-500 focus-visible:ring-offset-1",
            value === option.value
              ? "bg-teal-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}