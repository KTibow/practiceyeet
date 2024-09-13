import "dotenv/config";

export const openai = async (data) => {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_KEY}`,
    },
    body: JSON.stringify(data),
  });
  const json = await r.json();

  return json.choices[0].message.content;
};
export const createProblem = async (data) => {
  await fetch("https://bnbdkuqqhotcnyqxapxj.supabase.co/rest/v1/problems", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.SB_KEY,
      Authorization: `Bearer ${process.env.SB_KEY}`,
    },
    body: JSON.stringify({
      data,
    }),
  });
};
export const isLongform = (text) => {
  return text.includes("Type your solution");
};
export const extractMetadata = (text) => {
  return {
    title: text
      .split("<h2")[1]
      .split(">")[1]
      .split("<")[0]
      .trim()
      .replace(/\s+/g, " "),
    author: text.split(`<div id="author"`)[1].split("\n")[2].trim(),
  };
};
export const extractShortform = async (text) => {
  const data = {
    model: "gpt-4o-2024-08-06",
    // model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `<problemarea>${text}</problemarea>
Look at that problem. Output ONLY this format:

<problem>
[the cleanly formatted problem here. this includes any quotes or code, which should be formatted with > and \`\`\` formatting, fix any HTML escapes, and use real newlines.]
</problem>
<field>
<title>[title of a field here, like "Output" or "x - y"]</title>
<size>[small or large]</size>
<solution>
[solution here]
</solution>
</field>
...more fields as needed

Note: using "x - y" as a title is better than using "Expression 1" as a title`,
      },
    ],
    temperature: 0,
  };

  const r = await openai(data);
  const problem = r.split("<problem>")[1].split("</problem>")[0].trim();
  const response_fields = [];
  for (const [, field] of r.matchAll(/<field>(.*?)<\/field>/gs)) {
    let title = field.split("<title>")[1].split("</title>")[0];
    if (title == "output") title = "Output";
    const size = field.split("<size>")[1].split("</size>")[0];
    let solution = field.split("<solution>")[1].split("</solution>")[0].trim();
    if (solution.startsWith("```") && solution.endsWith("```")) {
      solution = solution.slice(3, -3).trim();
    }

    response_fields.push({ title, size, solution });
  }

  return { problem, response_fields };
};
