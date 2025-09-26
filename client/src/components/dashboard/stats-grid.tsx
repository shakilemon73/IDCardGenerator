import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Printer, Palette, Clock } from "lucide-react";

interface AdvancedAnalyticsData {
  totalStudents: {
    current: number;
    previousMonth: number;
    monthOverMonthGrowth: string;
  };
  cardsPrinted: {
    current: number;
    previousWeek: number;
    weekOverWeekGrowth: string;
  };
  templates: {
    current: number;
    newThisMonth: number;
    newThisMonthText: string;
  };
  printQueue: {
    current: number;
    processing: number;
    averageProcessingTime: number;
    queueStatus: string;
    estimatedTime: string;
  };
}

interface StatsGridProps {
  stats?: AdvancedAnalyticsData;
  isLoading: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  // Determine change color based on growth
  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) {
      return 'text-green-600';
    } else if (change.startsWith('-')) {
      return 'text-red-600';
    } else {
      return 'text-blue-600';
    }
  };

  const statsCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents?.current || 0,
      change: stats?.totalStudents?.monthOverMonthGrowth || "+0%",
      changeLabel: "from last month",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Cards Printed",
      value: stats?.cardsPrinted?.current || 0,
      change: stats?.cardsPrinted?.weekOverWeekGrowth || "+0%",
      changeLabel: "from last week",
      icon: Printer,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Templates",
      value: stats?.templates?.current || 0,
      change: stats?.templates?.newThisMonthText || "0 new",
      changeLabel: "this month",
      icon: Palette,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Print Queue",
      value: stats?.printQueue?.current || 0,
      change: stats?.printQueue?.queueStatus || "Idle",
      changeLabel: stats?.printQueue?.estimatedTime || "No jobs in queue",
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-grid-loading">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="mt-4 space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-grid">
      {statsCards.map((stat, index) => (
        <Card key={stat.title} data-testid={`stat-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground" data-testid={`stat-value-${index}`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} text-xl`} size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`${getChangeColor(stat.change)} font-medium`}>{stat.change}</span>
              <span className="text-muted-foreground ml-2">{stat.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
