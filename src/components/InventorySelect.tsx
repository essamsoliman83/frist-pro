
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface InventorySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const inventoryOptions = [
  { value: '', label: 'جميع أنواع إدارة المخزون' },
  { value: 'الرواكد', label: 'الرواكد' },
  { value: 'النواقص', label: 'النواقص' },
  { value: 'منتهي الصلاحية', label: 'منتهي الصلاحية' },
  { value: 'العجز', label: 'العجز' },
  { value: 'الزيادة', label: 'الزيادة' }
];

export const InventorySelect: React.FC<InventorySelectProps> = ({
  value,
  onChange,
  placeholder = "اختر نوع إدارة المخزون"
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

  const selectedOption = inventoryOptions.find(option => option.value === value);

  return (
    <div className="space-y-2">
      <Label className="text-right flex items-center">
        إدارة المخزون
      </Label>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between text-right h-auto min-h-[2.5rem]"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {inventoryOptions.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-right"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
