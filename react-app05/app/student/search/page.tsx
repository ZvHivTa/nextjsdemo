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
import { Search, ArrowUpDown } from "lucide-react"

import { CourseDataTable } from "@/components/app-dashborad/student-search-course-table"
import { ColumnDef } from "@tanstack/react-table"

// --- (数据类型定义 - 保持不变) ---
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
}

// --- (模拟数据 - MOCK_ALL_COURSES 现在模拟 *数据库中的所有数据*) ---
const COLLEGE_OPTIONS = [
  { value: "info", label: "信息工程学院" },
  { value: "lang", label: "外国语学院" },
  { value: "art", label: "艺术设计学院" },
];
// ... (其他 MOCK 选项不变) ...
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
const MOCK_ALL_COURSES: Course[] = [
  { id: "C001", name: "高等数学A", teacher: "王教授", type: "专业必修课", time: "周一 3-4节", location: "教A-101", year: "大一", capacity: 100, enrolled: 85, college: "info" },
  { id: "C002", name: "大学英语", teacher: "李老师", type: "共通教育课", time: "周二 1-2节", location: "文B-203", year: "大一", capacity: 150, enrolled: 149, college: "lang" },
  { id: "C003", name: "数据结构", teacher: "刘博士", type: "专业必修课", time: "周三 5-6节", location: "教A-305", year: "大二", capacity: 80, enrolled: 80, college: "info" },
  { id: "C004", name: "日本文化赏析", teacher: "佐藤", type: "通识课程", time: "周四 7-8节", location: "文C-101", year: "大二", capacity: 120, enrolled: 60, college: "lang" },
  { id: "C005", name: "设计素描", teacher: "陈老师", type: "专业选修课", time: "周五 1-4节", location: "艺-202", year: "大三", capacity: 40, enrolled: 30, college: "art" },
  { id: "C006", name: "计算机网络", teacher: "赵教授", type: "专业必修课", time: "周二 3-4节", location: "教A-101", year: "大三", capacity: 80, enrolled: 75, college: "info" },
];
const MOCK_MY_COURSE_IDS = new Set<string>(['C003', 'C005']);


