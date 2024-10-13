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

function fixIndentation(inputText) {
  // Split the text into lines
  let lines = inputText.split("\n");

  // Trim trailing spaces from all lines
  lines = lines.map((line) => line.trimEnd());

  // Find the minimum indentation level (ignoring empty lines and the first line)
  const minIndent = Math.min(
    ...lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => line.length - line.trimLeft().length),
  );

  // Remove the minimum indentation from each line, except the first line
  const fixedLines = [
    lines[0],
    ...lines.slice(1).map((line) => line.slice(minIndent)),
  ];

  // Join the lines back together
  return fixedLines.join("\n");
}

export const prepareShortformRequest = (text) => {
  const textSlim =
    (text.match(/<div id="description".*?<\/div>/s)?.[0] || "") +
    (text.match(/<form.*?\/form>/s)?.[0] || "");
  return `<problemarea>${textSlim}</problemarea>
Look at that problem. Output ONLY this format:

<problem>
[the cleanly formatted problem here. this includes any quotes or code, which should be formatted with > and \`\`\` formatting, fix any HTML escapes, and use real newlines. names of fields don't go here.]
</problem>
...fields like:
<field_text>
<title>[title]</title>
<solution>
[solution here]
</solution>
</field_text>${
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

note: field titles are like "Output" or "x - y", not "expression 1".`;
};

export const prepareLongformRequest = (text) => {
  const nameOfProblem =
    text.match(/:  ((?:[A-Z][a-z0-9]*)+)\n/)?.[1] || "Solution";
  const textSlim =
    (text.match(/<div id="description".*?<\/div>/s)?.[0] || "") +
    (text.match(/<div id="showmetheheaderarea".*?<\/div>/s)?.[0] || "") +
    (text.match(/<div id="initialvaluereset".*?<\/div>/s)?.[0] || "") +
    (text.match(/<div id="problemtypeclarification".*?<\/div>/s)?.[0] || "");

  return `<problemarea>${textSlim}</problemarea>
Analyze the open-ended problem above. Output ONLY in this format:

<problem>
[the cleanly formatted problem here. ONLY base this on the description div. include quotes (use > format) or code (use \`\`\` format). do NOT indent outside of code blocks. do NOT put math as images; put math as simple TeX. only a subset of markdown is supported; for other things like tables, use unicode/HTML.]
</problem>
<thinking>
[think about different ways to make the upcoming templates and checker. it's imperative that they work. if there's anything tricky relating to imports, variables, or similar, think here.]
</thinking>
[
the user needs context and their code needs to work as a standalone class. create a template for that, like one of the following. don't solve the problem for them.
setup 1 (for editing a class):
<solution_template>
<input>public class ${nameOfProblem} {
    public static void main(String[] args) {
        // Your code here
    }
}</input>
</solution_template>
setup 2 (for editing bare code):
<solution_template>
public class ${nameOfProblem} {
    public static void main(String[] args) {
        <input>// Your code here</input>
    }
}
</solution_template>
setup 3 (for editing a method, but can be modified for much more):
<solution_template>
public class ${nameOfProblem} {
    <input>public static void someMethod() {
        // Your code here
    }</input>
}
</solution_template>
]
<checker>
[a Java program that checks the correctness of the user's solution. your program should:
- Exit with code 0 if correct
- Exit with code 1 and clearly explain why it's incorrect to standard error if incorrect
- Exit with code 1 and forward the error message to standard error if it errors
the compiled solution is in the current directory, for example it may be ./${nameOfProblem}.class. prefer using reflection to run the solution. do NOT be lazy when coding this.]
</checker>`;
};

export const parseShortformResponse = (response) => {
  const problem = response.split("<problem>")[1].split("</problem>")[0].trim();
  const response_fields = [];
  for (const [, type, field] of response.matchAll(
    /<(field_text|field_checkbox|field_select)>(.*?)<\/(?:field_text|field_checkbox|field_select)>/gs,
  )) {
    let title = field.split("<title>")[1].split("</title>")[0];
    if (title == "output") title = "Output";

    let solution = field.split("<solution>")[1].split("</solution>")[0].trim();
    if (solution.startsWith("```") && solution.endsWith("```")) {
      solution = solution.split("\n").slice(1, -1).join("\n");
    }

    if (type == "field_text") {
      const size =
        solution.length < 50 && !solution.includes("\n") ? "small" : "large";
      response_fields.push({ type: size, title, solution });
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

export const parseLongformResponse = (response) => {
  const problem = response.split("<problem>")[1].split("</problem>")[0].trim();
  const solution_template = response
    .split("<solution_template>")[1]
    .split("</solution_template>")[0]
    .trim();
  const checker = response.split("<checker>")[1].split("</checker>")[0].trim();

  return {
    problem,
    solution_template:
      solution_template.split("<input>")[0] +
      "{{INPUT}}" +
      solution_template.split("</input>")[1],
    solution_default: fixIndentation(
      solution_template.split("<input>")[1].split("</input>")[0].trim(),
    ),
    checker,
  };
};

export const createProblem = async (data) => {
  const r = await fetch(
    "https://bnbdkuqqhotcnyqxapxj.supabase.co/rest/v1/problems",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SB_KEY,
        Authorization: `Bearer ${process.env.SB_KEY}`,
      },
      body: JSON.stringify({
        data,
      }),
    },
  );
  if (!r.ok) {
    console.error(await r.text());
    throw new Error("Failed to create problem");
  }
};
