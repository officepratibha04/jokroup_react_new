
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  RefreshCw, 
  Shield 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import ProductGrid from '@/components/ProductGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { state, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const { products } = state;
  
  const product = products.find(p => p.id === id);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  
  if (!product) {
    return (
      <div className="container px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">Sorry, the product you are looking for does not exist.</p>
        <Link to="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }
  
  const isProductInWishlist = isInWishlist(product.id);
  
  const handleAddToCart = () => {
    if (!selectedColor) {
      alert('Please select a color');
      return;
    }
    
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    addToCart(product, quantity, selectedColor, selectedSize);
  };
  
  const handleWishlist = () => {
    if (isProductInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };
  
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };
  
  // Similar products (same category)
  const similarProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  
  return (
    <div className="container px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-navy">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-navy">Products</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${product.category}`} className="hover:text-navy capitalize">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>
      
      {/* Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden border">
            <img
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto py-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`
                  cursor-pointer border rounded w-20 h-20 flex-shrink-0
                  ${selectedImage === index ? 'border-navy border-2' : 'border-gray-200'}
                `}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-navy">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Off
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-navy">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xl">
                  {i < Math.floor(product.rating) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="text-gray-500">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
          
          {/* Description */}
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          {/* Colors */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(color => (
                <div
                  key={color}
                  className={`
                    w-10 h-10 rounded-full border cursor-pointer flex items-center justify-center
                    ${selectedColor === color ? 'border-navy ring-2 ring-navy ring-offset-2' : 'border-gray-300'}
                  `}
                  style={{ 
                    backgroundColor: color === 'light-blue' ? 'lightblue' : color,
                    boxShadow: selectedColor === color ? '0 0 0 2px white' : 'none',
                  }}
                  onClick={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <div className="w-4 h-4 rounded-full bg-white/80" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Sizes */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Size</h3>
              <button className="text-navy text-sm hover:underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <div
                  key={size}
                  className={`
                    px-4 py-2 border rounded-md text-sm cursor-pointer
                    ${selectedSize === size 
                      ? 'bg-navy text-white border-navy' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-navy'
                    }
                  `}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
          
          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center border rounded-md w-32">
              <button
                className="px-3 py-2 text-gray-600 hover:text-navy"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <div className="flex-1 text-center">{quantity}</div>
              <button
                className="px-3 py-2 text-gray-600 hover:text-navy"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`
                ${isProductInWishlist ? 'bg-rose-50 text-rose-500 border-rose-200' : ''}
              `}
              onClick={handleWishlist}
            >
              <Heart 
                className={`h-5 w-5 ${isProductInWishlist ? 'fill-rose-500' : ''}`} 
              />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Shipping Info */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-start">
              <Truck className="h-5 w-5 mr-3 text-navy flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Free Shipping</h4>
                <p className="text-sm text-gray-500">Free shipping on orders over ₹999</p>
              </div>
            </div>
            <div className="flex items-start">
              <RefreshCw className="h-5 w-5 mr-3 text-navy flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Easy Returns</h4>
                <p className="text-sm text-gray-500">30 days return policy</p>
              </div>
            </div>
            <div className="flex items-start">
              <Shield className="h-5 w-5 mr-3 text-navy flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Secure Payments</h4>
                <p className="text-sm text-gray-500">Secured payment processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Tabs */}
      <div className="mb-12">
        <Tabs defaultValue="description">
          <TabsList className="mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Additional Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="p-4">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac
                fermentum nisi, vel fermentum est. Nulla facilisi. Aliquam ac purus ut
                urna vulputate feugiat. Suspendisse potenti. Pellentesque lacinia velit
                lectus, vitae eleifend velit dictum non.
              </p>
              <ul>
                <li>High-quality materials</li>
                <li>Designed for comfort and style</li>
                <li>Durable construction</li>
                <li>Versatile for different occasions</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Material</td>
                      <td className="py-2">100% Cotton</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Pattern</td>
                      <td className="py-2">Solid</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Fit</td>
                      <td className="py-2">Regular</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Care</td>
                      <td className="py-2">Machine Washable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Dimensions</h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Size Chart</td>
                      <td className="py-2">
                        <button className="text-navy hover:underline">View Size Chart</button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Model</td>
                      <td className="py-2">Height: 6'1", Wearing Size: M</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Country of Origin</td>
                      <td className="py-2">India</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="p-4">
            <p className="mb-4">
              This product has {product.reviews} reviews with an average rating of {product.rating} out of 5 stars.
            </p>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xl">★</span>
                  ))}
                </div>
                <span className="ml-2 font-medium">Amazing quality and design</span>
              </div>
              <p className="text-gray-600 mb-2">
                The product exceeded my expectations. The quality is excellent, and the design is
                stylish and modern. I've received many compliments wearing it.
              </p>
              <div className="text-sm text-gray-500">John D. - March 15, 2023</div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="text-xl">★</span>
                  ))}
                  <span className="text-xl">☆</span>
                </div>
                <span className="ml-2 font-medium">Great value for money</span>
              </div>
              <p className="text-gray-600 mb-2">
                Really good product for the price. The material feels nice and it fits well. 
                Would have given 5 stars if the delivery was faster.
              </p>
              <div className="text-sm text-gray-500">Priya S. - February 22, 2023</div>
            </div>
            
            <div className="text-center">
              <Button variant="outline">Read More Reviews</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Similar Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <ProductGrid products={similarProducts} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
