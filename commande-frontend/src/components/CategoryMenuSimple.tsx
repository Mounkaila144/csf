import React, { useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { Category } from '../types';

interface CategoryMenuProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategory?: string | null;
}

const CategoryMenuSimple: React.FC<CategoryMenuProps> = ({ categories, onCategorySelect, selectedCategory }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-blue-600 text-white shadow-lg">
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
              onMouseEnter={() => {
                console.log('Hovering category:', category.name);
                setHoveredCategory(category.id);
              }}
              onMouseLeave={() => {
                console.log('Leaving category:', category.name);
                setHoveredCategory(null);
              }}
            >
              <button
                onClick={() => {
                  console.log('Clicking category:', category.name);
                  onCategorySelect(category.id);
                }}
                className={`flex items-center gap-1 px-4 py-3 hover:bg-blue-700 transition-colors ${
                  selectedCategory === category.id ? 'bg-blue-700' : ''
                }`}
              >
                {category.name}
                {category.subcategories && category.subcategories.length > 0 && <ChevronDown size={16} />}
              </button>

              {/* Dropdown - Version simple */}
              {category.subcategories && 
               category.subcategories.length > 0 && 
               hoveredCategory === category.id && (
                <div className="absolute top-full left-0 bg-white text-gray-800 shadow-xl rounded-lg min-w-48 z-50 border border-gray-200">
                  <div className="py-2">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => {
                          console.log('Clicking subcategory:', subcategory.name);
                          onCategorySelect(`${category.id}-${subcategory.id}`);
                        }}
                        className={`block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-800 transition-colors ${
                          selectedCategory === `${category.id}-${subcategory.id}` ? 'bg-blue-50 text-blue-800' : ''
                        }`}
                      >
                        {subcategory.name}
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
                    className="block w-full text-left px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                  >
                    {category.name}
                  </button>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="ml-4 space-y-1">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => onCategorySelect(`${category.id}-${subcategory.id}`)}
                          className="block w-full text-left px-4 py-1 text-sm text-blue-200 hover:text-white transition-colors"
                        >
                          {subcategory.name}
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

export default CategoryMenuSimple;