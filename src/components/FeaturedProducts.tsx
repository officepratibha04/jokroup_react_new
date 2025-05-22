
import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { Product } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductGrid from './ProductGrid';
//import { getProducts } from '../api/api';
const FeaturedProducts = () => {
  const { state } = useStore();
  const { products } = state;
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  
  useEffect(() => {
    setFeaturedProducts(products.filter(p => p.featured).slice(0, 8));
    setNewArrivals(products.filter(p => p.newArrival).slice(0, 8));
    setBestSellers(products.filter(p => p.bestSeller).slice(0, 8));
  }, [products]);
  
  return (
    <div className="py-12">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Discover Our Collection</h2>
        
        <Tabs defaultValue="featured" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="new">New Arrivals</TabsTrigger>
              <TabsTrigger value="bestseller">Best Sellers</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="featured">
            <ProductGrid products={featuredProducts} />
          </TabsContent>
          
          <TabsContent value="new">
            <ProductGrid products={newArrivals} />
          </TabsContent>
          
          <TabsContent value="bestseller">
            <ProductGrid products={bestSellers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeaturedProducts;
