import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface DataTableSearchProps {
  value: string;
  
  onChange: (value: string) => void;
  
  placeholder?: string;
  
  debounceMs?: number;

  className?: string;
}

export function DataTableSearch({
    value,
    onChange,
    placeholder = "Cari...",
    debounceMs = 300,
    className,
}: DataTableSearchProps) {

    const [internalValue, setInternalValue] = useState(value);
    
    useEffect(() => {
        setInternalValue(value);
    }, [value])

    // debounce the onChange callback
    useEffect(() => {
        if (internalValue === value) return;

        const timer = setTimeout(() => {
            onChange(internalValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [internalValue, onChange, debounceMs, value])

    const handleClear = useCallback(() => {
        setInternalValue("");
        onChange("");
    }, [onChange])

    return (
    <div className={cn('relative', className)}>
      <Search 
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" 
      />
      
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-gray-300 bg-white',
          'py-2 pl-10 pr-10',  // Padding for icons
          'text-sm placeholder:text-gray-400',
          'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          'transition-colors'
        )}
      />
      
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'rounded-full p-0.5',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            'transition-colors'
          )}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    )
}