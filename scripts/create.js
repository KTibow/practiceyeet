import load from "./load.js";
import {
  isLongform,
  extractMetadata,
  extractShortform,
  extractLongform,
  createProblem,
} from "./ops.js";

const t1 = await load(
  "https://practiceit.cs.washington.edu/problem/view/bjp4/chapter1/e9%2DEgg",
);
if (isLongform(t1)) {
  const metadata = extractMetadata(t1);
  const data = await extractLongform(t1);

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
  const data = await extractShortform(t1);

  await createProblem({
    type: "shortform",
    title: metadata.title,
    author: metadata.author,
    problem: data.problem,
    response_fields: data.response_fields,
  });
}
