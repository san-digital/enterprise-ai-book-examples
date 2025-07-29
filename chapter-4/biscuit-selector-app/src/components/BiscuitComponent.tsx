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

import { Check, CheckCircle, LoaderIcon, ThumbsUp } from "lucide-react";
import { usePostCorrection } from "./hooks/useAddCorrection";
import { Button } from "./ui/button";
import CustomAnswerForm from "./CustomAnswerForm";

const BiscuitComponent = () => {
  const { base, fineTuned, getRecommendations } = useRecommendations();
  const [recommendation, setRecommendation] = useState("");
  const [cachedSituation, setCachedSituation] = useState("");
  const [preferenceUpdated, setPrederenceUpdated] = useState<
    "fine-tuned" | "base" | "custom" | undefined
  >();

  const postCorrection = usePostCorrection();

  const getBiscuitRecommendation = async (situation: string) => {
    if (!situation.trim()) return;

    setCachedSituation(situation);
    setPrederenceUpdated(undefined);
    postCorrection.reset();

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
                  <div className="flex justify-center my-4">
                    {(preferenceUpdated === undefined ||
                      preferenceUpdated === "base") && (
                      <Button
                        variant="outline"
                        disabled={
                          postCorrection.loading ||
                          preferenceUpdated !== undefined
                        }
                        onClick={async () => {
                          await postCorrection.postCorrection({
                            situation: cachedSituation,
                            correctedRecommendation: fineTuned.recommendation,
                          });
                          setPrederenceUpdated("base");
                        }}
                      >
                        I prefer this response{" "}
                        {postCorrection.loading ? (
                          <LoaderIcon />
                        ) : preferenceUpdated === "base" ? (
                          <CheckCircle />
                        ) : (
                          <ThumbsUp />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="w-full">
          {fineTuned.recommendation && (
            <>
              <p className="text-center">Fine Tuned Model</p>

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
                  <div className="flex justify-center my-4">
                    {(preferenceUpdated === undefined ||
                      preferenceUpdated === "fine-tuned") && (
                      <Button
                        variant="outline"
                        disabled={
                          postCorrection.loading ||
                          preferenceUpdated !== undefined
                        }
                        onClick={async () => {
                          await postCorrection.postCorrection({
                            situation: cachedSituation,
                            correctedRecommendation: fineTuned.recommendation,
                          });
                          setPrederenceUpdated("fine-tuned");
                        }}
                      >
                        I prefer this response{" "}
                        {postCorrection.loading ? (
                          <LoaderIcon />
                        ) : preferenceUpdated === "fine-tuned" ? (
                          <CheckCircle />
                        ) : (
                          <ThumbsUp />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <CustomAnswerForm
        isLoading={postCorrection.loading}
        submitted={preferenceUpdated === "custom"}
        onSubmit={async (customAnswer) => {
          await postCorrection.postCorrection({
            situation: cachedSituation,
            correctedRecommendation: customAnswer,
          });
          setPrederenceUpdated("custom");
        }}
      />
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
