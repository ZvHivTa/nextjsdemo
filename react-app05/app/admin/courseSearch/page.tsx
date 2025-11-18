"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
// 1. 引入 react-hook-form 和 zod
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
// 2. 引入 Form 组件
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { ArrowUpDown, Search, Edit, Trash2 } from "lucide-react"

// 引入通用表格
import { ColumnDef } from "@tanstack/react-table"
import { CourseDataTable } from "@/components/app-dashborad/course-table"

// --- 类型和模拟数据 ---
type CourseType = '通识课程' | '专业必修课' | '专业选修课' | '共通教育课';
type CourseYear = '大一' | '大二' | '大三' | '大四';

interface Course {
  id: string;
  name: string;
  teacher: string;
  type: CourseType;
  time: string;
  location: string;
  year: CourseYear;
  capacity: number;
  enrolled: number;
  college: string;
  credits: number;
}
// (模拟数据选项)
const COLLEGE_OPTIONS = [
  { value: "info", label: "信息工程学院" },
  { value: "lang", label: "外国语学院" },
  { value: "art", label: "艺术设计学院" },
];
const COURSE_TYPE_OPTIONS: { value: CourseType, label: string }[] = [
  { value: '通识课程', label: '通识课程' },
  { value: '专业必修课', label: '专业必修课' },
  { value: '专业选修课', label: '专业选修课' },
  { value: '共通教育课', label: '共通教育课' },
];
const YEAR_OPTIONS: { value: CourseYear, label: string }[] = [
  { value: '大一', label: '大一' },
  { value: '大二', label: '大二' },
  { value: '大三', label: '大三' },
  { value: '大四', label: '大四' },
];
// (模拟数据库)
const MOCK_ALL_COURSES: Course[] = [
  { id: "C001", name: "高等数学A", teacher: "王教授", type: "专业必修课", time: "周一 3-4节", location: "教A-101", year: "大一", capacity: 100, enrolled: 85, college: "info", credits: 4.0 },
  { id: "C002", name: "大学英语", teacher: "李老师", type: "共通教育课", time: "周二 1-2节", location: "文B-203", year: "大一", capacity: 150, enrolled: 149, college: "lang", credits: 3.0 },
  { id: "C003", name: "数据结构", teacher: "刘博士", type: "专业必修课", time: "周三 5-6节", location: "教A-305", year: "大二", capacity: 80, enrolled: 80, college: "info", credits: 4.0 },
  { id: "C004", name: "日本文化赏析", teacher: "佐藤", type: "通识课程", time: "周四 7-8节", location: "文C-101", year: "大二", capacity: 120, enrolled: 60, college: "lang", credits: 2.0 },
  { id: "C005", name: "设计素描", teacher: "陈老师", type: "专业选修课", time: "周五 1-4节", location: "艺-202", year: "大三", capacity: 40, enrolled: 30, college: "art", credits: 2.0 },
  { id: "C006", name: "计算机网络", teacher: "赵教授", type: "专业必修课", time: "周二 3-4节", location: "教A-101", year: "大三", capacity: 80, enrolled: 75, college: "info", credits: 4.0 },
];

// --- 3. 为编辑表单创建 Zod Schema ---
const courseFormSchema = z.object({
  name: z.string().min(2, { message: "课程名称至少2个字符" }),
  teacher: z.string().min(2, { message: "教师姓名至少2个字符" }),
  time: z.string().min(1, { message: "必须填写上课时间" }),
  location: z.string().min(1, { message: "必须填写上课地点" }),
  // (数字需要转换)
  credits: z.coerce.number().min(0, { message: "学分不能为负" }),
  capacity: z.coerce.number().int().min(1, { message: "容量必须大于0" }),
  // (Select 字段)
  type: z.enum(['通识课程', '专业必修课', '专业选修课', '共通教育课'], {
    required_error: "必须选择课程类型",
  }),
  year: z.enum(['大一', '大二', '大三', '大四'], {
    required_error: "必须选择学年",
  }),
  college: z.string().min(1, { message: "必须选择学院" }),
  // (ID 和 enrolled 通常不由表单修改)
  id: z.string(),
  enrolled: z.number(),
});

