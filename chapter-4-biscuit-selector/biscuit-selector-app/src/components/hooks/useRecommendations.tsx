import React, { createContext, useContext, useState, ReactNode } from "react";

type RecommendationResult = {
  recommendation: string;
  isLoading: boolean;
  error: string;
};

type RecommendationContextType = {
  base: RecommendationResult;
  fineTuned: RecommendationResult;
  getRecommendations: (situation: string) => Promise<void>;
};

const RecommendationContext = createContext<
  RecommendationContextType | undefined
>(undefined);

export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error(
      "useRecommendations must be used within a RecommendationProvider"
    );
  }
  return context;
};
export const RecommendationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [base, setBase] = useState<RecommendationResult>({
    recommendation: "",
    isLoading: false,
    error: "",
  });

  const [fineTuned, setFineTuned] = useState<RecommendationResult>({
    recommendation: "",
    isLoading: false,
    error: "",
  });

  const getRecommendations = async (situation: string) => {
    if (!situation.trim()) return;

    setBase({ recommendation: "", isLoading: true, error: "" });
    setFineTuned({ recommendation: "", isLoading: true, error: "" });

    const fetchRecommendation = async (type: "base" | "fine-tuned") => {
      try {
        const response = await fetch("/api/biscuit-advice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ situation: situation.trim(), type }),
        });

        if (!response.ok) throw new Error("Failed to get recommendation");

        const data = await response.json();
        return { recommendation: data.recommendation, error: "" };
      } catch {
        return {
          recommendation: "",
          error: `Sorry, I couldn't get a ${type} biscuit recommendation.`,
        };
      }
    };

    await Promise.all([
      fetchRecommendation("base").then((baseResult) =>
        setBase({
          error: baseResult.error || "",
          recommendation: baseResult.recommendation || "",
          isLoading: false,
        })
      ),
      fetchRecommendation("fine-tuned").then((fineTunedResult) =>
        setFineTuned({
          error: fineTunedResult.error || "",
          recommendation: fineTunedResult.recommendation || "",
          isLoading: false,
        })
      ),
    ]);
  };

  return (
    <RecommendationContext.Provider
      value={{ base, fineTuned, getRecommendations }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};
