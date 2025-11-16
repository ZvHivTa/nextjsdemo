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
import { ArrowUpDown, Sparkles } from "lucide-react"

// 引入我们之前抽离的通用表格组件

import { ColumnDef } from "@tanstack/react-table"
import { CourseDataTable } from "@/components/app-dashborad/student-course-table"

// --- 1. 类型定义 ---
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

// --- 2. 模拟数据 ---

// 模拟后端返回的“推荐课程列表”
// 后端逻辑：SELECT * FROM courses WHERE major = 'CS' AND year = 'Year3' ...
const MOCK_RECOMMENDED_FROM_BACKEND: Course[] = [
  { id: "C005", name: "设计素描", teacher: "陈老师", type: "专业选修课", time: "周五 1-4节", location: "艺-202", year: "大三", capacity: 40, enrolled: 30, college: "art", credits: 2.0 },
  { id: "C008", name: "人工智能导论", teacher: "周教授", type: "专业选修课", time: "周三 7-8节", location: "信-303", year: "大三", capacity: 120, enrolled: 110, college: "info", credits: 3.0 },
  { id: "C006", name: "计算机网络", teacher: "赵教授", type: "专业必修课", time: "周二 3-4节", location: "教A-101", year: "大三", capacity: 80, enrolled: 75, college: "info", credits: 4.0 },
  // 假设 C006 学生还没选，C008 学生还没选
  // 假设 C005 学生已经选了（即使是推荐列表，也可能包含已选的，方便查看或退选）
];

// 模拟学生当前已选的课程 ID（用于判断按钮状态）
const MOCK_MY_COURSE_IDS = new Set<string>(['C005']); 

export default function RecommendPage() {
  // --- 3. 状态管理 ---
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<Set<string>>(new Set());

  // --- 4. 获取数据 (模拟调用后端) ---
  useEffect(() => {
    setLoading(true);
    
    // 这是一个并行请求：我们需要同时知道“推荐了啥”和“我选了啥”
    Promise.all([
      // 请求 1: 获取推荐课程 (后端处理年级/专业匹配逻辑)
      new Promise<Course[]>(res => setTimeout(() => res(MOCK_RECOMMENDED_FROM_BACKEND), 800)),
      // 请求 2: 获取我已选的课程 ID
      new Promise<Set<string>>(res => setTimeout(() => res(MOCK_MY_COURSE_IDS), 600))
    ]).then(([recommendedData, mySelectedIds]) => {
      setCourses(recommendedData);
      setMyCourseIds(mySelectedIds);
      setLoading(false);
    });
  }, []);

  // --- 5. 交互处理器 ---

  // 选课
  const handleSelectCourse = useCallback((course: Course) => {
    console.log(`API调用: 选课 ${course.id} - ${course.name}`);
    // 乐观更新 UI
    setMyCourseIds(prev => new Set(prev).add(course.id));
  }, []);

  // 退选
  const handleWithdrawCourse = useCallback((course: Course) => {
    console.log(`API调用: 退选 ${course.id} - ${course.name}`);
    // 乐观更新 UI
    setMyCourseIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(course.id);
      return newSet;
    });
  }, []);

  // --- 6. 列定义 ---
  const columns = useMemo<ColumnDef<Course>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          课程名称 <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      id: "课程名称",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
    },
    {
      accessorKey: "teacher",
      header: "教师",
    },
    {
      accessorKey: "credits",
      header: "学分",
    },
    {
      accessorKey: "type",
      header: "类型",
    },
    {
      accessorKey: "time",
      header: "时间 / 地点",
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
        
        // 逻辑分支 1: 如果已选 -> 显示退选
        if (isSelected) {
          return (
            <Button variant="outline" size="sm" onClick={() => handleWithdrawCourse(course)}>
              退选
            </Button>
          );
        }

        // 逻辑分支 2: 如果未选 -> 检查容量
        const isFull = course.enrolled >= course.capacity;
        return (
          <Button 
            size="sm" 
            disabled={isFull} 
            onClick={() => handleSelectCourse(course)}
          >
            {isFull ? "已满" : "选课"}
          </Button>
        );
      }
    }
  ], [myCourseIds, handleSelectCourse, handleWithdrawCourse]);

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
        {/* 直接把后端数据灌入通用表格，不进行客户端过滤 */}
        <CourseDataTable columns={columns} data={courses} loading={loading} />
      </CardContent>
    </Card>
  )
}