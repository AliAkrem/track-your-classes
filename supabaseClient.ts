declare global {
  interface ImportMeta {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  }
}


import { createClient } from "@supabase/supabase-js";

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

export const useSupabaseNative = (accessToken: string, user_id: string) => {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
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
};
