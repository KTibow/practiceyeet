import fs from "fs/promises";
import load from "./load.js";
import {
  isLongform,
  extractMetadata,
  prepareShortformRequest,
  prepareLongformRequest,
} from "./ops.js";

const EXERCISES_FILE = `${import.meta.dirname}/exercises.txt`;
const OUTPUT_FILE = "openai_batch.jsonl";

async function prepareExercise(url, index) {
  const content = await load(url);
  const metadata = extractMetadata(content);

  let requestData;
  if (isLongform(content)) {
    requestData = prepareLongformRequest(content);
  } else {
    requestData = prepareShortformRequest(content);
  }
  requestData = requestData.replace(/\n\t+/g, "\n");

  const batchRequest = {
    custom_id: `request-${index}`,
    method: "POST",
    url: "/v1/chat/completions",
    body: {
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: requestData }],
      temperature: 0,
    },
  };

  return {
    url,
    metadata,
    batchRequest,
    isLongform: isLongform(content),
    content,
  };
}

async function createBatchFile() {
  const urls = (await fs.readFile(EXERCISES_FILE, "utf-8"))
    .split("\n")
    .filter(Boolean);
  const preparedData = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`Processing exercise ${i + 1}/${urls.length}: ${url}`);

    try {
      const exerciseData = await prepareExercise(url, i);
      preparedData.push(exerciseData);
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
    }
  }

  const batchRequests = preparedData.map((data) =>
    JSON.stringify(data.batchRequest),
  );
  await fs.writeFile(OUTPUT_FILE, batchRequests.join("\n"));
  await fs.writeFile(
    "prepared_data.json",
    JSON.stringify(preparedData, null, 2),
  );
  console.log(`Batch file created: ${OUTPUT_FILE}`);
  console.log(`Prepared data saved: prepared_data.json`);
}

createBatchFile().catch(console.error);
