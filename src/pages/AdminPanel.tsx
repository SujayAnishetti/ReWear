import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, Eye, Ban, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllUsers, 
  getAllItems, 
  getAllSwapRequests, 
  getAllTransactions,
  updateProfile,
  updateItem,
  type Profile,
  type Item,
  type SwapRequest,
  type Transaction
} from '../lib/supabase';

function AdminPanel() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<Profile[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadAdminData();
    }
  }, [profile]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersData, itemsData, swapRequestsData, transactionsData] = await Promise.all([
        getAllUsers(),
        getAllItems(),
        getAllSwapRequests(),
        getAllTransactions()
      ]);
      
      setUsers(usersData);
      setItems(itemsData);
      setSwapRequests(swapRequestsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'promote' | 'demote' | 'ban') => {
    try {
      let updates: Partial<Profile> = {};
      
      switch (action) {
        case 'promote':
          updates.role = 'admin';
          break;
        case 'demote':
          updates.role = 'user';
          break;
        case 'ban':
          // In a real app, you might have a 'banned' status
          console.log('Ban user functionality would be implemented here');
          return;
      }

      const { error } = await updateProfile(userId, updates);
      if (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user');
      } else {
        await loadAdminData();
        alert('User updated successfully');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleItemAction = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'active' : 'rejected';
      const { error } = await updateItem(itemId, { status });
      
      if (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item');
      } else {
        await loadAdminData();
        alert(`Item ${action}d successfully`);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'shipping':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeItems: items.filter(item => item.status === 'active').length,
    pendingItems: items.filter(item => item.status === 'pending').length,
    totalTransactions: transactions.length,
    pendingRequests: swapRequests.filter(req => req.status === 'pending').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage users, listings, and platform operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeItems}</p>
            </div>
            <Package className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'items'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Items ({items.length})
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
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full max-w-md"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Points</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Swaps</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">{user.points}</td>
                          <td className="py-3 px-4">{user.total_swaps}</td>
                          <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {user.role === 'user' ? (
                                <button 
                                  onClick={() => handleUserAction(user.id, 'promote')}
                                  className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                                  title="Promote to Admin"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUserAction(user.id, 'demote')}
                                  className="p-1 text-gray-600 hover:text-orange-600 transition-colors"
                                  title="Demote to User"
                                >
                                  <Users className="h-4 w-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleUserAction(user.id, 'ban')}
                                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                title="Ban User"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'items' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Points</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Views</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={item.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-gray-500">{item.condition} • Size {item.size}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{item.user?.name}</td>
                          <td className="py-3 px-4">{item.category?.name}</td>
                          <td className="py-3 px-4">{item.points}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{item.views}</td>
                          <td className="py-3 px-4">{new Date(item.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              {item.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleItemAction(item.id, 'approve')}
                                    className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleItemAction(item.id, 'reject')}
                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'requests' && (
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
                              {request.requester?.name} → {request.owner?.name}
                            </p>
                            {request.message && (
                              <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Buyer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Seller</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Points</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={transaction.item?.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                                alt={transaction.item?.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span>{transaction.item?.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{transaction.buyer?.name}</td>
                          <td className="py-3 px-4">{transaction.seller?.name}</td>
                          <td className="py-3 px-4">{transaction.points}</td>
                          <td className="py-3 px-4">
                            <span className="capitalize">{transaction.type}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(transaction.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;