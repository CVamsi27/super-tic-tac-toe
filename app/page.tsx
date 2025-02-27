import PlayWith from "@/components/PlayWith/PlayWith";

export default function Home() {
  return (
    <div className="flex flex-col my-2 gap-2 items-center h-full">
      <span className="font-medium">WITH</span>
      <PlayWith />
    </div>
  );
}
