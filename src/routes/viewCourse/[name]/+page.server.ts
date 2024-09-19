import { error } from "@sveltejs/kit";
import { getProblems } from "$lib/problems";
import { fetchSupabase } from "$lib/supabase";

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
  for (const problem of problems) {
    const tracking: Record<
      string,
      { status: "complete" | "tried" | "incomplete"; code: string | undefined }
    > = {};

    for (const user of users) {
      const correctAttempt = attempts.find(
        (attempt) =>
          attempt.problem == problem.id &&
          attempt.owner == user &&
          attempt.data.correct,
      );
      const anyAttempt = attempts.find(
        (attempt) => attempt.problem == problem.id && attempt.owner == user,
      );
      tracking[user] = {
        status: correctAttempt
          ? "complete"
          : anyAttempt
            ? "tried"
            : "incomplete",
        code: correctAttempt?.data.guesses[0].startsWith("public class")
          ? correctAttempt.data.guesses[0]
          : undefined,
      };
    }

    matrix.push({ title: problem.data.title, tracking });
  }

  return { users, matrix };
};
