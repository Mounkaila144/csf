import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, MoreHorizontal } from 'lucide-react';
import { Category } from '../types';

interface CategoryMenuProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategory?: string | null;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ categories, onCategorySelect, selectedCategory }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<Category[]>([]);
  
  const navRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonctions pour gérer le hover avec délai
  const handleMouseEnter = (categoryId: string) => {
    console.log('Mouse enter:', categoryId); // Debug
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(categoryId);
  };

  const handleMouseLeave = () => {
    console.log('Mouse leave'); // Debug
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150); // Augmente le délai
  };

  // Fonction pour calculer les catégories visibles
  const calculateVisibleCategories = () => {
    if (!navRef.current || categories.length === 0) {
      setVisibleCategories(categories);
      setHiddenCategories([]);
      return;
    }

    const container = navRef.current;
    const containerWidth = container.offsetWidth;
    const moreButtonWidth = 100; // Largeur approximative du bouton "Plus"
    const availableWidth = containerWidth - moreButtonWidth;
    
    let currentWidth = 0;
    let visibleIndex = 0;

    // Créer des éléments temporaires pour mesurer la largeur
    categories.forEach((category, index) => {
      const tempElement = document.createElement('div');
      tempElement.className = 'inline-block px-4 py-3 whitespace-nowrap';
      tempElement.textContent = category.name;
      tempElement.style.visibility = 'hidden';
      tempElement.style.position = 'absolute';
      document.body.appendChild(tempElement);
      
      const elementWidth = tempElement.offsetWidth;
      document.body.removeChild(tempElement);

      if (currentWidth + elementWidth <= availableWidth) {
        currentWidth += elementWidth;
        visibleIndex = index + 1;
      } else {
        return;
      }
    });

    setVisibleCategories(categories.slice(0, visibleIndex));
    setHiddenCategories(categories.slice(visibleIndex));
  };

  // Recalculer lors du redimensionnement de la fenêtre
  useEffect(() => {
    calculateVisibleCategories();
    
    const handleResize = () => {
      calculateVisibleCategories();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  // Recalculer après le premier rendu
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateVisibleCategories();
    }, 100);

    return () => clearTimeout(timer);
  }, [categories]);

  // Fermer le menu "Plus" et les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Fermer le menu "Plus"
      if (moreButtonRef.current && !moreButtonRef.current.contains(target)) {
        setIsMoreMenuOpen(false);
      }
      
      // Fermer les dropdowns ouverts au clic
      if (navRef.current && !navRef.current.contains(target)) {
        setClickedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Nettoyer le timeout lors du démontage
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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
        <nav ref={navRef} className="hidden md:flex items-center overflow-hidden">
          {/* Catégories visibles */}
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              className="relative group flex-shrink-0"
              onMouseEnter={() => handleMouseEnter(category.id)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => {
                  if (category.subcategories && category.subcategories.length > 0) {
                    // Si la catégorie a des sous-catégories, toggle le dropdown
                    setClickedCategory(clickedCategory === category.id ? null : category.id);
                  } else {
                    // Sinon, sélectionner directement la catégorie
                    onCategorySelect(category.id);
                  }
                }}
                className={`flex items-center gap-1 px-4 py-3 hover:bg-blue-800 transition-colors whitespace-nowrap ${
                  selectedCategory === category.id ? 'bg-blue-800' : ''
                }`}
              >
                {category.name}
                {category.subcategories && <ChevronDown size={16} />}
              </button>

              {/* Dropdown */}
              {category.subcategories && category.subcategories.length > 0 && (hoveredCategory === category.id || clickedCategory === category.id) && (
                <div 
                  className="absolute top-full left-0 bg-white text-gray-800 shadow-xl rounded-lg min-w-48 z-50 border border-gray-200"
                  onMouseEnter={() => handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="py-2">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => onCategorySelect(`${category.id}-${subcategory.id}`)}
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

          {/* Bouton "Plus" pour les catégories cachées */}
          {hiddenCategories.length > 0 && (
            <div className="relative" ref={moreButtonRef}>
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="flex items-center gap-1 px-4 py-3 hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                <MoreHorizontal size={16} />
                <span>Plus</span>
                <ChevronDown size={16} />
              </button>

              {/* Menu déroulant des catégories cachées */}
              {isMoreMenuOpen && (
                <div className="absolute top-full right-0 bg-white text-gray-800 shadow-xl rounded-lg min-w-48 z-50 max-h-96 overflow-y-auto">
                  <div className="py-2">
                    {hiddenCategories.map((category) => (
                      <div key={category.id}>
                        <button
                          onClick={() => {
                            onCategorySelect(category.id);
                            setIsMoreMenuOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-800 transition-colors font-medium ${
                            selectedCategory === category.id ? 'bg-blue-50 text-blue-800' : ''
                          }`}
                        >
                          {category.name}
                        </button>
                        
                        {/* Sous-catégories */}
                        {category.subcategories && (
                          <div className="ml-4 border-l border-gray-200">
                            {category.subcategories.map((subcategory) => (
                              <button
                                key={subcategory.id}
                                onClick={() => {
                                  onCategorySelect(`${category.id}-${subcategory.id}`);
                                  setIsMoreMenuOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-800 transition-colors ${
                                  selectedCategory === `${category.id}-${subcategory.id}` ? 'bg-blue-50 text-blue-800' : ''
                                }`}
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
          )}
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

export default CategoryMenu;