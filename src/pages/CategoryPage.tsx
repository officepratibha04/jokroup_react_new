
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { categories } from '@/data/mockData';
import { Category } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import FilterSidebar from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state, dispatch } = useStore();
  const { filteredProducts, searchQuery } = state;
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [sortOption, setSortOption] = useState('featured');
  
  // Find current category
  const findCategory = (slug?: string): Category | undefined => {
    if (!slug) return undefined;
    
    for (const category of categories) {
      if (category.slug === slug) return category;
      
      const subcategory = category.subcategories?.find(sub => sub.slug === slug);
      if (subcategory) return subcategory;
    }
    
    return undefined;
  };
  
  const currentCategory = findCategory(slug);
  
  // Set initial category filter
  useEffect(() => {
    if (slug) {
      dispatch({
        type: 'SET_FILTERS',
        payload: { categories: [slug] }
      });
    }
    
    return () => {
      // Reset filters when leaving the page
      dispatch({ type: 'RESET_FILTERS' });
    };
  }, [slug, dispatch]);
  
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_SEARCH_QUERY', payload: localSearchQuery });
  };
  
  const getSortedProducts = () => {
    switch (sortOption) {
      case 'price-low-high':
        return [...filteredProducts].sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceA - priceB;
        });
      case 'price-high-low':
        return [...filteredProducts].sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceB - priceA;
        });
      case 'newest':
        return [...filteredProducts].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'rating':
        return [...filteredProducts].sort((a, b) => b.rating - a.rating);
      default:
        return filteredProducts;
    }
  };
  
  const sortedProducts = getSortedProducts();
  
  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold capitalize">{currentCategory?.name || 'Products'}</h1>
        <p className="text-gray-500 mt-2">
          Showing {sortedProducts.length} products
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <FilterSidebar 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                type="search"
                placeholder="Search products..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Products */}
          <ProductGrid products={sortedProducts} />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
