import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { products, categories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Pencil,
  Trash2,
  PackageOpen,
  Image
} from 'lucide-react';
import { AddProductDialog } from './product_add';

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const productNameLower = product.name.toLowerCase();
    const productDescLower = product.description.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = (
      productNameLower.includes(searchTermLower) ||
      productDescLower.includes(searchTermLower) ||
      product.id.includes(searchTermLower)
    );
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort products by creation date (newest first)
  const sortedProducts = [...filteredProducts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already dynamic, no need to do anything here
  };
  // src/data/mockData.ts
interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
}

interface AddProductDialogProps {
  categories: Category[];
  onProductAdded: () => void; // This is what your component expects
}
  const handleAddProduct = () => {
    toast({
      title: 'Add Product',
      description: 'This feature is not implemented in the demo.',
    });
  };
  
  const handleEditProduct = (productId: string) => {
    toast({
      title: 'Edit Product',
      description: `Editing product ${productId}. This feature is not implemented in the demo.`,
    });
  };
  const handleDeleteProduct = (productId: string) => {
    toast({
      title: 'Delete Product',
      description: `Deleting product ${productId}. This feature is not implemented in the demo.`,
    });
  };
  
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Management</h1>
        <p className="text-gray-600">Manage your products</p>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button type="submit" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
              
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id  } value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AddProductDialog 
              categories={categories}
              onProductAdded={() => {
                setRefreshKey(prev => prev + 1);
                toast({
                  title: 'Success',
                  description: 'Product added successfully!',
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">ID: {product.id}</div>
                  </TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(product.discountPrice || product.price)}
                    </div>
                    {product.discountPrice && (
                      <div className="text-sm text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <PackageOpen className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-1">No products found</h3>
                      <p className="text-gray-500">
                        Try adjusting your search or add a new product.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstProduct + 1} to{' '}
              {Math.min(indexOfLastProduct, filteredProducts.length)} of{' '}
              {filteredProducts.length} products
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
