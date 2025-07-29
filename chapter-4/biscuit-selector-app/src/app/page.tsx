import BiscuitComponent from "@/components/BiscuitComponent";
import { Cookie } from "lucide-react";

export default function Home() {
  return (
    <div className="font-sans grid  items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="w-3xl flex flex-col justify-center">
        <div className="text-center mb-8 grow">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cookie className="h-8 w-8 text-amber-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Biscuit Advisor
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Describe your situation and get the perfect biscuit recommendation!
          </p>
        </div>

        <BiscuitComponent/>
      </main>
    </div>
  );
}
