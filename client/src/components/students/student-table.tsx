import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StudentForm from "./student-form";
import { Edit, Printer, Trash2, Eye } from "lucide-react";

interface StudentTableProps {
  students: Student[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onRefetch: () => void;
}

export default function StudentTable({ 
  students, 
  total, 
  currentPage, 
  onPageChange, 
  isLoading, 
  onRefetch 
}: StudentTableProps) {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/students/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      onRefetch();
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "graduated":
        return <Badge variant="outline">Graduated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="student-table-loading">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded">
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
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-students-table">
        <p className="text-muted-foreground text-lg">No students found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Add your first student to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4" data-testid="student-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>ID Number</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} data-testid={`student-row-${student.id}`}>
                <TableCell>
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
                </TableCell>
                <TableCell className="font-mono">{student.idNumber}</TableCell>
                <TableCell>
                  {student.class}{student.section ? `-${student.section}` : ''}
                  {student.rollNumber && (
                    <span className="text-muted-foreground text-xs block">
                      Roll: {student.rollNumber}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {student.phoneNumber && (
                    <div className="text-sm">
                      <p>{student.phoneNumber}</p>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(student.status || 'active')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingStudent(student)}
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
                      onClick={() => setDeletingStudent(student)}
                      data-testid={`button-delete-${student.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, total)} of {total} students
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage * 20 >= total}
              data-testid="button-next-page"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <StudentForm 
              initialData={editingStudent}
              onSuccess={() => { 
                setEditingStudent(null); 
                onRefetch(); 
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingStudent} onOpenChange={() => setDeletingStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingStudent?.nameEnglish}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingStudent) {
                  deleteMutation.mutate(deletingStudent.id);
                  setDeletingStudent(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
