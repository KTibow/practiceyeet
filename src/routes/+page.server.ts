import { SB_KEY } from "$env/static/private";
import { error } from "@sveltejs/kit";

const getProblems = async () => {
  const r = await fetch(
    `https://bnbdkuqqhotcnyqxapxj.supabase.co/rest/v1/problems`,
    {
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
      },
    },
  );
  return await r.json();
};
const getAttempts = async (owner: string) => {
  const r = await fetch(
    `https://bnbdkuqqhotcnyqxapxj.supabase.co/rest/v1/attempts?owner=eq.${owner}`,
    {
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
      },
    },
  );
  return await r.json();
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
