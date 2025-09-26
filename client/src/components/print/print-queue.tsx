import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, RotateCcw, Clock, CheckCircle, AlertCircle, Printer } from "lucide-react";

export default function PrintQueue() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: printJobs, isLoading, refetch } = useQuery({
    queryKey: ["/api/print-jobs/detailed"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/print-jobs/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Print job removed from queue",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove print job",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest("PUT", `/api/print-jobs/${id}`, { status }),
    onSuccess: () => {
      refetch();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "queued":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Printer className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="print-queue-loading">
        <CardHeader>
          <CardTitle>Print Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="w-20 h-6 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="print-queue">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Print Queue ({printJobs?.length || 0})</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              data-testid="button-refresh-queue"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button 
              size="sm"
              data-testid="button-add-to-queue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Queue
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!printJobs || printJobs.length === 0 ? (
          <div 
            className="flex items-center justify-center p-12 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
            data-testid="empty-print-queue"
          >
            <div className="text-center">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Print Jobs</h3>
              <p className="text-muted-foreground mb-4">
                Add students to the print queue to get started
              </p>
              <Button data-testid="button-add-first-job">
                <Plus className="h-4 w-4 mr-2" />
                Add Students to Queue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Queue Summary */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {printJobs.filter(job => job.status === "queued").length}
                </p>
                <p className="text-sm text-muted-foreground">Queued</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {printJobs.filter(job => job.status === "processing").length}
                </p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {printJobs.filter(job => job.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {printJobs.filter(job => job.status === "failed").length}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>

            {/* Print Jobs List */}
            <div className="space-y-3">
              {printJobs.map((job, index) => (
                <div 
                  key={job.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`print-job-${job.id}`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center justify-center">
                      {getStatusIcon(job.status)}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {job.student?.photoUrl ? (
                        <img 
                          src={job.student.photoUrl} 
                          alt={job.student.nameEnglish}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {job.student?.nameEnglish?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {job.student?.nameEnglish}
                        </p>
                        {job.student?.nameBengali && (
                          <p className="text-xs text-muted-foreground bengali-text truncate">
                            {job.student.nameBengali}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          ID: {job.student?.idNumber} • Template: {job.template?.name}
                        </p>
                      </div>
                    </div>

                    {job.status === "processing" && (
                      <div className="flex-1 max-w-32">
                        <Progress value={33} className="h-1" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      {getStatusBadge(job.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        Priority: {job.priority}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      {job.status === "queued" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: job.id, status: "processing" })}
                          data-testid={`button-start-job-${job.id}`}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {job.status === "failed" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: job.id, status: "queued" })}
                          data-testid={`button-retry-job-${job.id}`}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => deleteMutation.mutate(job.id)}
                        data-testid={`button-remove-job-${job.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Processing Alert */}
            {printJobs.some(job => job.status === "processing") && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Print job in progress. Estimated time remaining: 2 minutes
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
