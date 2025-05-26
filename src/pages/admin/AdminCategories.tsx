import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, FolderTree, ChevronRight, ChevronDown } from 'lucide-react';
import { getCategories } from "@/api/api";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  total_product?: number;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  total_product?: number;
}

interface FormData {
  name: string;
  slug: string;
  image: File | null;
}

const SubcategoriesTable = ({
  subcategories,
  onDeleteSubcategory,
  onEditSubcategory,
}: {
  subcategories: Subcategory[];
  onDeleteSubcategory: (id: string) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
}) => (
  <div className="pl-12 pr-4 py-4 bg-gray-50">
    <div className="flex justify-between items-center mb-2 text-sm font-medium">
      <span>Subcategories ({subcategories.length})</span>
      {/* <Button variant="outline" size="sm" onClick={onAddSubcategoryClick}>
        <Plus className="w-4 h-4 mr-1" />
        save Subcategory
      </Button> */}
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Products</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subcategories.map((subcategory) => (
          <TableRow key={subcategory.id}>
            <TableCell className="font-medium">{subcategory.name}</TableCell>
            <TableCell className="text-gray-500">{subcategory.slug}</TableCell>
            <TableCell>{subcategory.total_product || 0}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEditSubcategory(subcategory)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onDeleteSubcategory(subcategory.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const AdminCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    image: null,
  });

  const [subForm, setSubForm] = useState({ name: '', slug: '' });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Add this state for category selection in subcategory dialog
  const [subCategoryDialogCategoryId, setSubCategoryDialogCategoryId] = useState<string | null>(null);

  const [isEditSubDialogOpen, setIsEditSubDialogOpen] = useState(false);
  const [editSubForm, setEditSubForm] = useState({ id: '', name: '', slug: '' });

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

  const filteredCategories = categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const toggleSubcategories = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleOpenAddDialog = () => {
    setFormData({ name: '', slug: '', image: null });
    setImagePreview(null);
    setIsAddDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      if (formData.image) formDataToSend.append('image', formData.image);

      await axios.post('http://127.0.0.1:8000/api/v1/cat/category/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({ title: 'Category Added', description: `Category "${formData.name}" added.` });

      const data = await getCategories();
      setCategories(data);
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to add category',
        variant: 'destructive',
      });
    }
  };

  // Update handleAddSubcategory to send category_id in the body
  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCategoryDialogCategoryId) return;

    try {
      // Send category_id in the body as required by FastAPI model
      await axios.post(
        `http://127.0.0.1:8000/api/v1/cat/subcategory/`,
        {
          name: subForm.name,
          slug: subForm.slug,
          category_id: Number(subCategoryDialogCategoryId),
        }
      );

      toast({
        title: 'Subcategory Added',
        description: `Subcategory "${subForm.name}" added.`,
      });

      setSubForm({ name: '', slug: '' });
      setIsSubDialogOpen(false);

      // Refresh categories to show new subcategory
      const data = await getCategories();
      setCategories(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to add subcategory',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Send DELETE request to backend
      await axios.delete(`http://127.0.0.1:8000/api/v1/cat/category/${categoryId}/`);
      // Remove from UI
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast({ title: 'Category Deleted', description: 'The category has been deleted.' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  // Place this above your AdminCategories component or inside it if you prefer
  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      // Send DELETE request to backend
      await axios.delete(`http://127.0.0.1:8000/api/v1/cat/subcategory/${subcategoryId}/`);
      // Refresh categories to update UI
      const data = await getCategories();
      setCategories(data);
      toast({ title: 'Subcategory Deleted', description: 'The subcategory has been deleted.' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to delete subcategory',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog and populate form
  const handleOpenEditSubDialog = (subcategory: Subcategory) => {
    setEditSubForm({ id: subcategory.id, name: subcategory.name, slug: subcategory.slug });
    setIsEditSubDialogOpen(true);
  };

  // Handle edit form input
  const handleEditSubInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditSubForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit edit
  const handleEditSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/v1/cat/subcategory/${editSubForm.id}/`,
        { name: editSubForm.name, slug: editSubForm.slug }
      );
      toast({ title: 'Subcategory Updated', description: `Subcategory "${editSubForm.name}" updated.` });
      setIsEditSubDialogOpen(false);
      const data = await getCategories();
      setCategories(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to update subcategory',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      {/* Top Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Category Management</h1>
        <p className="text-gray-600">Manage your product categories</p>
      </div>

      {/* Search + Add */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleOpenAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <Button   style={{ backgroundColor: "#182759", color: "#fff" }}
                variant="outline"
                onClick={() => setIsSubDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subcategory
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <>
                <TableRow key={category.id}>
                  
                  <TableCell>
                    {category.subcategories?.length ? (
                      <Button variant="ghost" size="icon" onClick={() => toggleSubcategories(category.id)}>
                        {expandedCategory === category.id ? <ChevronDown /> : <ChevronRight />}
                      </Button>
                    ) : (
                      <div className="w-10" />
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="w-12 h-12 overflow-hidden rounded bg-gray-100">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <FolderTree className="w-full h-full text-gray-400" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-500">Slug: {category.slug}</div>
                  </TableCell>

                  <TableCell>{category.total_product || 0}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          setIsSubDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Sub
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>

                {expandedCategory === category.id && category.subcategories?.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <SubcategoriesTable
                        subcategories={category.subcategories}
                        onDeleteSubcategory={handleDeleteSubcategory}
                        onEditSubcategory={handleOpenEditSubDialog}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog: Add Category */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="grid gap-4 py-4">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />

              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
              <p className="text-sm text-gray-500">Only lowercase letters, numbers, hyphens.</p>

              <Label htmlFor="image">Category Image</Label>
              <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} required />
              {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 w-20 mt-2 rounded-md" />}
            </div>
            <DialogFooter>
              <Button style={{ backgroundColor: "#182759", color: "#fff" }} type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Add Subcategory */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubcategory} className="space-y-4">
            <div className="grid gap-4 py-4">
              <Label htmlFor="sub-category">Category</Label>
              <select
                id="sub-category"
                value={subCategoryDialogCategoryId || ''}
                onChange={e => setSubCategoryDialogCategoryId(e.target.value)}
                required
                className="border rounded px-2 py-1"
              >
                <option value="" disabled>Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <Label htmlFor="sub-name">Name</Label>
              <Input id="sub-name" name="name" value={subForm.name} onChange={handleSubInputChange} required />

              <Label htmlFor="sub-slug">Slug</Label>
              <Input id="sub-slug" name="slug" value={subForm.slug} onChange={handleSubInputChange} required />
            </div>
            <DialogFooter>
              <Button   style={{ backgroundColor: "#182759", color: "#fff" }} type="button" variant="outline" onClick={() => setIsSubDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Subcategory</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={isEditSubDialogOpen} onOpenChange={setIsEditSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubcategory} className="space-y-4">
            <div className="grid gap-4 py-4">
              <Label htmlFor="edit-sub-name">Name</Label>
              <Input id="edit-sub-name" name="name" value={editSubForm.name} onChange={handleEditSubInputChange} required />
              <Label htmlFor="edit-sub-slug">Slug</Label>
              <Input id="edit-sub-slug" name="slug" value={editSubForm.slug} onChange={handleEditSubInputChange} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditSubDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;

