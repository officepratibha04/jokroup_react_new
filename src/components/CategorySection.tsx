
import { Link } from 'react-router-dom';
//import { categories } from '@/data/mockData';
//import {categories} from "@/api/api";
import { getCategories } from "@/api/api";
import { useEffect, useState } from 'react';
import {Category} from '../types';
const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="py-12 text-center">Loading categories...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }

  if (categories.length === 0) {
    return <div className="py-12 text-center">No categories found</div>;
  }


  return (
    <div className="py-12 bg-cream">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Shop by Category</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative h-64 overflow-hidden rounded-lg shadow-md transition-transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-navy opacity-40 group-hover:opacity-30 transition-opacity" />
              
              <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded text-center">
                  <h3 className="text-xl font-semibold text-navy">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.subcategories?.length} Collections
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
