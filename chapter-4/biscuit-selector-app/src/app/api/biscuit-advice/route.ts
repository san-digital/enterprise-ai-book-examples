import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { situation, type } = await req.json()
    console.log(type);

    if (!situation || typeof situation !== "string") {
      return Response.json({ error: "Situation is required" }, { status: 400 })
    }

    let model = "gpt-4o";
    if (type === "fine-tuned" && fs.existsSync("../resources/model.json")) {
      const fileString = fs.readFileSync("../resources/model.json").toString();
      console.log(fileString);
      model = JSON.parse(fileString).model;
    }

    console.log("Using model " + model);
    const { text } = await generateText({
      model: openai(model),
      system: `You are a biscuit selector. Return only the name of one biscuit appropriate for the user's situation.`,
      prompt: `Based on this situation, recommend the perfect biscuit: "${situation}"`,
    })

    return Response.json({ recommendation: text })
  } catch (error) {
    console.log(error)
    console.error("Error generating biscuit recommendation:", error)
    return Response.json({ error: "Failed to generate recommendation" }, { status: 500 })
  }
}


// export async function POST(req: Request) {
//   try {
//     const { situation } = await req.json()

//     if (!situation || typeof situation !== "string") {
//       return Response.json({ error: "Situation is required" }, { status: 400 })
//     }
//     const models = ["gpt-4o"]
//     console.log(fs.existsSync("../resources/model.json"));
//     if (fs.existsSync("../resources/model.json")) {
//       const fileString = fs.readFileSync("../resources/model.json").toString();
//       console.log(fileString);
//       models.push(JSON.parse(fileString).model);
//     }

//     console.log("models", models)
//     const [baseModelRecommendation, fineTunedRecommendation] = await Promise.all(["gpt-4o",].map(model => generateText({
//       model: openai(model),
//       system: `You are a biscuit selector. Return only the name of one biscuit appropriate for the user's situation.`,
//       prompt: `Based on this situation, recommend the perfect biscuit: "${situation}"`,
//     })))

//     return Response.json({ recommendation: baseModelRecommendation, })
//   } catch (error) {
//     console.log(error);
//     console.error("Error generating biscuit recommendation:", error)
//     return Response.json({ error: "Failed to generate recommendation" }, { status: 500 })
//   }
// }
