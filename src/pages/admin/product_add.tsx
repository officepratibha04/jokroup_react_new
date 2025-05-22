// src/components/admin/AddProductDialog.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Image, Plus } from 'lucide-react';

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
  onProductAdded: () => void;
}

export const AddProductDialog = ({ categories, onProductAdded }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    colors: '',
    sizes: '',
    in_stock: true,
    featured: false,
    best_seller: false,
    new_arrival: false,
  });

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category) {
        setAvailableSubcategories(category.subcategories);
        if (category.subcategories.length > 0) {
          setSelectedSubcategory(category.subcategories[0].id);
        } else {
          setSelectedSubcategory(null);
        }
      }
    } else {
      setAvailableSubcategories([]);
      setSelectedSubcategory(null);
    }
  }, [selectedCategory, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedCategory || !selectedSubcategory) {
      toast({
        title: 'Error',
        description: 'Please select both category and subcategory',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', formData.price);
      form.append('discount_price', formData.discount_price);
      form.append('colors', formData.colors);
      form.append('sizes', formData.sizes);
      form.append('in_stock', String(formData.in_stock));
      form.append('featured', String(formData.featured));
      form.append('best_seller', String(formData.best_seller));
      form.append('new_arrival', String(formData.new_arrival));
      form.append('category_id', String(selectedCategory));
      form.append('subcategory_id', String(selectedSubcategory));
      images.forEach(image => {
        form.append('images', image);
      });

      const response = await fetch('/api/products/create', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create product');
      }

      await response.json();
      toast({
        title: 'Success',
        description: 'Product created successfully!',
      });
      setOpen(false);
      onProductAdded();
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      colors: '',
      sizes: '',
      in_stock: true,
      featured: false,
      best_seller: false,
      new_arrival: false,
    });
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setImages([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory?.toString() || ''}
                onValueChange={(value) => setSelectedCategory(Number(value))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                value={selectedSubcategory?.toString() || ''}
                onValueChange={(value) => setSelectedSubcategory(Number(value))}
                required
                disabled={!selectedCategory || availableSubcategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCategory ? 'Select a subcategory' : 'Select category first'} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input name="price" type="number" value={formData.price} onChange={handleInputChange} required />
            </div>

            {/* Discount Price */}
            <div className="space-y-2">
              <Label htmlFor="discount_price">Discount Price</Label>
              <Input name="discount_price" type="number" value={formData.discount_price} onChange={handleInputChange} />
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label htmlFor="colors">Colors (comma separated)</Label>
              <Input name="colors" value={formData.colors} onChange={handleInputChange} />
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <Label htmlFor="sizes">Sizes (comma separated)</Label>
              <Input name="sizes" value={formData.sizes} onChange={handleInputChange} />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" value={formData.description} onChange={handleInputChange} required />
            </div>

            {/* Image Upload */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="images">Images</Label>
              <Input type="file" name="images" multiple onChange={handleImageChange} />
            </div>

            {/* Switches */}
            <div className="flex flex-wrap gap-6 md:col-span-2">
              <div className="flex items-center gap-2">
                <Switch checked={formData.in_stock} onCheckedChange={(val) => handleSwitchChange('in_stock', val)} />
                <Label>In Stock</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.featured} onCheckedChange={(val) => handleSwitchChange('featured', val)} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.best_seller} onCheckedChange={(val) => handleSwitchChange('best_seller', val)} />
                <Label>Best Seller</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.new_arrival} onCheckedChange={(val) => handleSwitchChange('new_arrival', val)} />
                <Label>New Arrival</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
