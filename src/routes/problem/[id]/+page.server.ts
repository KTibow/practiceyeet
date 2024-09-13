import { SB_KEY } from "$env/static/private";
import { error } from "@sveltejs/kit";

const getProblem = async (problem: string) => {
  const r = await fetch(
    `https://bnbdkuqqhotcnyqxapxj.supabase.co/rest/v1/problems?id=eq.${problem}`,
    {
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
      },
    },
  );
  const json = await r.json();
  return json[0]?.data;
};
const getAttempts = async (owner: string, problem: string) => {
  const r = await fetch(
    `https://bnbdkuqqhotcnyqxapxj.supabase.co/rest/v1/attempts?owner=eq.${owner}&problem=eq.${problem}`,
    {
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
      },
    },
  );
  const json: any[] = await r.json();
  return json.map((x) => ({ ...x.data, created_at: x.created_at }));
};
const saveAttempt = async (
  owner: string,
  problem: string,
  data: Record<string, unknown>,
) => {
  const r = await fetch(
    "https://bnbdkuqqhotcnyqxapxj.supabase.co/rest/v1/attempts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
      },
      body: JSON.stringify({
        owner,
        problem,
        data,
      }),
    },
  );
  if (!r.ok) {
    throw new Error("Failed to save attempt");
  }
};

export const actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.auth) error(401);

    const problem: Record<string, any> = await getProblem(params.id);
    if (!problem) error(404);

    const data = await request.formData();
    if (problem.type == "shortform") {
      const guesses = [];
      const results: Record<string, boolean> = {};
      for (let i = 0; i < problem.response_fields.length; i++) {
        let guess = data.get(`response-${i}`) as string;
        let solution = problem.response_fields[i].solution;
        guess = guess.replaceAll("\r", "").trim();

        guesses.push(guess);
        if (guess == solution) {
          results[i] = true;
        } else {
          results[i] = false;
        }
      }
      const allCorrect = Object.values(results).every((x) => x);

      await saveAttempt(locals.auth, params.id, {
        correct: allCorrect,
        guesses,
      });
      if (allCorrect) {
        return {
          message: "correct",
        };
      }
    }
  },
};

export const load = async ({ params, locals }) => {
  let problem: Record<string, any> | undefined;
  let attempts: Record<string, any>[] = [];
  if (locals.auth) {
    [problem, attempts] = await Promise.all([
      getProblem(params.id),
      getAttempts(locals.auth, params.id),
    ]);
  } else {
    problem = await getProblem(params.id);
  }

  if (problem && problem.type == "shortform") {
    problem.response_fields = problem.response_fields.map((field: any) => {
      return {
        title: field.title,
        size: field.size,
      };
    });
  }

  return {
    problem,
    attempts,
  };
};
