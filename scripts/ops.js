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
...fields like:
<field_large>
<title>[title]</title>
<solution>
[solution here]
</solution>
</field_large>
<field_small>
<title>[title]</title>
<solution>
[solution here]
</solution>
</field_small>${
          text.includes("checkbox")
            ? `
<field_checkbox>
<title>[title]</title>
<solution>[yes or no]</solution>
</field_checkbox>`
            : ""
        }${
          text.includes("radio")
            ? `
<field_select>
<title>[title]</title>
<option>[option 1]</option>
...options
<solution>[solution index]</solution>
</field_select>`
            : ""
        }

Note: Titles are like "Output" or "x - y". Don't use "Expression 1" as a title, instead only state the expression once in the title.`,
      },
    ],
    temperature: 0,
  };

  const r = await openai(data);
  const problem = r.split("<problem>")[1].split("</problem>")[0].trim();
  const response_fields = [];
  for (const [, type, field] of r.matchAll(
    /<(field_large|field_small|field_checkbox|field_select)>(.*?)<\/(?:field_large|field_small|field_checkbox|field_select)>/gs,
  )) {
    let title = field.split("<title>")[1].split("</title>")[0];
    if (title == "output") title = "Output";

    let solution = field.split("<solution>")[1].split("</solution>")[0].trim();
    if (solution.startsWith("```") && solution.endsWith("```")) {
      solution = solution.slice(3, -3).trim();
    }

    if (type == "field_large") {
      response_fields.push({ type: "large", title, solution });
    } else if (type == "field_small") {
      response_fields.push({ type: "small", title, solution });
    } else if (type == "field_checkbox") {
      response_fields.push({ type: "checkbox", title, solution });
    } else if (type == "field_select") {
      const options = [...field.matchAll(/<option>(.*?)<\/option>/gs)].map(
        (x) => x[1],
      );
      response_fields.push({ type: "select", title, options, solution });
    }
  }

  return { problem, response_fields };
};
export const extractLongform = async (text) => {
  const data = {
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "user",
        content: `<problemarea>${text}</problemarea>
Analyze the open-ended problem above. Output ONLY in this format:

<problem>
[the cleanly formatted problem here, including any quotes or code, which should be formatted with > and \`\`\` formatting, fix any HTML escapes, and use real newlines.]
</problem>
<solution_template>
[the template for the solution, with {{INPUT}} as a placeholder for the user's input. If it's a full class or program, just use {{INPUT}}]
</solution_template>
<solution_default>
[the default code or starting point for the solution, if any]
</solution_default>
<checker>
[a Java program that checks the correctness of the user's solution. your program should:
- Exit with code 0 if correct
- Exit with code 1 and output human-readable info if incorrect
- Exit with code 1 and output the error message if it errors
the compiled solution is in the current directory, for example it may be ./Egg.class. prefer using reflection to run the solution.]
</checker>`,
      },
    ],
    temperature: 0,
  };

  const r = await openai(data);

  const problem = r.split("<problem>")[1].split("</problem>")[0].trim();
  const solution_template = r
    .split("<solution_template>")[1]
    .split("</solution_template>")[0]
    .trim();
  const solution_default = r
    .split("<solution_default>")[1]
    .split("</solution_default>")[0]
    .trim();
  const checker = r.split("<checker>")[1].split("</checker>")[0].trim();

  return { problem, solution_template, solution_default, checker };
};
