import { supabase } from './supabase'

export const testDatabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing basic connection...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error)
      return false
    }
    
    console.log('✅ Basic connection successful')
    
    // Test 2: Check if tables exist
    console.log('2. Testing table access...')
    const tables = ['profiles', 'categories', 'items', 'swap_requests', 'transactions']
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('*').limit(1)
        if (tableError) {
          console.error(`❌ Table ${table} not accessible:`, tableError.message)
        } else {
          console.log(`✅ Table ${table} accessible`)
        }
      } catch (err) {
        console.error(`❌ Error accessing table ${table}:`, err)
      }
    }
    
    // Test 3: Check if categories are populated
    console.log('3. Testing categories data...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
    
    if (categoriesError) {
      console.error('❌ Categories table error:', categoriesError)
    } else {
      console.log(`✅ Categories table has ${categories?.length || 0} records`)
      if (categories && categories.length > 0) {
        console.log('Sample categories:', categories.slice(0, 3).map(c => c.name))
      }
    }
    
    // Test 4: Check auth configuration
    console.log('4. Testing auth configuration...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth configuration error:', authError)
    } else {
      console.log('✅ Auth configuration working')
      console.log('Current session:', authData.session ? 'Active' : 'None')
    }
    
    console.log('🎉 Database connection test completed!')
    return true
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return false
  }
}

// Test environment variables
export const checkEnvironmentVariables = () => {
  console.log('🔍 Checking environment variables...')
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables!')
    return false
  }
  
  console.log('✅ All environment variables are set')
  return true
} 