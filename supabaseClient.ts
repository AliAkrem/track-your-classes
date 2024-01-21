declare global {
  interface ImportMeta {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  }
}


import { Capacitor } from "@capacitor/core";
import { SupabaseClient, createClient } from "@supabase/supabase-js";








const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;




export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    flowType: "pkce",
  },
  global: {
    headers: {
      //   'Authorization': `Bearer ${accessToken}`,

      //   'Prefer': `user_id=${userId}`
    },
  },
});


let supabaseInstance: SupabaseClient | null = null;


// Function to create or return the existing Supabase client.
export const useSupabaseNative = (accessToken: string, user_id: string): SupabaseClient => {
  // If the Supabase client instance does not exist, create it.
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: "pkce",
      },
      global: {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Prefer": `user_id=${user_id}`,
        },
      },
    });
  } 

  // Return the Supabase client instance.
  return supabaseInstance;
};
