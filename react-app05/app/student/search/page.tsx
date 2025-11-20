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


import { ColumnDef } from "@tanstack/react-table"
import { CourseDataTable } from "@/components/app-dashborad/course-table"
import { Course, CourseType, CourseYear } from "@/data/types"


// --- (模拟数据 - 保持不变) ---
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
  // --- (筛选器状态 - 保持不变) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedID, setSelectedID] = useState("all");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // --- (数据状态 - 保持不变) ---
  const [loading, setLoading] = useState(true);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<Set<string>>(new Set());

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

  // --- (搜索按钮处理器 - 保持不变) ---
  const handleSearchClick = () => {
    runSearch(searchQuery,selectedID,  selectedCollege, selectedType, selectedYear);
  };

  // --- (useEffect 初始加载 - 保持不变) ---
  useEffect(() => {
    setMyCourseIds(MOCK_MY_COURSE_IDS);
    runSearch("","all", "all", "all", "all");
  }, []); 

  // --- (选课/退选处理器 - 修改) ---
  
  // 选课处理器
  const handleSelectCourse = useCallback((course: Course) => {
    console.log(`正在尝试选课: ${course.name} (ID: ${course.id})`);
    // TODO: 选课处理
    // 模拟
    setMyCourseIds(prev => new Set(prev).add(course.id));
    //根据返回的数据判断成功还是失败
    // if (isSubmitting) {
    //     toast.success("选课成功", {
    //       position:'top-center',
    //       description: "成功选择xx课程",
    //     });
    // }else{
    //   toast.error("选课失败", {
    //       position:'top-center',
    //       description: "",
    //   });
    //   return;
    // }
  }, []);

  // 退选处理器
  const handleWithdrawCourse = useCallback((course: Course) => {
    console.log(`正在尝试退选: ${course.name} (ID: ${course.id})`);
    // TODO: 退课处理
    // 模拟成功:
    setMyCourseIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(course.id);
      return newSet;
    });

    //根据返回的数据判断成功还是失败
    // if (isSubmitting) {
    //     toast.success("选课成功", {
    //       position:'top-center',
    //       description: "成功选择xx课程",
    //     });
    // }else{
    //   toast.error("选课失败", {
    //       position:'top-center',
    //       description: "",
    //   });
    //   return;
    // }
  }, []);


  // --- (列定义 - 修改) ---
  const columns = useMemo<ColumnDef<Course>[]>(() => [
    {
      accessorKey: "id",
      header: "课程id",
      id: "课程id",
    },
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
      // 【修改点 2】: 单元格渲染逻辑
      cell: ({ row }) => {
        const course = row.original;
        const isSelected = myCourseIds.has(course.id);

        // 如果已选，显示“退选”按钮
        if (isSelected) {
          return (
            <Button
              variant="outline" // 使用 "outline" 或 "destructive" 均可
              size="sm"
              onClick={() => handleWithdrawCourse(course)}
            >
              退选
            </Button>
          );
        }

        // 如果未选，执行之前的逻辑（检查是否已满）
        const isFull = course.enrolled >= course.capacity;
        const isDisabled = isFull;

        return (
          <Button
            variant="default"
            size="sm"
            disabled={isDisabled}
            onClick={() => handleSelectCourse(course)}
          >
            {isFull ? "已满" : "选课"}
          </Button>
        );
      }
    }
  ], 
  // 【修改点 3】: 添加新处理器到依赖数组
  [myCourseIds, handleSelectCourse, handleWithdrawCourse]); 

  // --- (渲染页面 - 保持不变) ---
  return (
    <div className="space-y-4">
      {/* --- 筛选器区域 (保持不变) --- */}
      <Card>
        <CardHeader>
          <CardTitle>课程检索</CardTitle>
          <CardDescription>按条件筛选全校课程</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* 搜索框和按钮 */}
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
            
            {/* 下拉框 */}
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

      {/* --- 课程表格区域 (保持不变) --- */}
      <Card>
        <CardHeader>
          <CardTitle>课程列表</CardTitle>
          <CardDescription>
            {loading ? "正在加载课程..." : `共找到 ${displayedCourses.length} 门符合条件的课程`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* DataTable 接收更新后的 columns，data 不变 */}
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