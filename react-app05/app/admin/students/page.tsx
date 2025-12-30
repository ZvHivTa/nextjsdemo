"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  UserCheck,
  Plus,
  Trash2,
  BookOpen,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// 引入组件
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentDataTable } from "@/components/app-dashborad/student-table";
import { Course, Student, ApiResponse, PaginatedResponse, College } from "@/types";
import { api } from "@/lib/api";

// 简单的专业映射（实际项目中建议从后端获取 /api/subjects?collegeId=...）
const MAJOR_OPTIONS = [
  { value: "1", label: "计算机科学与技术" },
  { value: "2", label: "软件工程" },
  { value: "3", label: "英语" },
];

const COLLEGE_OPTIONS = [
  { value: "info", label: "信息工程学院" },
];

export default function AdminStudentsPage() {
  // --- 状态管理 ---
  
  // 1. 筛选条件
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentCollege, setStudentCollege] = useState("all");
  
  // 2. 列表数据 & 分页
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  
  // 3. 动态选项 (学院)
  const [collegeOptions, setCollegeOptions] = useState<{value: string, label: string}[]>([]);

  // --- 管理模态框状态 ---
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);

  // --- 加课/退课 交互状态 ---
  const [courseIdInput, setCourseIdInput] = useState("");
  const [foundCourseToAdd, setFoundCourseToAdd] = useState<Course | null>(null);
  const [isSearchingCourse, setIsSearchingCourse] = useState(false);

  const [confirmAction, setConfirmAction] = useState<"add" | "remove" | null>(null);
  const [targetCourse, setTargetCourse] = useState<Course | null>(null);

  // --- 初始化: 获取学院列表 ---
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get<ApiResponse<College[]>>('/colleges');
        if (res.success) {
          setCollegeOptions(res.data.map(c => ({ value: c.id.toString(), label: c.name })));
        }
      } catch (error) {
        console.error("Failed to fetch colleges");
      }
    };
    fetchColleges();
  }, []);

  // --- 1. 主页面 API: 搜索学生 ---
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const params = new URLSearchParams();
      params.append("page", (pagination.pageIndex + 1).toString());
      params.append("pageSize", pagination.pageSize.toString());
      
      if (studentSearchQuery) params.append("keyword", studentSearchQuery);
      if (studentCollege !== "all") params.append("collegeId", studentCollege);
      
      const res = await api.get<ApiResponse<PaginatedResponse<Student>>>(`/admin/student/search?${params.toString()}`);
      
      if (res.success) {
        const data = res.data as any;
        const list = data.records || data.list || [];
        setDisplayedStudents(list);
        setRowCount(data.total || 0);
      }
    } catch (error) {
      console.error("Fetch students failed", error);
      toast.error("获取学生列表失败");
    } finally {
      setLoadingStudents(false);
    }
  }, [pagination, studentSearchQuery, studentCollege]);

  // 监听变化自动刷新
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchClick = () => {
    if (pagination.pageIndex !== 0) {
      setPagination(p => ({ ...p, pageIndex: 0 }));
    } else {
      fetchStudents(); // 强制刷新
    }
  };

  // --- 分页计算逻辑 ---
  const totalPages = Math.max(1, Math.ceil(rowCount / pagination.pageSize));
  const isFirstPage = pagination.pageIndex === 0;
  const isLastPage = pagination.pageIndex >= totalPages - 1;

  // --- 2. 管理功能 API ---
  
  // 获取该学生的已选课程
  const fetchStudentCourses = async (studentId: string) => {
    setIsCoursesLoading(true);
    try {
      const res = await api.get<ApiResponse<Course[]>>(`/admin/student/selectedCourse/${studentId}`);
      if (res.success) {
        setStudentCourses(res.data);
      }
    } catch (error) {
      toast.error("获取选课记录失败");
    } finally {
      setIsCoursesLoading(false);
    }
  };

  const handleOpenManage = (student: Student) => {
    setSelectedStudent(student);
    setIsManageDialogOpen(true);
    setCourseIdInput("");
    setFoundCourseToAdd(null);
    
    // 加载该学生的课
    fetchStudentCourses(student.id);
  };

  // 搜索要添加的课程 (按ID精确查找)
  const handleSearchCourseById = async () => {
    if (!courseIdInput.trim()) return;
    setIsSearchingCourse(true);
    setFoundCourseToAdd(null);

    try {
      const res = await api.get<ApiResponse<Course>>(`/admin/course/search/${courseIdInput.trim()}`);
      
      if (res.success && res.data) {
        const course = res.data;
        const isAlreadyEnrolled = studentCourses.some(c => c.id === course.id);
        if (isAlreadyEnrolled) {
          toast.warning("无法添加", { description: "该学生已选修此课程" });
        } else {
          setFoundCourseToAdd(course);
          toast.info("找到课程", { description: course.name });
        }
      } else {
        toast.error("未找到课程", { description: "课程ID不存在" });
      }
    } catch (error) {
      toast.error("查找失败", { description: "请检查课程ID是否正确" });
    } finally {
      setIsSearchingCourse(false);
    }
  };

  // --- 3. 确认操作流程 ---
  const initiateAddCourse = () => {
    if (!foundCourseToAdd) return;
    setTargetCourse(foundCourseToAdd);
    setConfirmAction("add");
  };

  const initiateRemoveCourse = (course: Course) => {
    setTargetCourse(course);
    setConfirmAction("remove");
  };

  const handleConfirmAction = async () => {
    if (!selectedStudent || !targetCourse || !confirmAction) return;

    try {
      const payload = {
        studentId: Number(selectedStudent.id),
        courseId: Number(targetCourse.id)
      };

      if (confirmAction === "add") {
        await api.post('/admin/student/select', payload);
        toast.success("添加成功", { description: `已为 ${selectedStudent.name} 选课` });
        fetchStudentCourses(selectedStudent.id);
        setFoundCourseToAdd(null);
        setCourseIdInput("");
      } else {
        await api.post('/admin/student/withdraw', payload);
        toast.success("退课成功");
        fetchStudentCourses(selectedStudent.id);
      }
    } catch (error: any) {
      toast.error(confirmAction === "add" ? "选课失败" : "退课失败", {
        description: error.message || "操作被拒绝"
      });
    } finally {
      setConfirmAction(null);
      setTargetCourse(null);
    }
  };

  // --- 4. 列定义 ---
  const studentColumns = useMemo<ColumnDef<Student>[]>(
    () => [
      { accessorKey: "id", header: "学号", id: "学号" },
      { accessorKey: "name", header: "姓名", id: "姓名" },
      { 
        accessorKey: "collegeName", 
        header: "学院", 
        id: "学院" 
      },
      { 
        accessorKey: "subjectName", 
        header: "专业", 
        id: "专业" 
      },
      { 
        accessorKey: "year",   
        header: "年级", 
        id: "年级" 
      },
      {
        id: "actions",
        header: "操作",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenManage(row.original)}
          >
            <UserCheck className="mr-2 h-4 w-4" /> 管理选课
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* 主页面：搜索卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>学生选课管理</CardTitle>
          <CardDescription>检索学生并进行人工选课或退课操作。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索学号或姓名..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="pl-8"
                onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
              />
            </div>

            <div className="w-[200px]">
              <Select value={studentCollege} onValueChange={setStudentCollege}>
                <SelectTrigger>
                  <SelectValue placeholder="所有学院" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有学院</SelectItem>
                  {collegeOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearchClick}>
              <Search className="mr-2 h-4 w-4" /> 搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 主页面：学生列表 */}
      <Card>
        <CardContent>
          <StudentDataTable
            columns={studentColumns}
            data={displayedStudents}
            loading={loadingStudents}
            
            // 服务端分页
            rowCount={rowCount}
            pagination={pagination}
            onPaginationChange={setPagination}
          />

          
        </CardContent>
      </Card>

      {/* --- 管理模态框 (Dialog) --- */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-xl">选课管理控制台</DialogTitle>
            <DialogDescription>
              正在操作学生：
              <span className="font-bold text-primary mx-1">
                {selectedStudent?.name}
              </span>
              ({selectedStudent?.id}) | {selectedStudent?.subjectName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* 左侧：添加课程区域 */}
            <div className="md:col-span-1 space-y-4 border-r pr-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center">
                  <Plus className="w-4 h-4 mr-2 text-primary" /> 添加课程
                </h3>
                <p className="text-xs text-muted-foreground">
                  输入课程ID精确查找。
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="ID (如 6001)"
                  value={courseIdInput}
                  onChange={(e) => setCourseIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchCourseById()}
                />
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleSearchCourseById}
                  disabled={isSearchingCourse}
                >
                  {isSearchingCourse ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {/* 搜索结果展示区 */}
              {foundCourseToAdd && (
                <Card className="bg-muted/50 border-dashed">
                  <CardContent className="p-4 space-y-2">
                    <div className="font-bold text-sm">
                      {foundCourseToAdd.name}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>ID: {foundCourseToAdd.id}</p>
                      <p>教师: {foundCourseToAdd.teacher}</p>
                      <p>学分: {foundCourseToAdd.credit}</p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={initiateAddCourse}
                    >
                      确认添加此课
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 右侧：已选课程列表 */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-primary" />
                  已选课程 ({studentCourses.length})
                </h3>
              </div>

              <div className="rounded-md border h-[300px] overflow-y-auto relative">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>课程名称</TableHead>
                      <TableHead>教师</TableHead>
                      <TableHead>学分</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isCoursesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : studentCourses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          该学生暂未选课
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-mono text-xs">
                            {course.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {course.name}
                          </TableCell>
                          <TableCell>{course.teacher}</TableCell>
                          <TableCell>{course.credit}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => initiateRemoveCourse(course)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">关闭</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- 全局确认框 (Alert Dialog) --- */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "add" ? "确认添加课程" : "确认强制退课"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要为学生{" "}
              <span className="font-bold text-foreground">
                {selectedStudent?.name}
              </span>
              {confirmAction === "add" ? " 添加 " : " 退选 "}
              课程{" "}
              <span className="font-bold text-foreground">
                《{targetCourse?.name}》
              </span>{" "}
              吗？
              <br />
              <span className="text-red-500 text-xs mt-2 block">
                注意：管理员操作将绕过部分选课规则（如人数限制）。
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmAction === "remove"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              确认{confirmAction === "add" ? "添加" : "退选"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}