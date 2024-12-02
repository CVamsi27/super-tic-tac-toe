import { CustomLink } from "../ui/custom-link";

const PlayWith = () => {
  return (
    <div className="flex flex-col gap-8 mt-10">
      <CustomLink href="/next-to-you" variant="inverted">
        A Friend next to you
      </CustomLink>
      <CustomLink href="/soon" variant="inverted">
        A Friend !next to you
      </CustomLink>
      <CustomLink href="/soon" variant="inverted">
        AI
      </CustomLink>
    </div>
  );
};

export default PlayWith;
