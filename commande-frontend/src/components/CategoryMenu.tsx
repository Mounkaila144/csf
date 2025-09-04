import React, { useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { Category } from '../types';

interface CategoryMenuProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ categories, onCategorySelect }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-custom-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile menu button */}
        <div className="md:hidden py-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 text-white"
          >
            <Menu size={20} />
            <span>Catégories</span>
          </button>
        </div>

        {/* Desktop menu */}
        <nav className="hidden md:flex">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative group"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button
                onClick={() => onCategorySelect(category.id)}
                className="flex items-center gap-1 px-4 py-3 hover:bg-blue-800 transition-colors"
              >
                {category.name}
                {category.subcategories && <ChevronDown size={16} />}
              </button>

              {/* Dropdown */}
              {category.subcategories && hoveredCategory === category.id && (
                <div className="absolute top-full left-0 bg-white text-gray-800 shadow-xl rounded-lg min-w-48 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="py-2">
                    {category.subcategories.map((subcategory, index) => (
                      <button
                        key={index}
                        onClick={() => onCategorySelect(category.id)}
                        className="block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => onCategorySelect(category.id)}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-800 rounded transition-colors"
                  >
                    {category.name}
                  </button>
                  {category.subcategories && (
                    <div className="ml-4 space-y-1">
                      {category.subcategories.map((subcategory, index) => (
                        <button
                          key={index}
                          onClick={() => onCategorySelect(category.id)}
                          className="block w-full text-left px-4 py-1 text-sm text-blue-200 hover:text-white transition-colors"
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryMenu;