import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { useResetGame } from "@/hooks/useResetGame";
import { toast } from "sonner";
import clsx from "clsx";

export const ResetGame: React.FC<{
  gameId: string;
}> = ({ gameId }) => {
  const { mutate, isLoading } = useResetGame();

  const handleResetGame = () => {
    mutate(gameId, {
      onSuccess: () => {
        toast("Reset game Successful!");
      },
      onError: (error) => {
        toast.error("Something went wrong", {
          description: JSON.stringify(error),
        });
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
