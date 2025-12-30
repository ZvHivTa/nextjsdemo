"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, BookCheck, Loader2, MapPin, Clock } from "lucide-react"
import { toast } from "sonner"

import { ColumnDef, PaginationState } from "@tanstack/react-table"
import { CourseDataTable } from "@/components/app-dashborad/course-table"
import { Course, ApiResponse, CourseType } from "@/types" // 确保引用正确的类型
import { api } from "@/lib/api"

// 复用常量 (建议提取到单独的 constants 文件，这里先复制一份)
const COURSE_TYPE_OPTIONS: { value: CourseType, label: string }[] = [
  { value: 1, label: '通识选修课' },
  { value: 2, label: '专业必修课' },
  { value: 3, label: '专业选修课' },
  { value: 4, label: '通识必修课' },
];

export default function SelectedPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // [新增] 本地分页状态 (为了适配 CourseDataTable 组件)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // [新增] 前端切片逻辑
  // 虽然我们一次性拿到了所有已选课程，但为了复用那个 Table 组件，我们在这里手动切一下数据
  const currentPageData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return courses.slice(start, end);
  }, [courses, pagination]);

  // 获取已选课程
  const fetchMyCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Course[]>>('/student/my_courses');
      if (res.success) {
        setCourses(res.data);
      }
    } catch (error) {
      console.error("Fetch my courses failed", error);
      toast.error("获取已选课程失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  // 计算总学分 (注意字段名修正为 credit)
  const totalCredits = useMemo(() => {
    return courses.reduce((acc, curr) => acc + (curr.credit || 0), 0);
  }, [courses]);

  // 退选处理器
  const handleWithdrawCourse = useCallback(async (course: Course) => {
    // 使用 sonner 的 promise 模式或标准 try-catch
    setProcessingId(course.id);
    try {
        await api.post<ApiResponse<null>>('/student/withdraw', { courseId: course.id });
        toast.success("退选成功", { description: `已退选《${course.name}》` });
        
        // 乐观更新：直接从列表中移除，不用重新请求接口，体验更好
        setCourses(prev => prev.filter(c => c.id !== course.id));
    } catch (error: any) {
        toast.error("退选失败", { description: error.message || "请稍后重试" });
    } finally {
        setProcessingId(null);
    }
  }, []);

  // 定义列
  const columns = useMemo<ColumnDef<Course>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          课程名称 <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      id: "name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
    },
    {
      accessorKey: "teacher",
      header: "教师",
    },
    {
      accessorKey: "credit", // [修正] 字段名
      header: "学分",
    },
    {
      accessorKey: "type",
      header: "类型",
      cell: ({ row }) => {
        const val = row.original.type;
        const option = COURSE_TYPE_OPTIONS.find(o => o.value === Number(val));
        return option ? option.label : val;
      }
    },
    {
      accessorKey: "time",
      header: "时间 / 地点",
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {row.original.time}
          </div>
          <div className="flex items-center">
            <MapPin className="mr-1 h-3 w-3" />
            {/* [修正] 字段名 location -> place */}
            {row.original.place} 
          </div>
        </div>
      )
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
         const isProcessing = processingId === row.original.id;
         return (
            <Button 
                variant="destructive" 
                size="sm" 
                disabled={isProcessing}
                onClick={() => handleWithdrawCourse(row.original)}
            >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                退选
            </Button>
         )
      }
    }
  ], [handleWithdrawCourse, processingId]);

  return (
    <div className="space-y-4">
        {/* 顶部概览卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">已选课程数</CardTitle>
                <BookCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本学期总学分</CardTitle>
                <BookCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{totalCredits.toFixed(1)}</div>
                </CardContent>
            </Card>
        </div>

        {/* 课程列表 */}
        <Card>
        <CardHeader>
            <CardTitle>我的课程表</CardTitle>
            <CardDescription>
            您当前学期已选择的所有课程。
            </CardDescription>
        </CardHeader>
        <CardContent>
            {/* [关键复用] 
               这里我们复用之前的 CourseDataTable
               虽然它是为服务端分页设计的，但我们把 rowCount 设为总长度，
               data 设为当前页切片数据，就能完美适配了。
            */}
            <CourseDataTable 
                columns={columns} 
                data={currentPageData} 
                loading={loading}
                
                rowCount={courses.length}
                pagination={pagination}
                onPaginationChange={setPagination}
            />
        </CardContent>
        </Card>
    </div>
  )
}