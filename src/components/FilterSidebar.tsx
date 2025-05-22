
import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { categories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar = ({ isOpen, onClose }: FilterSidebarProps) => {
  const { state, dispatch, applyFilters } = useStore();
  const { filters } = state;
  
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const [priceRange, setPriceRange] = useState(filters.priceRange);
  
  // All possible colors and sizes from mock data
  const allColors = ['white', 'black', 'blue', 'red', 'green', 'pink', 'purple', 'orange', 'gray', 'brown', 'navy', 'olive', 'beige', 'silver', 'gold', 'rose-gold', 'light-blue'];
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32', '34', '36', '3-4Y', '5-6Y', '7-8Y', 'ONE SIZE'];
  
  useEffect(() => {
    setLocalFilters({ ...filters });
    setPriceRange(filters.priceRange);
  }, [filters]);
  
  const handleCategoryChange = (categorySlug: string) => {
    const updatedCategories = localFilters.categories.includes(categorySlug)
      ? localFilters.categories.filter(c => c !== categorySlug)
      : [...localFilters.categories, categorySlug];
    
    setLocalFilters({ ...localFilters, categories: updatedCategories });
  };
  
  const handleColorChange = (color: string) => {
    const updatedColors = localFilters.colors.includes(color)
      ? localFilters.colors.filter(c => c !== color)
      : [...localFilters.colors, color];
    
    setLocalFilters({ ...localFilters, colors: updatedColors });
  };
  
  const handleSizeChange = (size: string) => {
    const updatedSizes = localFilters.sizes.includes(size)
      ? localFilters.sizes.filter(s => s !== size)
      : [...localFilters.sizes, size];
    
    setLocalFilters({ ...localFilters, sizes: updatedSizes });
  };
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };
  
  const handleApplyFilters = () => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        ...localFilters,
        priceRange: priceRange
      }
    });
    
    if (onClose) {
      onClose();
    }
  };
  
  const handleResetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
    
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-20 md:h-screen md:translate-x-0 overflow-y-auto
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Filters</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Categories */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.slug}`}
                    checked={localFilters.categories.includes(category.slug)}
                    onCheckedChange={() => handleCategoryChange(category.slug)}
                  />
                  <Label htmlFor={`category-${category.slug}`}>{category.name}</Label>
                </div>
                
                {localFilters.categories.includes(category.slug) && category.subcategories && (
                  <div className="ml-6 space-y-1">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subcategory-${subcategory.slug}`}
                          checked={localFilters.categories.includes(subcategory.slug)}
                          onCheckedChange={() => handleCategoryChange(subcategory.slug)}
                        />
                        <Label htmlFor={`subcategory-${subcategory.slug}`}>{subcategory.name}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Price Range</h3>
          <div className="px-2">
            <Slider
              defaultValue={[priceRange[0], priceRange[1]]}
              max={5000}
              step={100}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={handlePriceChange}
              className="mb-4"
            />
            <div className="flex items-center justify-between text-sm">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>
        </div>
        
        {/* Colors */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Colors</h3>
          <div className="flex flex-wrap gap-2">
            {allColors.map(color => (
              <div
                key={color}
                className={`
                  w-8 h-8 rounded-full border cursor-pointer flex items-center justify-center
                  ${localFilters.colors.includes(color) ? 'border-navy ring-2 ring-navy ring-offset-2' : 'border-gray-300'}
                `}
                style={{ 
                  backgroundColor: color === 'light-blue' ? 'lightblue' : color,
                  boxShadow: localFilters.colors.includes(color) ? '0 0 0 2px white' : 'none',
                }}
                onClick={() => handleColorChange(color)}
              >
                {localFilters.colors.includes(color) && (
                  <div className="w-4 h-4 rounded-full bg-white/80" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sizes */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {allSizes.map(size => (
              <div
                key={size}
                className={`
                  px-3 py-1 border rounded-md text-sm cursor-pointer
                  ${localFilters.sizes.includes(size) 
                    ? 'bg-navy text-white border-navy' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-navy'
                  }
                `}
                onClick={() => handleSizeChange(size)}
              >
                {size}
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="default"
            onClick={handleApplyFilters}
            className="flex-1"
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
