import { fetchSupabase } from "./supabase";

export const getProblems = async () => {
  const problems: { id: number; data: { title: string } }[] =
    await fetchSupabase(`/problems`);
  return problems.sort(
    ({ data: { title: aTitle } }, { data: { title: bTitle } }) => {
      const [, aMajor, aMinor] = aTitle.match(/\b(\d+)\.(\d+)/)!;
      const [, bMajor, bMinor] = bTitle.match(/\b(\d+)\.(\d+)/)!;

      if (aMajor != bMajor) return +aMajor - +bMajor;
      if (aTitle.includes("Exercise") && !bTitle.includes("Exercise")) return 1;
      if (!aTitle.includes("Exercise") && bTitle.includes("Exercise"))
        return -1;
      return +aMinor - +bMinor;
    },
  );
};
