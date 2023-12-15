import { createClient } from '@supabase/supabase-js'
require('dotenv').config()
const supabaseUrl = process.env.SUPABASE_URL || '' // Set a default value if SUPABASE_URL is undefined
const supabaseKey = process.env.SUPABASE_KEY ?? '' // Set a default value if SUPABASE_KEY is undefined
export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)
