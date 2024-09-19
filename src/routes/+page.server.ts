import { error } from "@sveltejs/kit";
import { fetchSupabase } from "$lib/supabase";
import { getProblems } from "$lib/problems";

const getAttempts = async (owner: string) => {
  return await fetchSupabase(`/attempts?owner=eq.${owner}`);
};
const getCourse = async (owner: string) => {
  const data = await fetchSupabase(`/user_courses?owner=eq.${owner}`);
  return data?.[0]?.course;
};

export const actions = {
  default: async ({ request, cookies, locals }) => {
    const data = await request.formData();

    const id = data.get("id");
    if (id) {
      if (typeof id != "string") error(400);

      cookies.set("auth", id, { path: "/" });
      locals.auth = id;
    } else {
      cookies.set("auth", "educator", { path: "/" });
      locals.auth = "educator";
    }
  },
};

export const load = async ({ locals }) => {
  let problems:
    | {
        id: number;
        data: {
          title: string;
        };
      }[]
    | undefined;
  let attempts: any[] | undefined;
  let course: string | undefined;
  if (locals.auth == "educator") {
    // Nothing
  } else if (locals.auth) {
    [problems, attempts, course] = await Promise.all([
      getProblems(),
      getAttempts(locals.auth),
      getCourse(locals.auth),
    ]);
  } else {
    problems = await getProblems();
  }
  return {
    problems: problems?.map(({ id, data: { title } }) => ({
      id,
      title: title.replace("BJP4 ", ""),
      completed: Boolean(
        attempts?.find((a) => a.problem == id && a.data.correct),
      ),
    })),
    course,
    allCourses: ["APCSA (Mulvaney P3)", "APCSA (Mulvaney P6)"],
  };
};
