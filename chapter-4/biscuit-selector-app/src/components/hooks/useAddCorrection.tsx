/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";

interface RecommendationResponse {
  recommendation: string;
}

interface UsePostCorrectionResult {
  data: RecommendationResponse | null;
  error: string;
  loading: boolean;
  reset: () => void;
  postCorrection: (payload: {
    situation: string;
    correctedRecommendation?: string;
  }) => Promise<void>;
}

export function usePostCorrection(): UsePostCorrectionResult {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const postCorrection = async ({
    situation,
    correctedRecommendation,
  }: {
    situation: string;
    originalRecommendation?: string;
    correctedRecommendation?: string;
  }) => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch("/api/store-correction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          situation,
          correctedRecommendation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendation");
      }

      const result: RecommendationResponse = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    error,
    loading,
    postCorrection,
    reset: () => {
      setLoading(false);
      setError("");
      setData(null);
    },
  };
}