export default function AdminCoursesPage() {
  // (筛选状态)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedID, setSelectedID] = useState("all");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // (数据状态)
  const [loading, setLoading] = useState(true);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  
  // (模态框状态)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // --- 4. 初始化编辑表单 ---
  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
  });

  // 侦听: 当模态框打开时，使用 selectedCourse 的数据重置表单
  useEffect(() => {
    if (isEditDialogOpen && selectedCourse) {
      form.reset(selectedCourse);
    }
  }, [isEditDialogOpen, selectedCourse, form]);

 // --- (runSearch 模拟 API - 保持不变) ---
  const runSearch = (
    currentQuery: string,
    currentID:string,
    currentCollege: string,
    currentType: string,
    currentYear: string
  ) => {
    setLoading(true);
    console.log("🚀 正在模拟 API 调用, 筛选条件:", {
      query: currentQuery, college: currentCollege, type: currentType, year: currentYear
    });

    new Promise(res => setTimeout(res, 500)).then(() => {
      // (模拟后端筛选逻辑)
      let courses = MOCK_ALL_COURSES;
      
      if (currentQuery) {
        const lowerQuery = currentQuery.toLowerCase();
        courses = courses.filter(course =>
          course.name.toLowerCase().includes(lowerQuery) ||
          course.teacher.toLowerCase().includes(lowerQuery)||
          course.id.includes(currentQuery)
        );
      }
      if (currentID !== "all") {
        courses = courses.filter(course => course.id === currentID);
      }
      if (currentCollege !== "all") {
        courses = courses.filter(course => course.college === currentCollege);
      }
      if (currentType !== "all") {
        courses = courses.filter(course => course.type === currentType);
      }
      if (currentYear !== "all") {
        courses = courses.filter(course => course.year === currentYear);
      }

      setDisplayedCourses(courses);
      setLoading(false);
    });
  };

  const handleSearchClick = () => {
    runSearch(searchQuery, selectedID ,selectedCollege, selectedType, selectedYear);
  };

  useEffect(() => {
    runSearch("", "all","all", "all", "all");
  }, []);

  // --- 6. 增删改处理器 (更新 handleSaveEdit) ---

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  // (B) 保存编辑 (使用 react-hook-form)
  const onEditSubmit = (values: z.infer<typeof courseFormSchema>) => {
    console.log("API调用: 更新课程:", values);
    
    // 模拟更新本地数据
    setDisplayedCourses(prev => 
      prev.map(c => 
        c.id === values.id ? values : c
      )
    );
    
    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCourse) return;
    console.log(`API调用: 删除课程 ${selectedCourse.id} - ${selectedCourse.name}`);
    setDisplayedCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
    setIsAlertOpen(false);
  };

  // --- 7. 定义列 (保持不变) ---
  const columns = useMemo<ColumnDef<Course>[]>(() => [
    { accessorKey: "id", header: "课程id", id: "课程id" },
    { accessorKey: "name", header: "课程名称", id: "课程名称" },
    { accessorKey: "teacher", header: "教师", id: "教师" },
    { accessorKey: "credits", header: "学分", id: "学分" },
    { accessorKey: "type", header: "类型", id: "类型" },
    {
      accessorKey: "time",
      header: "时间 / 地点",
      id: "时间地点",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.time}</div>
          <div className="text-muted-foreground">{row.original.location}</div>
        </div>
      )
    },
    {
      accessorKey: "enrolled",
      header: "容量",
      id: "容量",
      cell: ({ row }) => `${row.original.enrolled} / ${row.original.capacity}`
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEditClick(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(row.original)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
    }
  ], []); 

  // --- 8. 渲染页面 (更新 Dialog) ---
  return (
    <div className="space-y-4">
      {/* --- 筛选器 (保持不变) --- */}
      <Card>
        <CardHeader>
          <CardTitle>课程库管理</CardTitle>
          <CardDescription>查找、编辑或删除系统中的所有课程。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索课程名或教师..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              />
            </div>
            <Button onClick={handleSearchClick} className="md:col-span-1">
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger><SelectValue placeholder="所有学院" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有学院</SelectItem>
                {COLLEGE_OPTIONS.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger><SelectValue placeholder="所有类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                {COURSE_TYPE_OPTIONS.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger><SelectValue placeholder="所有学年" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有学年</SelectItem>
                {YEAR_OPTIONS.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* --- 课程表格 (保持不变) --- */}
      <Card>
        <CardHeader>
          <CardTitle>课程列表</CardTitle>
          <CardDescription>
            {loading ? "正在加载课程..." : `共找到 ${displayedCourses.length} 门符合条件的课程`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseDataTable 
            columns={columns} 
            data={displayedCourses} 
            loading={loading} 
          />
        </CardContent>
      </Card>

      {/* --- 模态框 (A. 编辑课程 - 已重构) --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑课程: {selectedCourse?.name}</DialogTitle>
            <DialogDescription>
              修改课程信息。ID 和已选人数不可修改。
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="grid gap-4 py-4">
              {/* 将表单字段放在 grid 中 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>课程id</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>课程名称</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>教师</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>上课时间</FormLabel>
                      <FormControl><Input placeholder="例如: 周一 3-4节" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>上课地点</FormLabel>
                      <FormControl><Input placeholder="例如: 教A-101" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>学分</FormLabel>
                      <FormControl><Input type="number" step="0.5" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>课程容量</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>开设学院</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {COLLEGE_OPTIONS.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>课程类型</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {COURSE_TYPE_OPTIONS.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>开设学年</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {YEAR_OPTIONS.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit">保存更改</Button>
              </DialogFooter>
            </form>
          </Form>

        </DialogContent>
      </Dialog>

      {/* --- 模态框 (B. 删除确认 - 保持不变) --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>您确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              您即将删除课程：<span className="font-bold">{selectedCourse?.name}</span>。
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}