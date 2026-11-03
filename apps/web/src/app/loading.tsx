import { SkeletonBlock } from "@/components/feedback";

export default function Loading() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4">
        <SkeletonBlock className="h-8 w-3/4" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}
