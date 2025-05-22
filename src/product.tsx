import { useState } from "react";

export default function ProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount_price: "0.0",
    category_id: "",
    subcategory_id: "",
    colors: "",
    sizes: "",
    in_stock: true,
    rating: "0.0",
    reviews: "0",
    featured: false,
    best_seller: false,
    new_arrival: false,
  });

  const [selectedImages, setSelectedImages] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setSelectedImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    for (let i = 0; i < selectedImages.length; i++) {
      formDataToSend.append("images", selectedImages[i]);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/product/create", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Product created successfully!");
      } else {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        alert("Failed to create product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create Product</h2>

      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="mb-4 p-2 w-full border rounded" required />
      <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="mb-4 p-2 w-full border rounded" />
      <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="mb-4 p-2 w-full border rounded" required />
      <input type="number" name="discount_price" placeholder="Discount Price" value={formData.discount_price} onChange={handleChange} className="mb-4 p-2 w-full border rounded" />
      
      <input type="number" name="category_id" placeholder="Category ID" value={formData.category_id} onChange={handleChange} className="mb-4 p-2 w-full border rounded" required />
      <input type="number" name="subcategory_id" placeholder="Subcategory ID" value={formData.subcategory_id} onChange={handleChange} className="mb-4 p-2 w-full border rounded" required />
      
      <input type="text" name="colors" placeholder="Colors (e.g. red,blue)" value={formData.colors} onChange={handleChange} className="mb-4 p-2 w-full border rounded" />
      <input type="text" name="sizes" placeholder="Sizes (e.g. S,M,L)" value={formData.sizes} onChange={handleChange} className="mb-4 p-2 w-full border rounded" />

      <input type="file" name="images" multiple onChange={handleImageChange} className="mb-4 p-2 w-full border rounded" />

      <div className="flex items-center mb-4">
        <input type="checkbox" name="in_stock" checked={formData.in_stock} onChange={handleChange} className="mr-2" />
        <label>In Stock</label>
      </div>

      <input type="number" name="rating" placeholder="Rating" value={formData.rating} onChange={handleChange} className="mb-4 p-2 w-full border rounded" />
      <input type="number" name="reviews" placeholder="Reviews" value={formData.reviews} onChange={handleChange} className="mb-4 p-2 w-full border rounded" />

      <div className="flex items-center mb-4">
        <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="mr-2" />
        <label>Featured</label>
      </div>
      <div className="flex items-center mb-4">
        <input type="checkbox" name="best_seller" checked={formData.best_seller} onChange={handleChange} className="mr-2" />
        <label>Best Seller</label>
      </div>
      <div className="flex items-center mb-4">
        <input type="checkbox" name="new_arrival" checked={formData.new_arrival} onChange={handleChange} className="mr-2" />
        <label>New Arrival</label>
      </div>

      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Submit
      </button>
    </form>
  );
}
