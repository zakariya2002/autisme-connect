'use client';

import { PostCategory, CATEGORY_INFO } from '@/types/community';

interface CategoryFilterProps {
  selected?: PostCategory;
  onChange: (category?: PostCategory) => void;
  className?: string;
}

export default function CategoryFilter({
  selected,
  onChange,
  className = ''
}: CategoryFilterProps) {
  const categories = Object.keys(CATEGORY_INFO) as PostCategory[];

  return (
    <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${className}`}>
      <button
        onClick={() => onChange(undefined)}
        className={`
          px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200
          ${!selected
            ? 'bg-teal-600 text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600'
          }
        `}
      >
        Tous
      </button>
      {categories.map((category) => {
        const info = CATEGORY_INFO[category];
        const isSelected = selected === category;

        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200
              inline-flex items-center gap-1 sm:gap-1.5
              ${isSelected
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600'
              }
            `}
          >
            <span>{info.icon}</span>
            <span className="hidden xs:inline">#{info.label}</span>
            <span className="xs:hidden">{info.label}</span>
          </button>
        );
      })}
    </div>
  );
}
