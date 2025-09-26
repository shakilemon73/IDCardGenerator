import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StudentTable from "@/components/students/student-table";
import StudentForm from "@/components/students/student-form";
import ExcelImport from "@/components/students/excel-import";
import { Plus, FileSpreadsheet, Search } from "lucide-react";

export default function Students() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { data: studentsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/students", { page, limit: 20, search }],
  });

  return (
    <div className="p-6 space-y-6" data-testid="students-page">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Management</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-students"
                />
              </div>
              
              <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" data-testid="button-import-students">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import Students from Excel</DialogTitle>
                  </DialogHeader>
                  <ExcelImport onSuccess={() => { setIsImportOpen(false); refetch(); }} />
                </DialogContent>
              </Dialog>

              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-student">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <StudentForm onSuccess={() => { setIsAddOpen(false); refetch(); }} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StudentTable
            students={studentsData?.students || []}
            total={studentsData?.total || 0}
            currentPage={page}
            onPageChange={setPage}
            isLoading={isLoading}
            onRefetch={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
}
