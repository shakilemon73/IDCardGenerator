import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Printer, Palette, Clock } from "lucide-react";

interface StatsData {
  totalStudents: number;
  cardsPrinted: number;
  templatesCount: number;
  printQueue: number;
}

interface StatsGridProps {
  stats?: StatsData;
  isLoading: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const statsCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      change: "+12%",
      changeLabel: "from last month",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Cards Printed",
      value: stats?.cardsPrinted || 0,
      change: "+8%",
      changeLabel: "from last week",
      icon: Printer,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Templates",
      value: stats?.templatesCount || 0,
      change: "3 new",
      changeLabel: "this month",
      icon: Palette,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Print Queue",
      value: stats?.printQueue || 0,
      change: "Processing",
      changeLabel: "5 minutes remaining",
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
              <span className="text-green-600 font-medium">{stat.change}</span>
              <span className="text-muted-foreground ml-2">{stat.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
