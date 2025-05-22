
import { useStore } from '@/contexts/StoreContext';
import UserLayout from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

// Mockup orders data (in a real app, this would come from API)
const mockOrders = [
  {
    id: 'ORD-1234',
    date: '2025-03-01',
    status: 'delivered',
    total: 3200,
    items: 3,
  },
  {
    id: 'ORD-5678',
    date: '2025-02-25',
    status: 'processing',
    total: 1500,
    items: 1,
  },
  {
    id: 'ORD-9012',
    date: '2025-02-18',
    status: 'shipped',
    total: 4700,
    items: 5,
  },
];

const OrdersPage = () => {
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };
  
  const getStatusBadge = (status: string) => {
    let badgeClass = '';
    switch (status) {
      case 'delivered':
        badgeClass = 'bg-green-100 text-green-800';
        break;
      case 'processing':
        badgeClass = 'bg-blue-100 text-blue-800';
        break;
      case 'shipped':
        badgeClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'cancelled':
        badgeClass = 'bg-red-100 text-red-800';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <Badge variant="outline" className={`${badgeClass} capitalize px-2 py-1`}>
        {status}
      </Badge>
    );
  };
  
  return (
    <UserLayout>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {mockOrders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Button asChild>
              <a href="/products">Start Shopping</a>
            </Button>
          </div>
        </Card>
      )}
    </UserLayout>
  );
};

export default OrdersPage;
