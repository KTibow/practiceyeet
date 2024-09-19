import { fetchSupabase } from "$lib/supabase.js";
import { error, redirect } from "@sveltejs/kit";

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.auth) error(401);

    const data = await request.formData();
    const course = data.get("course");
    if (typeof course != "string") error(400);

    await fetchSupabase("/user_courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: locals.auth, course }),
    });

    return { course };
  },
};

export const load = async ({ request }) => {
  if (request.method != "POST") {
    redirect(302, "/");
  }
};
