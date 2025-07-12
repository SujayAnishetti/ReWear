import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCategories, createItem, type Category } from '../lib/supabase';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const conditions = ['Like New', 'Excellent', 'Good', 'Fair'];

function AddItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    size: '',
    condition: '',
    points: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('⏰ Categories loading timeout - forcing completion');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    loadCategories();

    return () => clearTimeout(timeoutId);
  }, []);

  const loadCategories = async () => {
    console.log('🔄 Loading categories...');
    try {
      const categoriesData = await getCategories();
      console.log('📂 Categories loaded:', categoriesData?.length || 0, 'categories');
      setCategories(categoriesData || []);
      console.log('✅ Categories set successfully');
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
      console.log('🏁 Categories loading finished');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to list an item');
      return;
    }

    if (images.length === 0) {
      alert('Please add at least one image');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { data, error } = await createItem({
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        size: formData.size,
        condition: formData.condition as any,
        points: parseInt(formData.points),
        tags: tagsArray,
        images: images,
        user_id: user.id
      });

      if (error) {
        console.error('Error creating item:', error);
        alert('Failed to create item. Please try again.');
      } else {
        alert('Item listed successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
          <p className="text-sm text-gray-500 mt-2">If this takes too long, please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">List New Item</h1>
        <p className="text-gray-600 mt-2">Share your pre-loved fashion with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
          <p className="text-gray-600 mb-4">Add up to 8 photos to showcase your item</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {images.length < 8 && (
              <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                <Plus className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Add Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Vintage Denim Jacket"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size *
              </label>
              <select
                name="size"
                required
                value={formData.size}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select size</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                name="condition"
                required
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select condition</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points Value *
              </label>
              <input
                type="number"
                name="points"
                required
                min="1"
                max="200"
                value={formData.points}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 45"
              />
              <p className="text-sm text-gray-500 mt-1">Suggested range: 20-100 points</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="vintage, casual, summer (comma separated)"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Describe your item in detail. Include brand, material, fit, any flaws, etc."
            />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              {images[0] && (
                <img src={images[0]} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{formData.title || 'Item Title'}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <span>{categories.find(c => c.id === formData.category_id)?.name || 'Category'}</span>
                  <span>•</span>
                  <span>Size {formData.size || 'Size'}</span>
                  <span>•</span>
                  <span>{formData.condition || 'Condition'}</span>
                </div>
                <p className="text-emerald-600 font-semibold mt-2">
                  {formData.points || '0'} points
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Listing Item...</span>
              </div>
            ) : (
              'List Item'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddItem;