import load from "./load.js";
import {
  isLongform,
  extractMetadata,
  prepareShortformRequest,
  prepareLongformRequest,
  parseShortformResponse,
  parseLongformResponse,
  createProblem,
  openai,
} from "./ops.js";
import "dotenv/config";

const t1 = await load(
  "https://practiceit.cs.washington.edu/problem/view/bjp4/chapter12/e9%2DsumTo",
);
if (isLongform(t1)) {
  const metadata = extractMetadata(t1);
  const message = { role: "user", content: prepareLongformRequest(t1) };
  message.content = message.content.replace(/\n\t+/g, "\n");
  const data = parseLongformResponse(
    await openai({
      model: "gpt-4o-2024-08-06",
      messages: [message],
      temperature: 0,
    }),
  );

  await createProblem({
    type: "longform",
    title: metadata.title,
    author: metadata.author,
    problem: data.problem,
    solution_template: data.solution_template,
    solution_default: data.solution_default,
    checker: data.checker,
  });
} else {
  const metadata = extractMetadata(t1);
  const message = { role: "user", content: prepareShortformRequest(t1) };
  const data = parseShortformResponse(
    await openai({
      model: "gpt-4o-2024-08-06",
      messages: [message],
      temperature: 0,
    }),
  );

  await createProblem({
    type: "shortform",
    title: metadata.title,
    author: metadata.author,
    problem: data.problem,
    response_fields: data.response_fields,
  });
}
