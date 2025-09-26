import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Student } from "@shared/schema";
import { Edit, Printer, Trash2 } from "lucide-react";

interface RecentStudentsProps {
  students: Student[];
  isLoading: boolean;
}

export default function RecentStudents({ students, isLoading }: RecentStudentsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Card Printed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Print</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Design</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="recent-students-loading">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Students</CardTitle>
            <Skeleton className="h-8 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="recent-students">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Students</CardTitle>
          <Link href="/students">
            <Button variant="ghost" size="sm" data-testid="button-view-all-students">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8" data-testid="empty-students">
            <p className="text-muted-foreground">No students found</p>
            <Link href="/students">
              <Button className="mt-4" data-testid="button-add-first-student">
                Add First Student
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ID Number
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Class
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-muted/50 transition-colors"
                    data-testid={`student-row-${student.id}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {student.photoUrl ? (
                          <img 
                            src={student.photoUrl} 
                            alt={student.nameEnglish}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {student.nameEnglish.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{student.nameEnglish}</p>
                          {student.nameBengali && (
                            <p className="text-xs text-muted-foreground">{student.nameBengali}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{student.idNumber}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {student.class}{student.section ? `-${student.section}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(student.status || 'active')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-edit-${student.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-green-600 hover:text-green-500"
                          data-testid={`button-print-${student.id}`}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive/80"
                          data-testid={`button-delete-${student.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
