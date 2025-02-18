import { PlayerType } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WinnerModal({ winner }: { winner: PlayerType }) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  return (
    isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-96 text-center">
          <h2 className="text-xl font-semibold mb-4">Congratulations!</h2>
          {winner === "T" ? (
            <p className="text-gray-600 mb-6">Match has been Tied!</p>
          ) : (
            <p className="text-gray-600 mb-6">Player {winner} wins!</p>
          )}
          <div className="flex justify-center gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => router.push("/")}
            >
              Play a new game
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );
}
