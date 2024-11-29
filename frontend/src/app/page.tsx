import PlayWith from "@/components/play-with/play-with";

export default function Home() {
  return (
    <div className="flex flex-col my-2 gap-2 items-center">
      <span className="text-2xl font-semibold">Play super tic-tac-toe</span>
      <span className="font-medium">WITH</span>
      <PlayWith />
    </div>
  );
}
