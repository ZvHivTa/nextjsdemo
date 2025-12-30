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
import { ArrowUpDown, Sparkles, Loader2, MapPin, Clock } from "lucide-react"
import { toast } from "sonner"

import { ColumnDef, PaginationState } from "@tanstack/react-table"
import { CourseDataTable } from "@/components/app-dashborad/course-table"
import { Course, ApiResponse, CourseType } from "@/types"
import { api } from "@/lib/api"

// 复用常量
const COURSE_TYPE_OPTIONS: { value: CourseType, label: string }[] = [
  { value: 1, label: '通识选修课' },
  { value: 2, label: '专业必修课' },
  { value: 3, label: '专业选修课' },
  { value: 4, label: '通识必修课' },
];

export default function RecommendPage() {
  // --- 状态管理 ---
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<string | null>(null);

  // [新增] 本地分页状态 (为了适配 CourseDataTable 组件)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // [新增] 前端切片逻辑
  const currentPageData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return courses.slice(start, end);
  }, [courses, pagination]);

  // --- 定义数据获取函数 ---

  // 1. 获取推荐课程列表
  const fetchRecommendCourses = useCallback(async () => {
    try {
      // 保持和你之前逻辑一致，使用 recommend_courses
      const res = await api.get<ApiResponse<Course[]>>('/student/recommend');
      if (res.success) {
        setCourses(res.data);
      }
    } catch (error) {
      console.error("Fetch recommend courses failed:", error);
      toast.error("获取推荐课程失败");
    }
  }, []);

  // 2. 获取我已选的课程
  const fetchMyCourses = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Course[]>>('/student/my_courses');
      if (res.success) {
        const ids = new Set(res.data.map(c => c.id));
        setMyCourseIds(ids);
      }
    } catch (error) {
      console.error("Fetch my courses failed:", error);
    }
  }, []);

  // 3. 组合刷新：同时刷新列表（更新容量）和状态（更新按钮）
  const refreshAllData = useCallback(async () => {
    await Promise.all([fetchRecommendCourses(), fetchMyCourses()]);
  }, [fetchRecommendCourses, fetchMyCourses]);


  // --- 初始化 ---
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await refreshAllData();
      setLoading(false);
    };
    initData();
  }, [refreshAllData]);


  // --- 操作逻辑 ---
  
  // 选课
  const handleSelectCourse = useCallback(async (course: Course) => {
    setProcessingId(course.id);
    try {
      // 保留你要求的接口: /student/select
      await api.post<ApiResponse<null>>('/student/select', { courseId: course.id });
      toast.success("选课成功", { description: `已选择：${course.name}` });
      
      // 【关键】操作成功后，重新拉取所有数据，确保界面是最新的（包括人数变化）
      await refreshAllData();
      
    } catch (error: any) {
      toast.error("选课失败", { description: error.message });
    } finally {
      setProcessingId(null);
    }
  }, [refreshAllData]);

  // 退选
  const handleWithdrawCourse = useCallback(async (course: Course) => {
    setProcessingId(course.id);
    try {
      await api.post<ApiResponse<null>>('/student/withdraw', { courseId: course.id });
      toast.success("退选成功", { description: `已退选：${course.name}` });

      // 【关键】操作成功后，重新拉取所有数据
      await refreshAllData();

    } catch (error: any) {
      toast.error("退选失败", { description: error.message });
    } finally {
      setProcessingId(null);
    }
  }, [refreshAllData]);

  // --- 列定义 (保持不变) ---
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
    { accessorKey: "teacher", header: "教师" },
    { accessorKey: "credit", header: "学分" }, 
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
            {row.original.place} 
          </div>
        </div>
      )
    },
    {
      accessorKey: "capacity", 
      header: "容量",
      cell: ({ row }) => {
        const current = row.original.chosenNumber || 0;
        const cap = row.original.capacity;
        const isFull = current >= cap;
        return (
          <span className={isFull ? "font-bold text-destructive" : ""}>
            {current} / {cap}
          </span>
        )
      }
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const course = row.original;
        const isSelected = myCourseIds.has(course.id);
        const isFull = (course.chosenNumber || 0) >= course.capacity;
        const isProcessing = processingId === course.id;
        
        if (isSelected) {
          return (
            <Button 
                variant="outline" 
                size="sm" 
                disabled={isProcessing}
                onClick={() => handleWithdrawCourse(course)}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              退选
            </Button>
          );
        }

        return (
          <Button 
            size="sm" 
            disabled={isFull || isProcessing} 
            onClick={() => handleSelectCourse(course)}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isFull ? "已满" : "选课"}
          </Button>
        );
      }
    }
  ], [myCourseIds, handleSelectCourse, handleWithdrawCourse, processingId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" /> 
          本专业推荐课程
        </CardTitle>
        <CardDescription>
          以下是根据您的年级和专业生成的本学期可选课程方案。
        </CardDescription>
      </CardHeader>
      <CardContent>
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
  )
}