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
  ArrowUpDown,
  Search,
  UserCheck,
  Plus,
  Trash2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

// 引入组件
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentDataTable } from "@/components/app-dashborad/student-table";
import { Course, Student } from "@/data/types";


// --- 模拟数据 ---
const MOCK_ALL_STUDENTS: Student[] = [
  {
    id: "20210001",
    name: "张三",
    college: "信息工程学院",
    major: "计算机科学",
    year: "大三",
  },
  {
    id: "20210002",
    name: "李四",
    college: "信息工程学院",
    major: "软件工程",
    year: "大三",
  },
  {
    id: "20220001",
    name: "王五",
    college: "外国语学院",
    major: "英语",
    year: "大二",
  },
  {
    id: "20230001",
    name: "赵六",
    college: "艺术设计学院",
    major: "视觉传达",
    year: "大一",
  },
  {
    id: "20230002",
    name: "钱七",
    college: "艺术设计学院",
    major: "环境设计",
    year: "大一",
  },
];

const MOCK_ALL_COURSES: Course[] = [
  { id: "C001", name: "高等数学A", teacher: "王教授", credits: 4.0 },
  { id: "C003", name: "数据结构", teacher: "刘博士", credits: 4.0 },
  { id: "C006", name: "计算机网络", teacher: "赵教授", credits: 4.0 },
  { id: "C002", name: "大学英语", teacher: "李老师", credits: 3.0 },
  { id: "C005", name: "设计素描", teacher: "陈老师", credits: 2.0 },
];

const MOCK_ENROLLMENTS: Record<string, Set<string>> = {
  "20210001": new Set(["C003", "C006"]),
  "20210002": new Set(["C003"]),
  "20220001": new Set(["C002"]),
  "20230001": new Set([]),
};

// 选项数据
const COLLEGE_OPTIONS = [
  { value: "info", label: "信息工程学院" },
  { value: "lang", label: "外国语学院" },
  { value: "art", label: "艺术设计学院" },
];

// 简单的专业映射（实际项目中应根据学院联动）
const MAJOR_OPTIONS = [
  { value: "cs", label: "计算机科学" },
  { value: "se", label: "软件工程" },
  { value: "eng", label: "英语" },
  { value: "jap", label: "日语" },
  { value: "vis", label: "视觉传达" },
  { value: "env", label: "环境设计" },
];

