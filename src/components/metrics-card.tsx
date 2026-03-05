import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  loading?: boolean;
  highlight?: boolean;
}

export function MetricsCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  loading = false,
  highlight = false,
}: MetricsCardProps) {
  return (
    <Card className={highlight ? 'bg-gradient-to-br from-green-50 to-white' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <>
            <div className={`text-2xl font-bold ${highlight ? 'text-green-600' : ''}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
