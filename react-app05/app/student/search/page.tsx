"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown, Loader2, Filter } from "lucide-react"
import { toast } from "sonner"


import { ColumnDef, PaginationState } from "@tanstack/react-table" 
import { api } from "@/lib/api"
import { ApiResponse, PaginatedResponse, Course, CourseType, CourseYear, College } from "@/types"
import { useAppContext } from "@/components/AppContext"
import { CourseDataTable } from "@/components/app-dashborad/course-table"

// 常量保持不变
const COURSE_TYPE_OPTIONS: { value: CourseType, label: string }[] = [
  { value: 1, label: '通识选修课' },
  { value: 2, label: '专业必修课' },
  { value: 3, label: '专业选修课' },
  { value: 4, label: '通识必修课' },
];

const YEAR_OPTIONS: { value: CourseYear, label: string }[] = [
  { value: 1, label: '大一' },
  { value: 2, label: '大二' },
  { value: 3, label: '大三' },
  { value: 4, label: '大四' },
];

export default function SearchPage() {
  const { state } = useAppContext();
  const user = state.user;

  // --- 1. 状态管理 ---
  
  const [collegeOptions, setCollegeOptions] = useState<{ value: string, label: string }[]>([]);

  // 筛选条件
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedType, setSelectedType] = useState<number | "all">(1);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // [新增] 分页状态管理
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // TanStack Table 从 0 开始
    pageSize: 10, // 默认每页 10 条
  });
  
  // [新增] 总条数状态
  const [rowCount, setRowCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- 2. 初始化数据获取 ---

  const fetchColleges = useCallback(async () => {
    // ... 代码保持不变 ...
    try {
      const res = await api.get<ApiResponse<College[]>>('/colleges');
      if (res.success) {
        const options = res.data.map(c => ({ value: c.id, label: c.name }));
        setCollegeOptions(options);
      }
    } catch (error) {
       // ... 错误处理保持不变 ...
       setCollegeOptions([
        { value: "info", label: "信息工程学院 (Local)" },
        { value: "lang", label: "外国语学院 (Local)" },
        { value: "art", label: "艺术设计学院 (Local)" },
      ]);
    }
  }, []);

  // [核心修改] fetchCourses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // [关键] 使用 pagination 状态构建参数
      // 前端 pageIndex 是 0，后端 page 需要 1
      params.append("page", (pagination.pageIndex + 1).toString());
      params.append("pageSize", pagination.pageSize.toString());
      
      if (searchQuery) params.append("keyword", searchQuery);
      if (selectedCollege !== "all") params.append("collegeId", selectedCollege);
      if (selectedType !== "all") params.append("typeId", selectedType.toString());
      if (selectedYear !== "all") params.append("year", selectedYear.toString());

      const res = await api.get<ApiResponse<PaginatedResponse<Course>>>(`/student/search_courses?${params.toString()}`);
      if (res.success) {
        // 假设后端返回结构是 { data: { records: [], total: 100 } }
        // 请根据实际后端字段调整，这里假设是 data.data (列表) 和 data.total (总数)
        // 如果你的 ApiResponse 定义里 data 是 PaginatedResponse，那么通常列表在 .records 或 .list 里
        
        // 假设 PaginatedResponse 结构为: { records: Course[], total: number }
        // 如果你的后端直接把 List 放在 data 里，那这里要对应改。
        // 根据之前的讨论，通常是：
        const responseData = res.data; 
        
        // 这里做一个兼容性处理，视你 types 定义而定
        if (Array.isArray(responseData)) {
            // 如果后端没分页，直接返回了数组
            setCourses(responseData);
            setRowCount(responseData.length);
        } else {
            // 标准分页结构
            // 注意：检查你的 PaginatedResponse 类型定义，字段名可能是 list, records, rows 等
            setCourses((responseData as any).records || (responseData as any).list || []);
            setRowCount((responseData as any).total || 0);
        }
      }
    } catch (error) {
      console.error("Fetch courses error:", error);
      toast.error("获取课程列表失败");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCollege, selectedType, selectedYear, pagination]); // 依赖 pagination

  const fetchMyCourses = useCallback(async () => {
    // ... 代码保持不变 ...
    try {
      const res = await api.get<ApiResponse<Course[]>>('/student/my_courses');
      if (res.success) {
        const ids = new Set(res.data.map(c => c.id));
        setMyCourseIds(ids);
      }
    } catch (error) {
      console.error("Fetch my courses error:", error);
    }
  }, []);

  // [修改] 初始加载
  useEffect(() => {
    fetchColleges();
    fetchMyCourses();
    // 初始加载一次第一页
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // [新增] 监听翻页事件
  // 当用户点击“下一页”时，pagination 变了，自动触发 fetchCourses
  // 注意：我们需要区分“是用户翻页”还是“用户重置了筛选”
  // 但简单来说，只要 pagination 变了，就应该查新数据（只要 fetchCourses 里的筛选条件也是最新的）
  useEffect(() => {
     // 这里我们利用 useEffect 来响应页码变化
     // 为了避免初始加载时的重复调用（如果上面的 useEffect 已经调了一次），可以加个 ref 判断，或者简单地让它跑
     fetchCourses();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]); // 仅当页码/页大小变化时触发

  // 自动匹配年级逻辑 (保持不变)
  useEffect(() => {
    if (user && user.year) {
        const yearMap: Record<string, number> = { "大一": 1, "大二": 2, "大三": 3, "大四": 4 };
        if (yearMap[user.year]) {
            setSelectedYear(yearMap[user.year] as CourseYear);
        }
    }
  }, [user]);


  // --- 3. 交互处理器 ---
  
  // [关键修改] 点击搜索按钮逻辑
  const handleSearchClick = () => {
    // 逻辑：
    // 1. 如果当前不在第1页，重置回第1页 (这会触发上面的 useEffect[pagination]，从而自动调用 fetchCourses)
    // 2. 如果当前已经在第1页，useEffect 不会触发，需要手动调用 fetchCourses
    
    if (pagination.pageIndex !== 0) {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    } else {
        fetchCourses();
    }
  };

  const handleSelectCourse = async (course: Course) => {
    // ... 保持不变 ...
    setProcessingId(course.id);
    try {
      await api.post<ApiResponse<null>>('/student/enroll', { courseId: course.id });
      toast.success("选课成功", { description: `已选择：${course.name}` });
      setMyCourseIds(prev => new Set(prev).add(course.id));
    } catch (error: any) {
      toast.error("选课失败", { description: error.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdrawCourse = async (course: Course) => {
    // ... 保持不变 ...
    setProcessingId(course.id);
    try {
      await api.post<ApiResponse<null>>('/student/withdraw', { courseId: course.id });
      toast.success("退课成功", { description: `已退选：${course.name}` });
      setMyCourseIds(prev => {
        const next = new Set(prev);
        next.delete(course.id);
        return next;
      });
    } catch (error: any) {
      toast.error("退课失败", { description: error.message });
    } finally {
      setProcessingId(null);
    }
  };

  // --- 4. 列定义 (保持不变) ---
  const columns = useMemo<ColumnDef<Course>[]>(() => [
      // ... 保持不变 ...
      { 
        accessorKey: "name", 
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            课程名称 <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        id: "name" 
      },
      { accessorKey: "teacher", header: "教师", id: "teacher" },
      { accessorKey: "credit", header: "学分", id: "credit" },
       { accessorKey: "subjectName", header: "专业", id: "subjectName" },
        { accessorKey: "collegeName", header: "学院", id: "collegeName" },
      { 
        accessorKey: "type", 
        header: "类型", 
        cell: ({ row }) => {
          const val = row.original.type;
          const option = COURSE_TYPE_OPTIONS.find(o => o.value === val);
          return option ? option.label : val;
        }
      },
      { accessorKey: "time", header: "时间", id: "time" },
      { accessorKey: "place", header: "上课地点", id: "place" },
      { accessorKey: "capactity", 
        header: "容量", 
        cell: ({ row }) => {
        const isFull = row.original.chosenNumber >= row.original.capacity;
        return (
          <span className={isFull ? "font-bold text-destructive" : ""}>
            {row.original.chosenNumber} / {row.original.capacity}
          </span>
        )
      } },
      { 
          id: "actions", 
          header: "操作",
          cell: ({ row }) => {
            const course = row.original;
            const isSelected = myCourseIds.has(course.id);
            const isFull = course.enrolled >= course.capacity;
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
                variant="default"
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
  ], [myCourseIds, processingId]);

  // 辅助函数 (保持不变)
  const getCurrentTypeLabel = () => {
    if (selectedType === 'all') return '所有类型';
    return COURSE_TYPE_OPTIONS.find(o => o.value === selectedType)?.label || selectedType;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>全校课程检索</CardTitle>
          <CardDescription>
            {selectedType === 1 ? 
                "正在展示全校通识选修课，您可以自由选择感兴趣的课程。" : 
                `当前筛选：${selectedCollege === 'all' ? '所有学院' : (collegeOptions.find(c => c.value === selectedCollege)?.label || '指定学院')} - ${getCurrentTypeLabel()}`
            }
          </CardDescription>
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
            {/* 搜索按钮绑定 handleSearchClick */}
            <Button onClick={handleSearchClick} className="md:col-span-1">
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
            
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="所有学院" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有学院 (跨专业)</SelectItem>
                {collegeOptions.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedType.toString()} 
              onValueChange={(val) => setSelectedType(val === 'all' ? 'all' : Number(val))}
            >
              <SelectTrigger><SelectValue placeholder="所有类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                {COURSE_TYPE_OPTIONS.map(c => (
                  <SelectItem key={c.value} value={c.value.toString()}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedYear.toString()} 
              onValueChange={(val) => setSelectedYear(val === 'all' ? 'all' : Number(val))}
            >
              <SelectTrigger><SelectValue placeholder="所有学年" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有学年</SelectItem>
                {YEAR_OPTIONS.map(c => (
                  <SelectItem key={c.value} value={c.value.toString()}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
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
    </div>
  )
}