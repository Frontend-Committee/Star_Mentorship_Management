import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
}

export default function ProgressCard({ title, current, total, unit = '' }: ProgressCardProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <Card className="hover-lift border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <TrendingUp className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{current}</span>
            <span className="text-muted-foreground">/ {total} {unit}</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {percentage}% complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
