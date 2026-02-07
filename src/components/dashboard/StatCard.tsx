import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('hover-lift border-border/50 h-full', className)}>
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="space-y-1 sm:space-y-2">
            <p className="text-[10px] sm:text-sm font-medium text-muted-foreground leading-none">{title}</p>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-3xl font-bold text-foreground">{value}</span>
              {trend && (
                <span
                  className={cn(
                    'text-[10px] sm:text-sm font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-primary/10 shrink-0">
            <Icon className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
