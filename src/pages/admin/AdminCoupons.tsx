
import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { coupons } from '@/data/mockData';
import { Coupon } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus,
  Pencil,
  Trash2,
  Tag,
  Search
} from 'lucide-react';
import { useForm } from 'react-hook-form';

interface CouponFormValues {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minimumPurchase: string;
  active: boolean;
}

const AdminCoupons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Filter coupons based on search term and active status
  const filteredCoupons = coupons.filter(coupon => {
    const couponCodeLower = coupon.code.toLowerCase();
    const couponDescLower = coupon.description.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = (
      couponCodeLower.includes(searchTermLower) ||
      couponDescLower.includes(searchTermLower)
    );
    
    const matchesStatus = !showActiveOnly || coupon.active;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort coupons by active status and then by code
  const sortedCoupons = [...filteredCoupons].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }
    return a.code.localeCompare(b.code);
  });
  
  const form = useForm<CouponFormValues>({
    defaultValues: {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumPurchase: '',
      active: true,
    },
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already dynamic, no need to do anything here
  };
  
  const handleAddCoupon = (data: CouponFormValues) => {
    // In a real app, this would add the coupon to the database
    toast({
      title: 'Coupon Added',
      description: `Coupon ${data.code} has been added successfully.`,
    });
    
    setIsAddDialogOpen(false);
    form.reset();
  };
  
  const handleEditCoupon = (coupon: Coupon) => {
    toast({
      title: 'Edit Coupon',
      description: `Editing coupon ${coupon.code}. This feature is not implemented in the demo.`,
    });
  };
  
  const handleDeleteCoupon = (couponId: string) => {
    toast({
      title: 'Delete Coupon',
      description: `Deleting coupon ${couponId}. This feature is not implemented in the demo.`,
    });
  };
  
  const handleToggleCouponStatus = (coupon: Coupon) => {
    toast({
      title: coupon.active ? 'Coupon Deactivated' : 'Coupon Activated',
      description: `Coupon ${coupon.code} has been ${coupon.active ? 'deactivated' : 'activated'}.`,
    });
  };
  
  const onSubmit = (data: CouponFormValues) => {
    handleAddCoupon(data);
  };
  
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Coupon Management</h1>
        <p className="text-gray-600">Create and manage discount coupons</p>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button type="submit" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-only"
                  checked={showActiveOnly}
                  onCheckedChange={setShowActiveOnly}
                />
                <label
                  htmlFor="active-only"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show active only
                </label>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add new coupon</DialogTitle>
                  <DialogDescription>
                    Create a new discount coupon for your customers.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="code"
                      rules={{ required: 'Coupon code is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. SUMMER2023" {...field} />
                          </FormControl>
                          <FormDescription>
                            The code customers will enter at checkout.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      rules={{ required: 'Description is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Summer discount" {...field} />
                          </FormControl>
                          <FormDescription>
                            A short description of the coupon.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="discountValue"
                        rules={{ 
                          required: 'Value is required',
                          pattern: {
                            value: /^[0-9]+$/,
                            message: 'Must be a number'
                          }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder={form.watch('discountType') === 'percentage' ? '10' : '500'}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="minimumPurchase"
                      rules={{ 
                        pattern: {
                          value: /^[0-9]*$/,
                          message: 'Must be a number'
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Purchase (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty for no minimum purchase requirement.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Make this coupon available for use immediately.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Add Coupon</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedCoupons.map((coupon) => (
          <Card key={coupon.id} className={coupon.active ? 'border-green-200' : 'border-gray-200 opacity-75'}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-mono text-lg">
                    {coupon.code}
                  </CardTitle>
                  <CardDescription>{coupon.description}</CardDescription>
                </div>
                <div className="flex">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditCoupon(coupon)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Discount:</span>
                  <span className="font-medium">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </span>
                </div>
                
                {coupon.minimumPurchase && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Min. Purchase:</span>
                    <span>₹{coupon.minimumPurchase}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Used:</span>
                  <span>{coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Valid Until:</span>
                  <span>{new Date(coupon.validTo).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center">
                    <span className={`mr-2 text-sm ${coupon.active ? 'text-green-600' : 'text-gray-500'}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                    <Switch 
                      checked={coupon.active} 
                      onCheckedChange={() => handleToggleCouponStatus(coupon)} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCoupons.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <Tag className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-1">No coupons found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or add a new coupon.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Coupon
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {/* Coupon form content */}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
