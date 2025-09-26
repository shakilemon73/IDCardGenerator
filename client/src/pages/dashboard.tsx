import { useQuery } from "@tanstack/react-query";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentStudents from "@/components/dashboard/recent-students";
import QuickActions from "@/components/dashboard/quick-actions";
import TemplateGallery from "@/components/templates/template-gallery";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students", { page: 1, limit: 5 }],
  });

  const { data: popularTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/templates/popular"],
  });

  return (
    <div className="p-6 space-y-8" data-testid="dashboard-page">
      {/* Stats Cards */}
      <StatsGrid stats={stats} isLoading={statsLoading} />
      
      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Students */}
        <div className="lg:col-span-2">
          <RecentStudents 
            students={studentsData?.students || []} 
            isLoading={studentsLoading} 
          />
        </div>
        
        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
      
      {/* Template Gallery Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground">Template Gallery</h3>
            <p className="text-muted-foreground">Choose from our collection of professional ID card templates</p>
          </div>
        </div>
        
        <TemplateGallery 
          templates={popularTemplates || []} 
          isLoading={templatesLoading}
          showAll={false}
        />
      </div>
    </div>
  );
}
