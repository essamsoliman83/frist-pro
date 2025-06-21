
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  className?: string;
  excludeAll?: boolean; // خيار جديد لاستبعاد "الكل"
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder,
  className = '',
  excludeAll = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter(item => item !== option));
  };

  // فلترة الخيارات لاستبعاد "الكل" إذا كان مطلوباً
  const filteredOptions = excludeAll ? options.filter(option => option !== 'الكل') : options;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="w-full px-3 sm:px-4 py-2 sm:py-3 h-auto min-h-[2.5rem] sm:min-h-[3rem] text-right border-2 border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 text-base sm:text-lg shadow-sm bg-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 items-center justify-end">
          {selected.length > 0 ? (
            selected.map((item) => (
              <span
                key={item}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
              >
                {item}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(item);
                  }}
                />
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-right flex items-center justify-between"
              onClick={() => toggleOption(option)}
            >
              <span>{option}</span>
              {selected.includes(option) && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
