import { error } from "@sveltejs/kit";
import { shuffle } from "$lib/shuffle";
import { fetchSupabase } from "$lib/supabase";

interface Problem {
  type: string;
  title: string;
  author: string;
  problem: string;
  response_fields: ResponseField[];
  [key: string]: any;
}

interface ResponseField {
  type: string;
  title: string;
  solution: string;
  options?: string[];
}

interface Attempt {
  correct: boolean;
  guesses: string[];
  created_at: string;
}

const getProblem = async (problem: string): Promise<Problem | undefined> => {
  const json = await fetchSupabase(`/problems?id=eq.${problem}`);
  return json[0]?.data;
};

const getAttempts = async (
  owner: string,
  problem: string,
): Promise<Attempt[]> => {
  const json: any[] = await fetchSupabase(
    `/attempts?owner=eq.${owner}&problem=eq.${problem}`,
  );
  return json.map((x) => ({ ...x.data, created_at: x.created_at }));
};

const saveAttempt = async (
  owner: string,
  problem: string,
  data: Record<string, unknown>,
) => {
  await fetchSupabase("/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner, problem, data }),
  });
};

const processShortformSubmission = (problem: Problem, formData: FormData) => {
  const processGuess = (field: ResponseField, guess: string): string => {
    switch (field.type) {
      case "large":
      case "small":
        return guess.replaceAll("\r", "").trim();
      case "checkbox":
        return guess ? "yes" : "no";
      case "select":
        return guess.replaceAll("\r", "").trim();
      default:
        return guess;
    }
  };
  const processSolution = (field: ResponseField): string => {
    switch (field.type) {
      case "large":
      case "small":
      case "checkbox":
        return field.solution;
      case "select":
        return field.options![+field.solution];
      default:
        return "";
    }
  };

  const guesses: string[] = [];
  const results: Record<string, boolean> = {};

  problem.response_fields.forEach((field, index) => {
    const guess = formData.get(`response-${index}`) as string;
    const processedGuess = processGuess(field, guess);
    const processedSolution = processSolution(field);
    guesses.push(processedGuess);
    results[index] = processedGuess == processedSolution;
  });

  const allCorrect = Object.values(results).every(Boolean);
  return { guesses, allCorrect };
};

export const actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.auth) error(401);

    const problem = await getProblem(params.id);
    if (!problem) error(404);

    if (problem.type === "shortform") {
      const formData = await request.formData();
      const { guesses, allCorrect } = processShortformSubmission(
        problem,
        formData,
      );

      await saveAttempt(locals.auth, params.id, {
        correct: allCorrect,
        guesses,
      });
    }
  },
};

export const load = async ({ params, locals }) => {
  let problem:
    | {
        type: string;
        title: string;
        author: string;
        problem: string;
        response_fields: { type: string; title: string; options?: string[] }[];
      }
    | undefined;
  let attempts: Attempt[] = [];

  if (locals.auth) {
    [problem, attempts] = await Promise.all([
      getProblem(params.id),
      getAttempts(locals.auth, params.id),
    ]);
  } else {
    problem = await getProblem(params.id);
  }

  if (problem && problem.type === "shortform") {
    problem.response_fields = problem.response_fields.map((field) => ({
      type: field.type,
      title: field.title,
      options: field.options ? shuffle(field.options) : [],
    }));
  }

  return { problem, attempts };
};
