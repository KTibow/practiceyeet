import { error } from "@sveltejs/kit";
import { getProblems } from "$lib/problems";
import { fetchSupabase } from "$lib/supabase";
import { reverseTemplate } from "$lib/reverseTemplate.js";

const listAttempts = async (course: string) => {
  const userList: { owner: number }[] = await fetchSupabase(
    `/user_courses?course=eq.${course}`,
  );
  const attempts: { owner: number; problem: number; data: any }[] =
    await fetchSupabase(
      `/attempts?owner=in.(${userList.map((x) => x.owner).join(",")})`,
    );
  return { userList, attempts };
};

export const load = async ({ params, locals }) => {
  if (locals.auth != "educator") {
    error(401);
  }

  const [problems, { userList, attempts }] = await Promise.all([
    getProblems(),
    listAttempts(params.name),
  ]);

  const users = userList.map(({ owner }) => owner);
  const matrix: any[] = [];
  for (const {
    id,
    data: { title, solution_template },
  } of problems as {
    id: number;
    data: { title: string; solution_template: string };
  }[]) {
    const tracking: Record<
      string,
      { status: "complete" | "tried" | "incomplete"; code: string | undefined }
    > = {};

    for (const user of users) {
      const correctAttempt = attempts.find(
        (attempt) =>
          attempt.problem == id &&
          attempt.owner == user &&
          attempt.data.correct,
      );
      const anyAttempt = attempts.find(
        (attempt) => attempt.problem == id && attempt.owner == user,
      );
      const code =
        correctAttempt &&
        correctAttempt.data.guesses[0].startsWith("public class") &&
        reverseTemplate(solution_template, correctAttempt.data.guesses[0]);
      tracking[user] = {
        status: correctAttempt
          ? "complete"
          : anyAttempt
            ? "tried"
            : "incomplete",
        code,
      };
    }

    matrix.push({ title, tracking });
  }

  return { users, matrix };
};
