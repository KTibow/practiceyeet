import load from "./load.js";
import {
  isLongform,
  extractMetadata,
  extractShortform,
  createProblem,
} from "./ops.js";

const t1 = await load(
  "https://practiceit.cs.washington.edu/problem/view/bjp4/chapter1/s1%2DbinaryNumbers",
);
if (isLongform(t1)) {
  // ...
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
