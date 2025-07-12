import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, ShoppingBag, Star, User, Edit, Coins, TrendingUp, Eye, MessageSquare, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserItems, getSwapRequests, getUserTransactions, updateSwapRequest, deleteItem, testDatabaseConnection, type Item, type SwapRequest, type Transaction } from '../lib/supabase';

function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    console.log('Loading dashboard data for user:', user.id);
    setLoading(true);
    
    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Dashboard data loading timeout')), 10000);
    });
    
    try {
      const dataPromise = Promise.all([
        getUserItems(user.id),
        getSwapRequests(user.id),
        getUserTransactions(user.id)
      ]);
      
      const [itemsData, swapRequestsData, transactionsData] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]);
      
      console.log('Dashboard data loaded:', { items: itemsData.length, requests: swapRequestsData.length, transactions: transactionsData.length });
      setUserItems(itemsData);
      setSwapRequests(swapRequestsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty arrays to prevent infinite loading
      setUserItems([]);
      setSwapRequests([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequestResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateSwapRequest(requestId, { status });
      await loadDashboardData();
      await refreshProfile();
    } catch (error) {
      console.error('Error updating swap request:', error);
    }
  };

  const handleDeleteItem = async (itemId: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await deleteItem(itemId);
      if (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      } else {
        alert('Item deleted successfully!');
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleTestConnection = async () => {
    console.log('Testing database connection...');
    const isConnected = await testDatabaseConnection();
    alert(isConnected ? 'Database connection successful!' : 'Database connection failed!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'swapped': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  console.log('Dashboard render state:', { 
    user: !!user, 
    profile: !!profile, 
    loading, 
    userItems: userItems.length,
    swapRequests: swapRequests.length,
    transactions: transactions.length
  });

  if (!user) {
    console.log('Showing loading spinner - missing user');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!profile) {
    console.log('Showing profile loading state - user exists but profile missing');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
          <button 
            onClick={refreshProfile}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry Profile Load
          </button>
        </div>
      </div>
    );
  }

  const activeItems = userItems.filter(item => item.status === 'active');
  const completedSwaps = userItems.filter(item => item.status === 'swapped');
  const pendingRequests = swapRequests.filter(req => req.status === 'pending' && req.owner_id === user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <img 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=10b981&color=fff`} 
              alt={profile.name}
              className="w-16 h-16 rounded-full border-4 border-emerald-100"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">{profile.points} points</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-600">{profile.rating}/5.0</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleTestConnection}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>Test DB</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
            <Link 
              to="/add-item"
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>List Item</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900">{activeItems.length}</p>
            </div>
            <Package className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            {userItems.length} total items
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Swaps</p>
              <p className="text-2xl font-bold text-gray-900">{profile.total_swaps}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            {completedSwaps.length} this month
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-2 text-sm text-gray-600">Awaiting your response</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Points Balance</p>
              <p className="text-2xl font-bold text-gray-900">{profile.points}</p>
            </div>
            <Coins className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="mt-2 text-sm text-green-600">Ready to spend</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'listings'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Listings ({userItems.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Swap Requests ({swapRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions ({transactions.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {swapRequests.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-500' :
                            request.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-gray-700">
                            {request.requester_id === user.id 
                              ? `You requested to swap "${request.item?.title}"`
                              : `${request.requester?.name} wants to swap your "${request.item?.title}"`
                            }
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {swapRequests.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'listings' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
                    <Link 
                      to="/add-item"
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add New Item</span>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative">
                          <img 
                            src={item.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'} 
                            alt={item.title} 
                            className="w-full h-48 object-cover" 
                          />
                          <button
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-0 hover:opacity-100"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>{item.category?.name}</span>
                            <span>Size {item.size}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{item.views} views</span>
                            </div>
                            <span className="font-medium text-emerald-600">{item.points} pts</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {userItems.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No items listed yet</h3>
                      <p className="text-gray-600 mb-4">Start by listing your first item to begin swapping!</p>
                      <Link 
                        to="/add-item"
                        className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        List Your First Item
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Swap Requests</h3>
                  
                  <div className="space-y-4">
                    {swapRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-4">
                            <img 
                              src={request.item?.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'} 
                              alt={request.item?.title} 
                              className="w-16 h-16 object-cover rounded-lg" 
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">{request.item?.title}</h4>
                              <p className="text-sm text-gray-600">
                                {request.requester_id === user.id 
                                  ? `You requested to swap with ${request.owner?.name}`
                                  : `${request.requester?.name} wants to swap`
                                }
                              </p>
                              {request.message && (
                                <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            {request.status === 'pending' && request.owner_id === user.id && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSwapRequestResponse(request.id, 'accepted')}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleSwapRequestResponse(request.id, 'rejected')}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {swapRequests.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No swap requests yet</h3>
                        <p className="text-gray-600">When someone wants to swap with your items, you'll see their requests here.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Transaction History</h3>
                  
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <img 
                          src={transaction.item?.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'} 
                          alt={transaction.item?.title} 
                          className="w-16 h-16 object-cover rounded-lg" 
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{transaction.item?.title}</h4>
                          <p className="text-sm text-gray-600">
                            {transaction.buyer_id === user.id 
                              ? `Purchased from ${transaction.seller?.name}`
                              : `Sold to ${transaction.buyer?.name}`
                            }
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-emerald-600 font-semibold ${
                            transaction.buyer_id === user.id ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.buyer_id === user.id ? '-' : '+'}{transaction.points} pts
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-center py-12">
                        <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                        <p className="text-gray-600">Your purchase and sale history will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;