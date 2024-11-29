import { CustomLink } from "../ui/custom-link";
import { Separator } from "../ui/separator";

const PlayWith = () => {
  return (
    <div className="flex flex-col gap-2 mt-10">
      <CustomLink href="/soon" variant="inverted">
        A Friend next to you
      </CustomLink>
      <Separator />
      <CustomLink href="/soon" variant="inverted">
        A Friend !next to you
      </CustomLink>
      <Separator />
      <CustomLink href="/soon" variant="inverted">
        AI
      </CustomLink>
    </div>
  );
};

export default PlayWith;
