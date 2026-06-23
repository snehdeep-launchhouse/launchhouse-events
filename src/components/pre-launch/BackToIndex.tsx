import { ArrowUp } from "lucide-react";

export default function BackToIndex() {
  return (
    <div className="mt-8 flex justify-end">
      <a
        href="#index"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowUp className="w-3.5 h-3.5" />
        Back to Index
      </a>
    </div>
  );
}
