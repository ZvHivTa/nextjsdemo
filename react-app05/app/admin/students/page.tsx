"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
// ... (所有 UI imports 保持不变)
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpDown, Search, UserCheck, ChevronsUpDown, Check } from "lucide-react"

// 1. 引入 *新* 的 StudentDataTable

import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils" 
import { StudentDataTable } from "@/components/app-dashborad/student-table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

// --- (类型定义 保持不变) ---
interface Student {
// ...
  id: string;
  name: string;
  college: string;
  major: string;
  year: '大一' | '大二' | '大三' | '大四';
}
interface Course {
// ...
  id: string;
  name: string;
  teacher: string;
  credits: number;
}

// --- (模拟数据库 保持不变) ---
const MOCK_ALL_STUDENTS: Student[] = [
// ...
  { id: "20210001", name: "张三", college: "信息工程学院", major: "计算机科学", year: "大三" },
  { id: "20210002", name: "李四", college: "信息工程学院", major: "软件工程", year: "大三" },
  { id: "20220001", name: "王五", college: "外国语学院", major: "英语", year: "大二" },
  { id: "20230001", name: "赵六", college: "艺术设计学院", major: "视觉传达", year: "大一" },
];
const MOCK_ALL_COURSES: Course[] = [
// ...
  { id: "C001", name: "高等数学A", teacher: "王教授", credits: 4.0 },
  { id: "C003", name: "数据结构", teacher: "刘博士", credits: 4.0 },
  { id: "C006", name: "计算机网络", teacher: "赵教授", credits: 4.0 },
  { id: "C002", name: "大学英语", teacher: "李老师", credits: 3.0 },
  { id: "C005", name: "设计素描", teacher: "陈老师", credits: 2.0 },
];
const MOCK_ENROLLMENTS: Record<string, Set<string>> = {
// ...
  "20210001": new Set(["C003", "C006"]),
  "20210002": new Set(["C003"]),
  "20220001": new Set(["C002"]),
  "20230001": new Set([]),
};
const COLLEGE_OPTIONS = [
// ...
  { value: "info", label: "信息工程学院" },
  { value: "lang", label: "外国语学院" },
  { value: "art", label: "艺术设计学院" },
];

