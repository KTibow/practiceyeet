import { error } from "@sveltejs/kit";
import { shuffle } from "$lib/shuffle";
import { fetchSupabase } from "$lib/supabase";

type Problem = {
  title: string;
  author: string;
  problem: string;
};
type ShortformProblem = Problem & {
  type: "shortform";
  response_fields: ResponseField[];
};
type LongformProblem = Problem & {
  type: "longform";
  solution_template: string;
  solution_default: string;
  checker: string;
};

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

const getProblem = async (
  problem: string,
): Promise<ShortformProblem | LongformProblem | undefined> => {
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

const processShortformSubmission = (
  problem: ShortformProblem,
  formData: FormData,
) => {
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

const processLongformSubmission = async (
  problem: LongformProblem,
  formData: FormData,
) => {
  const text = formData.get("text") as string;
  const checker = problem.checker;

  const checkR = await fetch(
    "https://practiceyeet-degkbfb6epg2efc7.westus-01.azurewebsites.net/compile",
    {
      method: "POST",
      body: `${text}
START CHECKER
${checker}`,
    },
  );
  const checkOk = checkR.ok;
  const checkText = await checkR.text();

  let feedback = "";
  if (!checkOk) {
    feedback = checkText;
  }
  return { guesses: [text], allCorrect: checkOk, feedback };
};

export const actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.auth) error(401);

    const problem = await getProblem(params.id);
    if (!problem) error(404);

    if (problem.type == "shortform") {
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
    if (problem.type == "longform") {
      const formData = await request.formData();
      const { guesses, allCorrect, feedback } = await processLongformSubmission(
        problem,
        formData,
      );

      await saveAttempt(locals.auth, params.id, {
        correct: allCorrect,
        guesses,
      });
      return { feedback };
    }
  },
};

export const load = async ({ params, locals }) => {
  let problem:
    | (Problem & {
        type: "shortform";
        response_fields: {
          type: string;
          title: string;
          options?: string[];
        }[];
      })
    | (Problem & {
        type: "longform";
        solution_template: string;
        solution_default: string;
        checker?: string;
      })
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

  if (problem && problem.type == "shortform") {
    problem.response_fields = problem.response_fields.map((field) => ({
      type: field.type,
      title: field.title,
      options: field.options ? shuffle(field.options) : [],
    }));
  }
  if (problem && problem.type == "longform") {
    delete problem.checker;
  }

  return { problem, attempts };
};
