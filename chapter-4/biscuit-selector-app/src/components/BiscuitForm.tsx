"use client";
import { Loader2 } from "lucide-react";
import { FC, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const BiscuitForm: FC<{
  onSubmit: (value: string) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
    
  const [situation, setSituation] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(situation);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        placeholder="e.g., I'm having a stressful day at work and need something comforting with my afternoon tea..."
        className="min-h-[120px] resize-none"
        disabled={isLoading}
      />
      <Button
        type="submit"
        className="w-full bg-amber-600 hover:bg-amber-700"
        disabled={isLoading || !situation.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Getting recommendation...
          </>
        ) : (
          "Get My Biscuit Recommendation"
        )}
      </Button>
    </form>
  );
};

export default BiscuitForm;
