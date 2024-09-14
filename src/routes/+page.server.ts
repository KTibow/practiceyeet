import { error } from "@sveltejs/kit";
import { fetchSupabase } from "$lib/supabase";

const getProblems = async () => {
  return await fetchSupabase(`/problems`);
};
const getAttempts = async (owner: string) => {
  return await fetchSupabase(`/attempts?owner=eq.${owner}`);
};

export const actions = {
  default: async ({ request, cookies, locals }) => {
    const data = await request.formData();

    const id = data.get("id");
    if (typeof id != "string") error(400);

    cookies.set("auth", id, { path: "/" });
    locals.auth = id;
  },
};

export const load = async ({ locals }) => {
  let problems: any[];
  let attempts: any[] | undefined;
  if (locals.auth) {
    [problems, attempts] = await Promise.all([
      getProblems(),
      getAttempts(locals.auth),
    ]);
  } else {
    problems = await getProblems();
  }
  return {
    problems: problems
      .map((p) => ({
        id: p.id,
        title: p.data.title,
        completed: Boolean(
          attempts?.find((a) => a.problem == p.id && a.data.correct),
        ),
      }))
      .sort((a, b) => {
        const [, aMajor, aMinor] = a.title.match(/\b(\d+)\.(\d+)\b/);
        const [, bMajor, bMinor] = b.title.match(/\b(\d+)\.(\d+)\b/);

        if (aMajor != bMajor) return aMajor - bMajor;
        return aMinor - bMinor;
      }),
  };
};
