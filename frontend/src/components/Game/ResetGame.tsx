"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { useResetGame } from "@/hooks/useResetGame";
import { toast } from "sonner";
import clsx from "clsx";
import { extractErrorMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const ResetGame: React.FC<{
  gameId: string;
}> = ({ gameId }) => {
  const { mutate, isLoading } = useResetGame();
  const router = useRouter();

  const handleResetGame = () => {
    mutate(gameId, {
      onSuccess: (data) => {
        toast.info(data.message);
      },
      onError: (error: unknown) => {
        const message = extractErrorMessage(error);
        toast.error("Something went wrong", { description: message });
        router.push("/");
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="bg-secondary hover:text-secondary hover:bg-primary"
      onClick={handleResetGame}
      disabled={isLoading}
    >
      <RefreshCw
        className={clsx(
          "w-6 h-6 transition-transform",
          isLoading && "animate-spin",
        )}
      />
    </Button>
  );
};