export default function AdminStudentsPage() {
  // --- (状态管理 保持不变) ---
  const [loadingStudents, setLoadingStudents] = useState(true);
// ...
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentCollege, setStudentCollege] = useState("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const [selectedStudentCourses, setSelectedStudentCourses] = useState<Course[]>([]);
  const [isCoursePopoverOpen, setIsCoursePopoverOpen] = useState(false);
  const [addCourseQuery, setAddCourseQuery] = useState("");

  // --- (API 和 处理器 保持不变) ---
  const runStudentSearch = (query: string, college: string) => {
// ...
    setLoadingStudents(true);
    console.log("🚀 模拟 API: 搜索学生...", { query, college });
    
    new Promise(res => setTimeout(res, 500)).then(() => {
      let students = MOCK_ALL_STUDENTS;
      if (query) {
        const lowerQuery = query.toLowerCase();
        students = students.filter(s => 
          s.name.toLowerCase().includes(lowerQuery) || 
          s.id.includes(lowerQuery)
        );
      }
      if (college !== "all") {
        // ...
      }
      setDisplayedStudents(students);
      setLoadingStudents(false);
    });
  };

  useEffect(() => {
// ...
    runStudentSearch("", "all");
  }, []);

  useEffect(() => {
// ...
    if (selectedStudent) {
      setIsSheetLoading(true);
      console.log(`🚀 模拟 API: 获取 ${selectedStudent.name} 的课程...`);
      
      new Promise(res => setTimeout(res, 400)).then(() => {
        const enrolledIds = MOCK_ENROLLMENTS[selectedStudent.id] || new Set();
        const courses = MOCK_ALL_COURSES.filter(c => enrolledIds.has(c.id));
        setSelectedStudentCourses(courses);
        setIsSheetLoading(false);
      });
    }
  }, [selectedStudent]);

  const handleAdminSelect = (course: Course) => {
// ...
    if (!selectedStudent) return;
    if (selectedStudentCourses.find(c => c.id === course.id)) {
      alert("该学生已选此课程");
      return;
    }
    console.log(`🚀 模拟 API: (Admin) 为 ${selectedStudent.name} 添加 ${course.name}`);
    setSelectedStudentCourses(prev => [...prev, course]);
    MOCK_ENROLLMENTS[selectedStudent.id].add(course.id);
  };

  const handleAdminDeselect = (course: Course) => {
// ...
    if (!selectedStudent) return;
    console.log(`🚀 模拟 API: (Admin) 为 ${selectedStudent.name} 退选 ${course.name}`);
    setSelectedStudentCourses(prev => prev.filter(c => c.id !== course.id));
    MOCK_ENROLLMENTS[selectedStudent.id].delete(course.id);
  };

  // --- (学生列表列定义 保持不变) ---
  const studentColumns = useMemo<ColumnDef<Student>[]>(() => [
// ...
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
          variant="default" 
          size="sm" 
          onClick={() => {
            setSelectedStudent(row.original);
            setIsSheetOpen(true);
          }}
        >
          <UserCheck className="mr-2 h-4 w-4" /> 管理选课
        </Button>
      )
    }
  ], []);

  // --- 7. 渲染页面 ---
  return (
    <div className="space-y-4">
      
      {/* --- 学生筛选卡 (保持不变) --- */}
      <Card>

        <CardHeader>
          <CardTitle>学生管理</CardTitle>
          <CardDescription>查找学生并管理他们的选课情况。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索学号或姓名..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={studentCollege} onValueChange={setStudentCollege}>
              <SelectTrigger><SelectValue placeholder="所有学院" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有学院</SelectItem>
                {COLLEGE_OPTIONS.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => runStudentSearch(studentSearchQuery, studentCollege)}>
              <Search className="mr-2 h-4 w-4" />
              搜索学生
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- 学生列表表格 --- */}
      <Card>
        <CardHeader>
          <CardTitle>学生列表</CardTitle>
          <CardDescription>
            {loadingStudents ? "正在加载..." : `共找到 ${displayedStudents.length} 名学生`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 2. 使用 *新* 的 StudentDataTable */}
          <StudentDataTable 
            columns={studentColumns} 
            data={displayedStudents} 
            loading={loadingStudents} 
          />
        </CardContent>
      </Card>

      {/* --- 侧边抽屉 (Sheet) (保持不变) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>管理学生选课</SheetTitle>
            <SheetDescription>
              正在为 <span className="font-bold">{selectedStudent?.name} ({selectedStudent?.id})</span> 操作。
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4 space-y-6">
            
            {/* 模块一: 添加课程 (保持不变) */}
            <Card>

              <CardHeader>
                <CardTitle>添加课程</CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={isCoursePopoverOpen} onOpenChange={setIsCoursePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {addCourseQuery || "搜索全校课程..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="按课程名搜索..." />
                      <CommandEmpty>未找到课程。</CommandEmpty>
                      <CommandList>
                        <ScrollArea className="h-48">
                          {MOCK_ALL_COURSES.map((course) => (
                            <CommandItem
                              key={course.id}
                              value={course.name}
                              onSelect={() => {
                                handleAdminSelect(course);
                                setIsCoursePopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedStudentCourses.find(c => c.id === course.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div>
                                <p>{course.name} <span className="text-xs text-muted-foreground">({course.id})</span></p>
                                <p className="text-xs text-muted-foreground">{course.teacher}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* 模块二: 已选课程列表 (保持不变) */}
            <Card>
              <CardHeader>
                <CardTitle>已选课程</CardTitle>
                <CardDescription>
                  {isSheetLoading ? "正在加载..." : `该学生已选 ${selectedStudentCourses.length} 门课程`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSheetLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>课程</TableHead>
                        <TableHead>教师</TableHead>
                        <TableHead>学分</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudentCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            该学生暂未选课。
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedStudentCourses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.name}</TableCell>
                            <TableCell>{course.teacher}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleAdminDeselect(course)}
                              >
                                退课
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}