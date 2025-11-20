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
import { ArrowUpDown, BookCheck } from "lucide-react"


import { ColumnDef } from "@tanstack/react-table"
import { CourseDataTable } from "@/components/app-dashborad/course-table"
import { Course } from "@/data/types"


// --- 模拟数据 ---
// 这些是学生 *已经选上* 的课
const MOCK_MY_COURSES: Course[] = [
  { id: "C003", name: "数据结构", teacher: "刘博士", type: "专业必修课", time: "周三 5-6节", location: "教A-305", credits: 4.0 },
  { id: "C005", name: "设计素描", teacher: "陈老师", type: "专业选修课", time: "周五 1-4节", location: "艺-202", credits: 2.0 },
];

export default function SelectedPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  // 获取已选课程
  useEffect(() => {
    setLoading(true);
    // 模拟 API: GET /api/student/my-courses
    new Promise(res => setTimeout(res, 600)).then(() => {
      setCourses(MOCK_MY_COURSES);
      setLoading(false);
    });
  }, []);

  // 计算总学分
  const totalCredits = useMemo(() => {
    return courses.reduce((acc, curr) => acc + curr.credits, 0);
  }, [courses]);

  // 退选处理器
  const handleWithdrawCourse = useCallback((course: Course) => {
    if(confirm(`确定要退选《${course.name}》吗？`)) {
        console.log(`退选: ${course.name}`);
        setCourses(prev => prev.filter(c => c.id !== course.id));
    }
  }, []);

  // 定义列
  const columns = useMemo<ColumnDef<Course>[]>(() => [
    {
      accessorKey: "id",
      header: "课程id",
      id: "课程id",
    },
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
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <Button 
            variant="destructive" // 使用红色按钮表示退选
            size="sm" 
            onClick={() => handleWithdrawCourse(row.original)}
        >
          退选
        </Button>
      )
    }
  ], [handleWithdrawCourse]);

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
            <CourseDataTable columns={columns} data={courses} loading={loading} />
        </CardContent>
        </Card>
    </div>
  )
}