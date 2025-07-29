export async function POST(req: Request) {
  try {
    const { situation, originalRecommendation, correctedRecommendation, timestamp } = await req.json()

    // Validate required fields
    if (!situation || !originalRecommendation || !correctedRecommendation) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Format the data for fine-tuning
    const correctionData = {
      situation: situation.trim(),
      originalRecommendation: originalRecommendation.trim(),
      correctedRecommendation: correctedRecommendation.trim(),
      timestamp: timestamp || new Date().toISOString(),
      // Format suitable for OpenAI fine-tuning
      fineTuningFormat: {
        messages: [
          {
            role: "system",
            content: `You are a biscuit expert who gives perfect biscuit recommendations based on situations. 
            
            Rules:
            - Always respond with exactly ONE biscuit recommendation
            - Be specific about the biscuit type (e.g., "Chocolate Digestives", "Jammy Dodgers", "Rich Tea", "Hobnobs", etc.)
            - Give a brief, friendly explanation (1-2 sentences) of why this biscuit is perfect for their situation
            - Keep your response under 50 words
            - Be warm and enthusiastic about biscuits
            - Consider factors like mood, time of day, activities, and preferences mentioned`,
          },
          {
            role: "user",
            content: `Based on this situation, recommend the perfect biscuit: "${situation.trim()}"`,
          },
          {
            role: "assistant",
            content: correctedRecommendation.trim(),
          },
        ],
      },
    }

    // Log the correction data (in a real app, you'd save this to a database)
    console.log("=== BISCUIT RECOMMENDATION CORRECTION ===")
    console.log("Timestamp:", correctionData.timestamp)
    console.log("Situation:", correctionData.situation)
    console.log("Original AI Response:", correctionData.originalRecommendation)
    console.log("User Correction:", correctionData.correctedRecommendation)
    console.log("Fine-tuning Format:", JSON.stringify(correctionData.fineTuningFormat, null, 2))
    console.log("==========================================")

    // In a production app, you would:
    // 1. Save to a database (e.g., Supabase, Neon, etc.)
    // 2. Potentially add to a fine-tuning dataset
    // 3. Track correction patterns for model improvement

    // Example database save (uncomment and adapt for your database):
    /*
    await db.corrections.create({
      data: {
        situation: correctionData.situation,
        originalRecommendation: correctionData.originalRecommendation,
        correctedRecommendation: correctionData.correctedRecommendation,
        timestamp: correctionData.timestamp,
        fineTuningData: correctionData.fineTuningFormat
      }
    })
    */

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