export default function AdminStudentsPage() {
  // --- 主页面状态 ---
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);

  // 筛选状态
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentCollege, setStudentCollege] = useState("all");
  const [studentMajor, setStudentMajor] = useState("all"); // 新增专业筛选

  // --- 管理模态框状态 ---
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);

  // --- 加课/退课 交互状态 ---
  const [courseIdInput, setCourseIdInput] = useState("");
  const [foundCourseToAdd, setFoundCourseToAdd] = useState<Course | null>(null);

  const [confirmAction, setConfirmAction] = useState<"add" | "remove" | null>(
    null
  );
  const [targetCourse, setTargetCourse] = useState<Course | null>(null);

  // --- 1. 主页面 API: 搜索学生 ---
  const runStudentSearch = useCallback(
    (query: string, college: string, major: string) => {
      setLoadingStudents(true);
      // 模拟后端延迟
      new Promise((res) => setTimeout(res, 500)).then(() => {
        let students = MOCK_ALL_STUDENTS;

        // 后端逻辑模拟：文本模糊查询
        if (query) {
          const lowerQuery = query.toLowerCase();
          students = students.filter(
            (s) =>
              s.name.toLowerCase().includes(lowerQuery) ||
              s.id.includes(lowerQuery)
          );
        }

        // 后端逻辑模拟：学院筛选
        if (college !== "all") {
          // 这里简单匹配 label，实际应匹配 value
          const label = COLLEGE_OPTIONS.find((c) => c.value === college)?.label;
          if (label) {
            students = students.filter((s) => s.college === label);
          }
        }

        // 后端逻辑模拟：专业筛选
        if (major !== "all") {
          const label = MAJOR_OPTIONS.find((m) => m.value === major)?.label;
          if (label) {
            students = students.filter((s) => s.major === label);
          }
        }

        setDisplayedStudents(students);
        setLoadingStudents(false);
      });
    },
    []
  );

  // 初始加载
  useEffect(() => {
    runStudentSearch("", "all", "all");
  }, [runStudentSearch]);

  // 处理搜索点击
  const handleSearchClick = () => {
    runStudentSearch(studentSearchQuery, studentCollege, studentMajor);
  };

  // --- 2. 管理功能 API (保持不变) ---
  const handleOpenManage = (student: Student) => {
    setSelectedStudent(student);
    setIsManageDialogOpen(true);
    setIsCoursesLoading(true);
    setCourseIdInput("");
    setFoundCourseToAdd(null);

    new Promise((res) => setTimeout(res, 400)).then(() => {
      const enrolledIds = MOCK_ENROLLMENTS[student.id] || new Set();
      const courses = MOCK_ALL_COURSES.filter((c) => enrolledIds.has(c.id));
      setStudentCourses(courses);
      setIsCoursesLoading(false);
    });
  };

  const handleSearchCourseById = () => {
    if (!courseIdInput.trim()) return;
    const course = MOCK_ALL_COURSES.find(
      (c) => c.id.toLowerCase() === courseIdInput.toLowerCase()
    );

    if (course) {
      const isAlreadyEnrolled = studentCourses.some((c) => c.id === course.id);
      if (isAlreadyEnrolled) {
        toast.warning("无法添加", {
          description: `学生已选修课程：${course.name} (${course.id})`,
          position: "top-center",
        });
        setFoundCourseToAdd(null);
      } else {
        setFoundCourseToAdd(course);
        toast.info("找到课程", {
          description: `${course.name} - ${course.teacher}`,
          position: "top-center",
        });
      }
    } else {
      toast.error("未找到课程", {
        description: `系统中不存在 ID 为 "${courseIdInput}" 的课程`,
        position: "top-center",
      });
      setFoundCourseToAdd(null);
    }
  };

  // --- 3. 确认操作流程 (保持不变) ---
  const initiateAddCourse = () => {
    if (!foundCourseToAdd) return;
    setTargetCourse(foundCourseToAdd);
    setConfirmAction("add");
  };

  const initiateRemoveCourse = (course: Course) => {
    setTargetCourse(course);
    setConfirmAction("remove");
  };

  const handleConfirmAction = () => {
    if (!selectedStudent || !targetCourse || !confirmAction) return;

    const studentName = selectedStudent.name;
    const courseName = targetCourse.name;

    if (confirmAction === "add") {
      console.log(`API: Add ${targetCourse.id} to ${selectedStudent.id}`);
      setStudentCourses((prev) => [...prev, targetCourse]);
      MOCK_ENROLLMENTS[selectedStudent.id].add(targetCourse.id);
      toast.success("选课成功", {
        description: `已为 ${studentName} 添加课程：${courseName}`,
        position: "top-center",
      });
      setFoundCourseToAdd(null);
      setCourseIdInput("");
    } else {
      console.log(`API: Remove ${targetCourse.id} from ${selectedStudent.id}`);
      setStudentCourses((prev) =>
        prev.filter((c) => c.id !== targetCourse!.id)
      );
      MOCK_ENROLLMENTS[selectedStudent.id].delete(targetCourse.id);
      toast.success("退课成功", {
        description: `已将 ${courseName} 从 ${studentName} 的课表中移除`,
        position: "top-center",
      });
    }
    setConfirmAction(null);
    setTargetCourse(null);
  };

  // --- 4. 列定义 ---
  const studentColumns = useMemo<ColumnDef<Student>[]>(
    () => [
      { accessorKey: "id", header: "学号", id: "学号" },
      { accessorKey: "name", header: "姓名", id: "姓名" },
      { accessorKey: "college", header: "学院", id: "学院" },
      { accessorKey: "major", header: "专业", id: "专业" },
      { accessorKey: "year", header: "年级", id: "年级" },
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
          {/* 使用 grid 布局优化筛选区 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* 文本模糊搜索 - 占据较宽空间 */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索学号或姓名..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="pl-8"
                onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
              />
            </div>

            {/* 学院筛选 - 占据中等空间 */}
            <div className="md:col-span-3">
              <Select value={studentCollege} onValueChange={setStudentCollege}>
                <SelectTrigger>
                  <SelectValue placeholder="所有学院" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有学院</SelectItem>
                  {COLLEGE_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 专业筛选 - 占据中等空间 */}
            <div className="md:col-span-3">
              <Select value={studentMajor} onValueChange={setStudentMajor}>
                <SelectTrigger>
                  <SelectValue placeholder="所有专业" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有专业</SelectItem>
                  {MAJOR_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 搜索按钮 - 占据剩余空间 */}
            <div className="md:col-span-2">
              <Button onClick={handleSearchClick} className="w-full">
                <Search className="mr-2 h-4 w-4" /> 搜索
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主页面：学生列表 */}
      <Card>
        {/* 移除 p-0，使用默认 padding，解决贴边问题 */}
        <CardContent>
          <StudentDataTable
            columns={studentColumns}
            data={displayedStudents}
            loading={loadingStudents}
          />
        </CardContent>
      </Card>

      {/* --- 管理模态框 (Dialog) (保持不变) --- */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-xl">选课管理控制台</DialogTitle>
            <DialogDescription>
              正在操作学生：
              <span className="font-bold text-primary">
                {selectedStudent?.name}
              </span>{" "}
              ({selectedStudent?.id}) | {selectedStudent?.major}
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
                  placeholder="课程ID (如 C001)"
                  value={courseIdInput}
                  onChange={(e) => setCourseIdInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearchCourseById()
                  }
                />
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleSearchCourseById}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* 搜索结果展示区 */}
              {foundCourseToAdd && (
                <Card className="bg-muted/50 border-dashed">
                  <CardContent className="p-4 space-y-2">
                    <div className="font-bold text-sm">
                      {foundCourseToAdd.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>ID: {foundCourseToAdd.id}</p>
                      <p>教师: {foundCourseToAdd.teacher}</p>
                      <p>学分: {foundCourseToAdd.credits}</p>
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
                          <TableCell>{course.credits}</TableCell>
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

      {/* --- 全局确认框 (Alert Dialog) (保持不变) --- */}
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
              此操作将直接修改数据库记录。
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
