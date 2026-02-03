import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function WeeksSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:h-10" />
          <Skeleton className="h-4 w-64 sm:h-5" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Progress Card Skeleton (Member only) */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1 space-y-2 w-full">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-10 w-24 shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* Accordion List Skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/50">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
