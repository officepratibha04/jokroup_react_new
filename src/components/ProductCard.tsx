
import { Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { Product } from '@/types';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="product-card flex flex-col h-full">
      <div className="relative overflow-hidden group">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.newArrival && (
              <Badge className="bg-accent text-white">New</Badge>
            )}
            {product.bestSeller && (
              <Badge className="bg-amber-500 text-white">Best Seller</Badge>
            )}
            {product.discountPrice && (
              <Badge className="bg-green-600 text-white">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Off
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="secondary"
            className={`absolute top-2 right-2 rounded-full w-8 h-8 p-1 ${
              isWishlisted ? 'bg-rose-100 text-rose-500' : 'bg-white text-gray-400'
            }`}
            onClick={toggleWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
          </Button>
        </Link>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <Link to={`/product/${product.id}`} className="flex-grow">
          <h3 className="font-medium text-navy mb-1 hover:underline">{product.name}</h3>
          <div className="text-gray-600 text-sm mb-2">{product.category}</div>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {product.discountPrice ? (
              <>
                <span className="font-bold">{formatPrice(product.discountPrice)}</span>
                <span className="text-gray-400 text-sm line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-bold">{formatPrice(product.price)}</span>
            )}
          </div>
          
          <div className="flex items-center text-amber-500">
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs ml-1">({product.reviews})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