export default function SearchPage() {
  // --- 筛选器状态 (保持不变) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // --- 数据状态 (修改) ---
  const [loading, setLoading] = useState(true);
  // 【修改点 1】: 不再需要 `allCourses` 状态，
  // 而是用 `displayedCourses` 来保存 *API 返回的结果*
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<Set<string>>(new Set());

  // 【修改点 2】: 移除 `useMemo` 客户端筛选
  // const filteredCourses = useMemo(...) <-- 这一整块被删除了

  // 【修改点 3】: 创建一个模拟 API 调用的函数
  const runSearch = (
    currentQuery: string,
    currentCollege: string,
    currentType: string,
    currentYear: string
  ) => {
    setLoading(true);
    console.log("🚀 正在模拟 API 调用, 筛选条件:", {
      query: currentQuery, college: currentCollege, type: currentType, year: currentYear
    });

    // 模拟 500ms 网络延迟
    new Promise(res => setTimeout(res, 500)).then(() => {
      // --- (这部分逻辑 *假装* 在后端数据库中执行) ---
      let courses = MOCK_ALL_COURSES;
      
      // 1. 后端模糊查询 (LIKE '%...%')
      if (currentQuery) {
        const lowerQuery = currentQuery.toLowerCase();
        courses = courses.filter(course =>
          course.name.toLowerCase().includes(lowerQuery) ||
          course.teacher.toLowerCase().includes(lowerQuery)
        );
      }
      // 2. 后端学院筛选 (WHERE college = '...')
      if (currentCollege !== "all") {
        courses = courses.filter(course => course.college === currentCollege);
      }
      // 3. 后端类型筛选
      if (currentType !== "all") {
        courses = courses.filter(course => course.type === currentType);
      }
      // 4. 后端学年筛选
      if (currentYear !== "all") {
        courses = courses.filter(course => course.year === currentYear);
      }
      // --- (后端模拟结束) ---

      // 将 *查询结果* 设置为要显示的课程
      setDisplayedCourses(courses);
      setLoading(false);
    });
  };

  // 【修改点 4】: 定义按钮点击处理器
  const handleSearchClick = () => {
    // 读取 *当前* 所有筛选框的状态，然后发起 API 请求
    runSearch(searchQuery, selectedCollege, selectedType, selectedYear);
  };

  // 【修改点 5】: 修改 useEffect，在页面加载时获取初始数据
  useEffect(() => {
    // 模拟 API 调用 (例如获取 "我的课程" 列表)
    setMyCourseIds(MOCK_MY_COURSE_IDS);
    
    // 页面加载时，用 *空条件* 搜索一次，以显示初始列表
    // (在真实分页中，这里会请求 page=1)
    runSearch("", "all", "all", "all");
    
  }, []); // 空依赖数组，只在挂载时运行一次


  // --- (选课处理器 - 保持不变) ---
  const handleSelectCourse = useCallback((course: Course) => {
    console.log(`正在尝试选择课程: ${course.name} (ID: ${course.id})`);
    // ... (选课 API 逻辑) ...
  }, []);

  // --- (列定义 - 保持不变) ---
  // 它现在依赖 `myCourseIds`，这是正确的
  const columns = useMemo<ColumnDef<Course>[]>(() => [
    // ... (所有列定义和之前一样) ...
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          课程名称
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      id: "课程名称",
    },
    {
      accessorKey: "teacher",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          教师
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      id: "教师",
    },
    {
      accessorKey: "type",
      header: "课程类型",
      id: "课程类型",
    },
    {
      accessorKey: "time",
      header: "时间 / 地点",
      id: "时间地点",
      cell: ({ row }) => (
        <div>
          <div>{row.original.time}</div>
          <div className="text-sm text-muted-foreground">{row.original.location}</div>
        </div>
      )
    },
    {
      accessorKey: "year",
      header: "学年",
      id: "学年",
    },
    {
      accessorKey: "enrolled",
      header: "容量 / 已选",
      id: "容量",
      cell: ({ row }) => {
        const isFull = row.original.enrolled >= row.original.capacity;
        return (
          <span className={isFull ? "font-bold text-destructive" : ""}>
            {row.original.enrolled} / {row.original.capacity}
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
        const isFull = course.enrolled >= course.capacity;
        const isDisabled = isSelected || isFull;

        return (
          <Button
            variant={isSelected ? "secondary" : "default"}
            size="sm"
            disabled={isDisabled}
            onClick={() => handleSelectCourse(course)}
          >
            {isSelected ? "已选" : (isFull ? "已满" : "选课")}
          </Button>
        )
      }
    }
  ], [myCourseIds, handleSelectCourse]); 

  // --- (渲染页面) ---
  return (
    <div className="space-y-4">
      {/* --- 筛选器区域 (修改) --- */}
      <Card>
        <CardHeader>
          <CardTitle>课程检索</CardTitle>
          <CardDescription>按条件筛选全校课程</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* 【修改点 6】: 搜索框和按钮 */}
            <div className="md:col-span-3 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索课程名或教师..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                // (可选: 添加 onKeyDown 允许按回车键搜索)
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              />
            </div>
            {/* 您指出的按钮！ */}
            <Button onClick={handleSearchClick} className="md:col-span-1">
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
            
            {/* 【修改点 7】: 下拉框不再触发搜索，只更新状态 */}
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger>
                <SelectValue placeholder="所有学院" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有学院</SelectItem>
                {COLLEGE_OPTIONS.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="所有类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                {COURSE_TYPE_OPTIONS.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="所有学年" />
              </SelectTrigger>
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

      {/* --- 课程表格区域 (修改) --- */}
      <Card>
        <CardHeader>
          <CardTitle>课程列表</CardTitle>
          {/* 【修改点 8】: 描述文本现在使用 displayedCourses */}
          <CardDescription>
            {loading ? "正在加载课程..." : `共找到 ${displayedCourses.length} 门符合条件的课程`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 【修改点 9】: DataTable 现在接收 displayedCourses */}
          <CourseDataTable 
            columns={columns} 
            data={displayedCourses} 
            loading={loading} 
          />
        </CardContent>
      </Card>
    </div>
  )
}