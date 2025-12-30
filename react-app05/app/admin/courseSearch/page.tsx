"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ArrowUpDown, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { ColumnDef, PaginationState } from "@tanstack/react-table"
import { CourseDataTable } from "@/components/app-dashborad/course-table"
// 确保引用正确的类型定义
import { Course, ApiResponse, PaginatedResponse, CourseType, CourseYear, College } from "@/types"
import { api } from "@/lib/api"

// --- 1. 选项常量 (与后端枚举对应) ---
const COLLEGE_OPTIONS = [
  { value: "info", label: "信息工程学院" },
  { value: "lang", label: "外国语学院" },
  { value: "art", label: "艺术设计学院" },
];

const COURSE_TYPE_OPTIONS = [
  { value: '1', label: '通识选修课' },
  { value: '2', label: '专业必修课' },
  { value: '3', label: '专业选修课' },
  { value: '4', label: '通识必修课' },
];

const YEAR_OPTIONS = [
  { value: '1', label: '大一' },
  { value: '2', label: '大二' },
  { value: '3', label: '大三' },
  { value: '4', label: '大四' },
];

// --- 2. Zod Schema ---
const courseFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "课程名称至少2个字符" }),
  teacher: z.string().min(2, { message: "教师姓名至少2个字符" }),
  time: z.string().min(1, { message: "必须填写上课时间" }),
  place: z.string().min(1, { message: "必须填写上课地点" }), 
  
  // 数字转换
  credit: z.coerce.number().min(0.5, { message: "学分至少0.5" }),
  capacity: z.coerce.number().int().min(1, { message: "容量必须大于0" }),
  
  // 类型和学年
  type: z.string({ required_error: "必须选择课程类型" }),
  year: z.string({ required_error: "必须选择学年" }),
  collegeId: z.string({ required_error: "必须选择学院" }), 

  subjectName: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function AdminCoursesPage() {
  // --- 状态管理 ---
  const [collegeOptions, setCollegeOptions] = useState<{ value: string, label: string }[]>([]);
  
  // 1. UI 筛选状态 (仅绑定到输入控件，变化时不触发查询)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // 2. 这里的 activeFilters 才是真正用于查询的状态
  // 只有点击“搜索”按钮时才会更新它
  const [activeFilters, setActiveFilters] = useState({
    keyword: "",
    collegeId: "all",
    typeId: "all",
    year: "all"
  });

  // 数据列表与分页
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // 模态框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false); // 仅用于编辑
  const [isAlertOpen, setIsAlertOpen] = useState(false);   // 删除确认
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交loading

  // --- 表单初始化 ---
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "", 
      teacher: "", 
      time: "", 
      place: "", 
      credit: 0, 
      capacity: 50, 
      subjectName: "",
    },
  });

  // --- 数据获取 ---

  // 获取学院列表 (只在组件挂载时调用)
  const fetchColleges = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<College[]>>('/colleges');
      if (res.success) {
        const options = res.data.map(c => ({ value: c.id, label: c.name }));
        setCollegeOptions(options);
      }
    } catch (error) {
       console.error("Fetch colleges failed:", error);
       setCollegeOptions([
        { value: "info", label: "信息工程学院 (Local)" },
        { value: "lang", label: "外国语学院 (Local)" },
        { value: "art", label: "艺术设计学院 (Local)" },
      ]);
    }
  }, []);

  // 初始加载学院
  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // 获取课程列表
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", (pagination.pageIndex + 1).toString());
      params.append("pageSize", pagination.pageSize.toString());
      
      // 使用 activeFilters 进行查询
      if (activeFilters.keyword) params.append("keyword", activeFilters.keyword);
      if (activeFilters.collegeId !== "all") params.append("collegeId", activeFilters.collegeId);
      if (activeFilters.typeId !== "all") params.append("typeId", activeFilters.typeId);
      if (activeFilters.year !== "all") params.append("year", activeFilters.year);

      const res = await api.get<ApiResponse<PaginatedResponse<Course>>>(`/admin/course/search?${params.toString()}`);
      
      if (res.success) {
        const data = res.data as any;
        const list = data.records || data.list || [];
        const total = data.total || 0;
        setCourses(list);
        setRowCount(total);
      }
    } catch (error) {
      console.error("Fetch courses failed", error);
      toast.error("加载课程列表失败");
    } finally {
      setLoading(false);
    }
  }, [pagination, activeFilters]); // 依赖 activeFilters 而不是 selected*

  // 监听 activeFilters 或 pagination 变化自动刷新
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // --- 处理器 ---

  // 点击搜索按钮处理函数
  const handleSearchClick = () => {
    // 1. 将 UI 状态同步到 Active 状态，这将触发 fetchCourses 更新和 useEffect
    setActiveFilters({
        keyword: searchQuery,
        collegeId: selectedCollege,
        typeId: selectedType,
        year: selectedYear
    });

    // 2. 如果不在第一页，重置回第一页 (这也会触发 useEffect)
    // 如果已经在第一页，上面的 setActiveFilters 变化已经足够触发刷新
    if (pagination.pageIndex !== 0) {
        setPagination(p => ({ ...p, pageIndex: 0 }));
    }
  };

  // 1. 打开编辑窗口
  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    // 填充表单
    form.reset({
      id: course.id.toString(),
      name: course.name,
      teacher: course.teacher,
      time: course.time,
      place: course.place,
      credit: course.credit,
      capacity: course.capacity,
      type: course.type.toString(), 
      year:"",
      collegeId: course.collegeId ? course.collegeId.toString() : "",
      subjectName: course.subjectName,
    });
    setIsDialogOpen(true);
  };

  // 2. 提交表单 (仅更新)
  const onSubmit = async (values: CourseFormValues) => {
    if (!selectedCourse) return;

    setIsSubmitting(true);
    try {
      // 构造提交给后端的数据
      const payload = {
        ...values,
        type: Number(values.type),
        year: Number(values.year),
        id: selectedCourse.id, 
      };

      // 更新模式
      await api.put('/admin/course/update', payload);
      toast.success("课程更新成功");

      setIsDialogOpen(false);
      fetchCourses(); // 刷新列表
    } catch (error: any) {
      toast.error("更新失败", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. 删除
  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;
    try {
      await api.delete(`/admin/course/remove?id=${selectedCourse.id}`);
      toast.success("删除成功");
      fetchCourses();
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setIsAlertOpen(false);
    }
  };

  // --- 列定义 ---
  const columns = useMemo<ColumnDef<Course>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { 
        accessorKey: "name", 
        header: "课程名称",
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
    },
    { accessorKey: "teacher", header: "教师" },
    { accessorKey: "credit", header: "学分" },
    { 
        accessorKey: "type", 
        header: "类型",
        cell: ({ row }) => {
            const t = COURSE_TYPE_OPTIONS.find(o => o.value === row.original.type.toString());
            return t ? t.label : row.original.type;
        }
    },
    {
      accessorKey: "time",
      header: "时间 / 地点",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.time}</div>
          <div className="text-muted-foreground">{row.original.place}</div>
        </div>
      )
    },
    {
      accessorKey: "capacity",
      header: "选课情况",
      cell: ({ row }) => {
        const enrolled = row.original.chosenNumber || 0;
        return (
            <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min((enrolled / row.original.capacity) * 100, 100)}%` }}
                    />
                </div>
                <span className="text-xs text-muted-foreground">{enrolled}/{row.original.capacity}</span>
            </div>
        )
      }
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditClick(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(row.original)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
    }
  ], []); 

  return (
    <div className="space-y-4">
      {/* --- 筛选栏 --- */}
      <Card>
        <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>课程库管理</CardTitle>
                    <CardDescription>查找、编辑或删除系统中的所有课程。</CardDescription>
                </div>
                {/* 移除了新增按钮 */}
            </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* 第一行：搜索框 + 搜索按钮 */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索课程名或教师..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                />
              </div>
              <Button onClick={handleSearchClick}>
                <Search className="mr-2 h-4 w-4" />
                搜索
              </Button>
            </div>
            
            {/* 第二行：三个筛选下拉框 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger><SelectValue placeholder="所有学院" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有学院</SelectItem>
                  {collegeOptions.map(c => (
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
          </div>
        </CardContent>
      </Card>

      {/* --- 表格 --- */}
      <Card>
        <CardContent>
          <CourseDataTable 
            columns={columns} 
            data={courses} 
            loading={loading}
            
            rowCount={rowCount}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </CardContent>
      </Card>

      {/* --- 编辑 弹窗 --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑课程</DialogTitle>
            <DialogDescription>
              ID: {selectedCourse?.id}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  name="place"
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
                  name="credit"
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
                  name="collegeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>开设学院</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="选择学院" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {collegeOptions.map(c => (
                            <SelectItem key={c.value} value={c.value.toString()}>{c.label}</SelectItem>
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
                        <FormControl><SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger></FormControl>
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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  保存更改
                </Button>
              </DialogFooter>
            </form>
          </Form>

        </DialogContent>
      </Dialog>

      {/* --- 删除确认 --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>您确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              您即将删除课程：<span className="font-bold text-foreground">{selectedCourse?.name}</span>。<br/>
              此操作将同时删除所有学生的选课记录，且<span className="text-destructive font-bold">不可撤销</span>。
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