"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { useResetGame } from "@/hooks/useResetGame";
import { toast } from "sonner";
import clsx from "clsx";
import { cn, extractErrorMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const ResetGame: React.FC<{
  gameId: string;
  userId: string;
  classname: string | undefined;
}> = ({ gameId, userId, classname }) => {
  const { mutate, isLoading } = useResetGame();
  const router = useRouter();

  const handleResetGame = () => {
    mutate(
      { game_id: gameId, user_id: userId },
      {
        onSuccess: (data) => {
          toast.info(data.message);
          location.reload();
        },
        onError: (error: unknown) => {
          const message = extractErrorMessage(error);
          toast.error("Something went wrong", { description: message });
          router.push("/");
        },
      },
    );
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "bg-secondary hover:text-secondary hover:bg-primary",
        classname,
      )}
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
