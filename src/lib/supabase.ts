import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  name: string
  email: string
  points: number
  avatar_url?: string
  role: 'user' | 'admin'
  location?: string
  bio?: string
  total_swaps: number
  rating: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  created_at: string
}

export interface Item {
  id: string
  title: string
  description: string
  category_id: string
  size: string
  condition: 'Like New' | 'Excellent' | 'Good' | 'Fair'
  points: number
  tags: string[]
  images: string[]
  user_id: string
  status: 'active' | 'swapped' | 'pending' | 'rejected'
  views: number
  created_at: string
  updated_at: string
  category?: Category
  user?: Profile
}

export interface SwapRequest {
  id: string
  item_id: string
  requester_id: string
  owner_id: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  item?: Item
  requester?: Profile
  owner?: Profile
}

export interface Transaction {
  id: string
  item_id: string
  buyer_id: string
  seller_id: string
  points: number
  type: 'swap' | 'purchase'
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
  item?: Item
  buyer?: Profile
  seller?: Profile
}

// Auth helpers
export const signUp = async (email: string, password: string, name: string) => {
  try {
    // First, create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })
    
    if (error) {
      console.error('Auth signup error:', error)
      return { data, error }
    }
    
    // If signup was successful, create profile manually
    if (data.user) {
      console.log('User created successfully, creating profile...')
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: name,
          email: email,
          role: email === 'admin@rewear.com' ? 'admin' : 'user'
        })
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Even if profile creation fails, the user account was created
        // We'll handle profile creation in the AuthContext
        return { data, error: null }
      } else {
        console.log('Profile created successfully')
      }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Signup error:', error)
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Profile helpers
export const getProfile = async (userId: string): Promise<Profile | null> => {
  console.log('getProfile called for user:', userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  console.log('getProfile result:', data ? 'found' : 'not found', data);
  return data
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export const createProfile = async (userId: string, name: string, email: string) => {
  console.log('createProfile called for user:', userId, name, email);
  
  // Set default values based on email
  const role = email === 'admin@rewear.com' ? 'admin' : 'user';
  const points = email === 'admin@rewear.com' ? 9999 : 1000;
  const location = email === 'admin@rewear.com' ? 'San Francisco, CA' : 'New York, NY';
  const bio = email === 'admin@rewear.com' ? 'Administrator of the ReWear app' : 'Demo user for testing the ReWear app';
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      name: name,
      email: email,
      role: role,
      points: points,
      location: location,
      bio: bio,
      total_swaps: 0,
      rating: 5.0
    })
    .select()
    .single()
  
  console.log('createProfile result:', { data, error });
  return { data, error }
}

// Categories helpers
export const getCategories = async (): Promise<Category[]> => {
  console.log('getCategories called');
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  console.log('getCategories result:', data?.length || 0, 'categories');
  return data || []
}

// Items helpers
export const getItems = async (filters?: {
  category?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ items: Item[], count: number }> => {
  console.log('getItems called with filters:', filters);
  
  let query = supabase
    .from('items')
    .select(`
      *,
      category:categories(*)
    `, { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category_id', filters.category)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching items:', error)
    return { items: [], count: 0 }
  }

  console.log('getItems result:', { items: data?.length || 0, count: count || 0 });
  return { items: data || [], count: count || 0 }
}

export const getItem = async (id: string): Promise<Item | null> => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching item:', error)
    return null
  }

  // Increment view count
  await supabase
    .from('items')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', id)

  return data
}

export const createItem = async (item: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'views' | 'status'>) => {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single()

  return { data, error }
}

export const updateItem = async (id: string, updates: Partial<Item>) => {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export const deleteItem = async (id: string) => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  return { error }
}

export const getUserItems = async (userId: string): Promise<Item[]> => {
  console.log('Fetching user items for user:', userId);
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user items:', error)
    return []
  }

  console.log('User items fetched:', data?.length || 0);
  return data || []
}

// Swap requests helpers
export const createSwapRequest = async (swapRequest: Omit<SwapRequest, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
  const { data, error } = await supabase
    .from('swap_requests')
    .insert(swapRequest)
    .select()
    .single()

  return { data, error }
}

export const getSwapRequests = async (userId: string): Promise<SwapRequest[]> => {
  console.log('Fetching swap requests for user:', userId);
  const { data, error } = await supabase
    .from('swap_requests')
    .select('*')
    .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching swap requests:', error)
    return []
  }

  console.log('Swap requests fetched:', data?.length || 0);
  return data || []
}

export const updateSwapRequest = async (id: string, updates: Partial<SwapRequest>) => {
  const { data, error } = await supabase
    .from('swap_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Transactions helpers
export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'status'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single()

  return { data, error }
}

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  console.log('Fetching transactions for user:', userId);
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  console.log('Transactions fetched:', data?.length || 0);
  return data || []
}

// Admin helpers
export const getAllUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data || []
}

export const getAllItems = async (): Promise<Item[]> => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      category:categories(*),
      user:profiles(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all items:', error)
    return []
  }

  return data || []
}

export const getAllSwapRequests = async (): Promise<SwapRequest[]> => {
  const { data, error } = await supabase
    .from('swap_requests')
    .select(`
      *,
      item:items(*),
      requester:profiles(*),
      owner:profiles(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all swap requests:', error)
    return []
  }

  return data || []
}

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      item:items(*),
      buyer:profiles(*),
      seller:profiles(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all transactions:', error)
    return []
  }

  return data || []
}

// Test function to check database connection
export const testDatabaseConnection = async () => {
  console.log('Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};