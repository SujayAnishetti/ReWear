import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid, List, Heart, Eye, MapPin } from 'lucide-react';
import { getItems, getCategories, type Item, type Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function BrowseItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  const loadCategories = async () => {
    console.log('🔄 Loading categories...');
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      console.log('✅ Categories loaded:', categoriesData.length);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadItems = async () => {
    console.log('🔄 Loading items...');
    setLoading(true);
    
    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Items loading timeout')), 10000);
    });
    
    try {
      const dataPromise = getItems({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      });
      
      const { items: itemsData, count } = await Promise.race([dataPromise, timeoutPromise]);
      
      console.log('📦 Items loaded:', itemsData?.length || 0, 'items');
      console.log('📊 Total count:', count);
      
      // Sort items based on sortBy
      let sortedItems = [...(itemsData || [])];
      switch (sortBy) {
        case 'newest':
          sortedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'oldest':
          sortedItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'points-low':
          sortedItems.sort((a, b) => a.points - b.points);
          break;
        case 'points-high':
          sortedItems.sort((a, b) => b.points - a.points);
          break;
        case 'popular':
          sortedItems.sort((a, b) => b.views - a.views);
          break;
      }
      
      setItems(sortedItems);
      setTotalCount(count || 0);
      console.log('✅ Items set successfully');
    } catch (error) {
      console.error('❌ Error loading items:', error);
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadItems();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Like New': return 'bg-green-100 text-green-800';
      case 'Excellent': return 'bg-blue-100 text-blue-800';
      case 'Good': return 'bg-yellow-100 text-yellow-800';
      case 'Fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Items</h1>
        <p className="text-gray-600">Discover amazing pre-loved fashion from our community</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for items, brands, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort and View Options */}
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="points-low">Points: Low to High</option>
              <option value="points-high">Points: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {items.length} of {totalCount} items
          {searchTerm && ` for "${searchTerm}"`}
          {selectedCategory && categories.find(c => c.id === selectedCategory) && 
            ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
        </p>
      </div>

      {/* Items Grid/List */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 mb-4">Loading items...</p>
          <button 
            onClick={() => {
              setLoading(false);
              setTimeout(() => loadItems(), 100);
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry Loading
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or browse all categories.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/item/${item.id}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="relative">
                    <img
                      src={item.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                      {item.points} pts
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-emerald-600 font-medium">{item.category?.name}</span>
                      <span className="text-sm text-gray-500">Size {item.size}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{item.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{item.user?.location || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/item/${item.id}`}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow flex items-center space-x-6 group"
                >
                  <img
                    src={item.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-emerald-600 font-medium">{item.category?.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                          {item.condition}
                        </span>
                        <span className="text-gray-500">Size {item.size}</span>
                      </div>
                      <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {item.points} pts
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{item.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{item.user?.location || 'Unknown location'}</span>
                        </div>
                      </div>
                      <span>Listed by {item.user?.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BrowseItems;