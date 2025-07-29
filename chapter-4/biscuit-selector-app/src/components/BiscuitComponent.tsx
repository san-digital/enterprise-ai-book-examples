"use client";
import { useState } from "react";
import BiscuitForm from "./BiscuitForm";
import {
    RecommendationProvider,
    useRecommendations,
} from "./hooks/useRecommendations";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";

const BiscuitComponent = () => {
  const { base, fineTuned, getRecommendations } = useRecommendations();
  const [recommendation, setRecommendation] = useState("");

  const getBiscuitRecommendation = async (situation: string) => {
    if (!situation.trim()) return;
    setRecommendation(recommendation);

    getRecommendations(situation);
  };

  return (
    <>
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {"What's your situation?"}
          </CardTitle>
          <CardDescription>
            {
              "Tell me about your mood, the time of day, what you're doing, or any other details"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BiscuitForm
            isLoading={base.isLoading || fineTuned.isLoading}
            onSubmit={(value) => getBiscuitRecommendation(value)}
          />
        </CardContent>
      </Card>
      <div className="flex justify-between gap-2">
        <div className="w-full">
          {base.recommendation && (
            <>
              <p className="text-center"> Base Model</p>

              <Card className="shadow-lg border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-800 flex items-center justify-between">
                    <p className="text-center w-full">
                      <span>Your Perfect Biscuit</span>
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-800 text-center  font-medium leading-relaxed">
                    {base.recommendation}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="w-full">
          {fineTuned.recommendation && (
            <>
              <p className="text-center">Fine Tuned Mode</p>

              <Card className="shadow-lg border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-800 flex items-center justify-between">
                    <p className="text-center w-full">
                      <span>Your Perfect Biscuit</span>
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-center text-gray-800 font-medium leading-relaxed">
                    {fineTuned.recommendation}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const BiscuitComponentWrapper = () => {
  return (
    <RecommendationProvider>
      <BiscuitComponent />
    </RecommendationProvider>
  );
};

export default BiscuitComponentWrapper;
