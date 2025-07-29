"use client";
import { Loader2, CheckCircle2, ThumbsUp } from "lucide-react";
import { FC, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardHeader, CardTitle } from "./ui/card";

interface CustomAnswerFormProps {
  onSubmit: (customAnswer: string) => void;
  isLoading: boolean;
  submitted: boolean;
}

const CustomAnswerForm: FC<CustomAnswerFormProps> = ({
  onSubmit,
  isLoading,
  submitted,
}) => {
  const [customAnswer, setCustomAnswer] = useState("");
  const [customAnswerSelected, setCustomAnswerSelected] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAnswer.trim() || isLoading || submitted) return;
    onSubmit(customAnswer);
  };

  return (
    <div className="w-full my-8 flex flex-col items-center">
      {!customAnswerSelected && (
        <Button
          variant="outline"
          onClick={() => setCustomAnswerSelected(true)}
          disabled={customAnswerSelected || submitted}
        >
          Add Custom Answer
        </Button>
      )}

      {customAnswerSelected && (
        <Card className="shadow-lg border-amber-200 bg-amber-50 min-w-xl px-6 pb-4">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800 flex items-center justify-between">
              <p className="text-center w-full">
                <span>Add Custom Answer</span>
              </p>
            </CardTitle>
          </CardHeader>
          <form
            onSubmit={handleSubmit}
            className="w-full mt-4 max-w-lg space-y-4"
          >
            <Textarea
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              placeholder="Biscuit Name"
              className="min-h-[120px] resize-none"
              disabled={isLoading || submitted}
            />

            <div className="flex justify-center">
              <Button
                type="submit"
                variant="outline"
                disabled={isLoading || submitted || !customAnswer.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Submitted!
                  </>
                ) : (
                  <>I prefer this response <ThumbsUp/></>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {submitted && (
        <div className="mt-4 text-md flex items-center gap-2">
          <p className="text-center">{customAnswer}</p>
        </div>
      )}
      {submitted && (
        <div className="mt-4 text-green-600 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Your custom answer was submitted successfully!
        </div>
      )}
    </div>
  );
};

export default CustomAnswerForm;
