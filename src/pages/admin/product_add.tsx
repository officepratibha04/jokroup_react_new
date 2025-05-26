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
import { Plus } from 'lucide-react';
import { categories } from '@/api/api';

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
  category_id: number;
}

export const AddProductDialog = ({
  categories,
  onProductAdded,
}: {
  categories: Category[];
  onProductAdded: () => void;
}) => {
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
        setAvailableSubcategories(category.subcategories || []);
        setSelectedSubcategory(null);
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
      form.append('price', String(parseFloat(formData.price)));
      form.append('discount_price', formData.discount_price ? String(parseFloat(formData.discount_price)) : '0.0');
      form.append('category_id', String(selectedCategory));
      form.append('subcategory_id', String(selectedSubcategory));
      form.append('colors', JSON.stringify(formData.colors.split(',').map(c => c.trim()).filter(Boolean)));
      form.append('sizes', JSON.stringify(formData.sizes.split(',').map(s => s.trim()).filter(Boolean)));
      form.append('in_stock', String(formData.in_stock));
      form.append('featured', String(formData.featured));
      form.append('best_seller', String(formData.best_seller));
      form.append('new_arrival', String(formData.new_arrival));
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

      toast({ title: 'Success', description: 'Product created successfully!' });
      onProductAdded();
      resetForm();
      setOpen(false);
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
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory?.toString() || ''}
                onValueChange={(value) => setSelectedCategory(Number(value))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory Select */}
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                value={selectedSubcategory?.toString() || ''}
                onValueChange={(value) => setSelectedSubcategory(Number(value))}
                disabled={!selectedCategory || availableSubcategories.length === 0}
              >
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder={!selectedCategory ? "Select category first" : "Select subcategory"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map(sub => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <InputBlock id="name" label="Product Name" value={formData.name} onChange={handleInputChange} />
            <InputBlock id="price" label="Price" type="number" value={formData.price} onChange={handleInputChange} />
            <InputBlock id="discount_price" label="Discount Price" type="number" value={formData.discount_price} onChange={handleInputChange} />
            <InputBlock id="colors" label="Colors (comma separated)" value={formData.colors} onChange={handleInputChange} />
            <InputBlock id="sizes" label="Sizes (comma separated)" value={formData.sizes} onChange={handleInputChange} />

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="images">Images</Label>
              <Input id="images" type="file" name="images" multiple onChange={handleImageChange} />
            </div>

            {/* Feature Switches */}
            <div className="flex flex-wrap gap-4 md:col-span-2">
              {['in_stock', 'featured', 'best_seller', 'new_arrival'].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <Switch checked={formData[field as keyof typeof formData] as boolean} onCheckedChange={(val) => handleSwitchChange(field, val)} />
                  <Label>{field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</Label>
                </div>
              ))}
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

const InputBlock = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} name={id} type={type} value={value} onChange={onChange} required />
  </div>
);
