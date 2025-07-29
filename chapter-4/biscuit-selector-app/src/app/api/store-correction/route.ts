/* eslint-disable @typescript-eslint/no-explicit-any */

import { appendFileSync } from "fs";
import { resolve } from "path";

/**
 * Appends a JSON object to a .jsonl file.
 * Each call writes a new line containing a stringified JSON object.
 *
 * @param filePath - Path to the .jsonl file
 * @param data - The JSON object to append
 */
function appendToJsonlFile(filePath: string, data: any) {
  const fullPath = resolve(filePath);
  const line = "\n" + JSON.stringify(data);

  try {
    appendFileSync(fullPath, line, { encoding: "utf8" });
    console.log(`✅ Appended to ${fullPath}`);
  } catch (error) {
    console.error(`❌ Failed to write to file: ${error}`);
  }
}


export async function POST(req: Request) {
  try {
    const { situation, correctedRecommendation } = await req.json()

    // Validate required fields
    if (!situation || !correctedRecommendation) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const promptMessage = {
      "messages": [
        { "role": "system", "content": "You are a biscuit selector. Return only the name of one biscuit appropriate for the user's situation." },
        { "role": "user", "content": situation },
        { "role": "assistant", "content": correctedRecommendation }]
    }

    appendToJsonlFile("../resources/biscuit_selector.jsonl", promptMessage);

    return Response.json({
      success: true,
      message: "Correction saved successfully",
      id: `correction_${Date.now()}`, // In real app, this would be the database ID
    })
  } catch (error) {
    console.error("Error saving correction:", error)
    return Response.json({ error: "Failed to save correction" }, { status: 500 })
  }
}
