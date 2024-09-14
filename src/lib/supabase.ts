import { SB_KEY } from "$env/static/private";

export const fetchSupabase = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const response = await fetch(
    `https://bnbdkuqqhotcnyqxapxj.supabase.co/rest/v1${endpoint}`,
    {
      ...options,
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        ...options.headers,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.statusText}`);
  }

  try {
    return await response.json();
  } catch {}
};
