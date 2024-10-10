import fs from "fs/promises";
import {
  parseShortformResponse,
  parseLongformResponse,
  createProblem,
} from "./ops.js";
import "dotenv/config";

const PREPARED_DATA_FILE = "prepared_data.json";
const OPENAI_RESPONSES_FILE = "openai_responses.jsonl";

async function processResponses() {
  const preparedData = JSON.parse(
    await fs.readFile(PREPARED_DATA_FILE, "utf-8"),
  );
  const responses = (await fs.readFile(OPENAI_RESPONSES_FILE, "utf-8"))
    .split("\n")
    .filter(Boolean)
    .map(JSON.parse);

  for (let i = 0; i < preparedData.length; i++) {
    const { url, metadata, isLongform } = preparedData[i];
    const response = responses.find((r) => r.custom_id === `request-${i}`);

    if (!response) {
      console.error(`No response found for request-${i}`);
      continue;
    }

    const content = response.response.body.choices[0].message.content;

    try {
      let problemData;
      if (isLongform) {
        const longformData = parseLongformResponse(content);
        problemData = {
          type: "longform",
          title: metadata.title,
          author: metadata.author,
          problem: longformData.problem,
          solution_template: longformData.solution_template,
          solution_default: longformData.solution_default,
          checker: longformData.checker,
        };
      } else {
        const shortformData = parseShortformResponse(content);
        problemData = {
          type: "shortform",
          title: metadata.title,
          author: metadata.author,
          problem: shortformData.problem,
          response_fields: shortformData.response_fields,
        };
      }

      await createProblem(problemData);
      console.log(`Problem created for ${url}`);
    } catch (error) {
      console.error(`Error processing response for ${url}:`, error);
    }
  }
}

processResponses().catch(console.error);
