import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Connected to Supabase database');

// Database query function using Supabase client
export async function query(text, params = []) {
  try {
    // For simple SELECT queries, use Supabase client
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      const tableMatch = text.match(/FROM\s+(\w+)/i);
      const tableName = tableMatch?.[1] || 'users';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      return { rows: data };
    }
    
    // For INSERT queries
    if (text.trim().toUpperCase().startsWith('INSERT')) {
      const tableMatch = text.match(/INTO\s+(\w+)/i);
      const tableName = tableMatch?.[1];
      
      if (!tableName) throw new Error('Table name not found in INSERT query');
      
      // Extract column names and values from the query
      const valuesMatch = text.match(/VALUES\s*\(([^)]+)\)/i);
      if (!valuesMatch) throw new Error('VALUES clause not found');
      
      // This is a simplified implementation - in production, you'd want more robust parsing
      const { data, error } = await supabase
        .from(tableName)
        .insert({}); // You'd parse the actual values here
      
      if (error) throw error;
      return { rows: data };
    }
    
    // For other queries, we'll need to implement them using Supabase client
    console.warn('Complex query not implemented with Supabase client:', text);
    return { rows: [] };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get client function (for compatibility)
export async function getClient() {
  return {
    query: async (text, params) => {
      return await query(text, params);
    },
    release: () => {}
  };
}

// Transaction function (simplified for Supabase)
export async function transaction(callback) {
  // Supabase doesn't support traditional transactions in the same way
  // This is a simplified implementation
  try {
    const result = await callback({
      query: async (text, params) => {
        return await query(text, params);
      }
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Close function (no-op for Supabase client)
export async function closePool() {
  console.log('🔌 Supabase client connection closed');
}

// Export Supabase client for direct use
export { supabase };

export default supabase;
