
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ProductGrid from '@/components/ProductGrid';

const CartPage = () => {
  const navigate = useNavigate();
  const { state, updateCartItem, removeFromCart, clearCart } = useStore();
  const { cart, products } = state;
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Get cart items with product details
  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product !== undefined);
  
  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return total + price * item.quantity;
  }, 0);
  
  const shipping = subtotal > 999 ? 0 : 150;
  const discount = 0; // This would be calculated based on applied coupons
  const total = subtotal + shipping - discount;
  
  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartItem(id, quantity);
  };
  
  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };
  
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a coupon code',
        variant: 'destructive',
      });
      return;
    }
    
    setIsApplyingCoupon(true);
    
    // Simulate API call
    setTimeout(() => {
      if (couponCode.toUpperCase() === 'WELCOME10') {
        toast({
          title: 'Success',
          description: 'Coupon applied successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Invalid coupon code',
          variant: 'destructive',
        });
      }
      
      setIsApplyingCoupon(false);
    }, 1000);
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty. Add items before checkout.',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, this would navigate to checkout
    // For now, we'll show a success toast
    toast({
      title: 'Order Placed',
      description: 'Your order has been placed successfully!',
    });
    
    clearCart();
    navigate('/');
  };
  
  // Get recommended products (for empty cart)
  const recommendedProducts = products
    .filter(p => p.featured || p.bestSeller)
    .slice(0, 4);
  
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };
  
  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <div className="container px-4 py-12">
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            <ShoppingCart className="h-16 w-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
        
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Recommended for You</h3>
          <ProductGrid products={recommendedProducts} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4">Product</th>
                    <th className="text-center py-4">Quantity</th>
                    <th className="text-right py-4">Price</th>
                    <th className="text-right py-4">Total</th>
                    <th className="py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => {
                    const product = item.product as Product;
                    const price = product.discountPrice || product.price;
                    const itemTotal = price * item.quantity;
                    
                    return (
                      <tr key={item.id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <Link to={`/product/${product.id}`}>
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded mr-4"
                              />
                            </Link>
                            <div>
                              <Link 
                                to={`/product/${product.id}`}
                                className="font-medium hover:text-navy hover:underline"
                              >
                                {product.name}
                              </Link>
                              <div className="text-sm text-gray-500 mt-1">
                                <span 
                                  className="inline-block w-3 h-3 rounded-full mr-1" 
                                  style={{ backgroundColor: item.color === 'light-blue' ? 'lightblue' : item.color }}
                                ></span>
                                {item.color}, {item.size}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center border rounded-md max-w-[100px] mx-auto">
                            <button
                              className="px-3 py-1 text-gray-600 hover:text-navy"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <div className="w-8 text-center">{item.quantity}</div>
                            <button
                              className="px-3 py-1 text-gray-600 hover:text-navy"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          {formatPrice(price)}
                          {product.discountPrice && (
                            <div className="text-sm text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-right font-medium">
                          {formatPrice(itemTotal)}
                        </td>
                        <td className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <Button asChild variant="outline">
                <Link to="/products">Continue Shopping</Link>
              </Button>
              <Button 
                variant="outline" 
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => clearCart()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-{formatPrice(discount)}</span>
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            
            {/* Coupon */}
            <div className="mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  variant="outline"
                >
                  Apply
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Try "WELCOME10" for 10% off your first order
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              Secure checkout powered by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
