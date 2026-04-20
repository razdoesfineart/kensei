import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
const SUPABASE_URL = 'https://nxwmslicqbdrxoyruwlr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d21zbGljcWJkcnhveXJ1d2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTQ0OTYsImV4cCI6MjA5MjI3MDQ5Nn0.XhCLpjpvBh3ow-w5cU7ycMSJVwpS4WBu6XGeIbK_SG8';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
