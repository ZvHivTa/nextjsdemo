"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Loader2 } from "lucide-react"

// --- 1. 定义类型和选项 (与 admin/courses/page.tsx 保持一致) ---
type CourseType = '通识课程' | '专业必修课' | '专业选修课' | '共通教育课';
type CourseYear = '大一' | '大二' | '大三' | '大四';

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

// --- 2. 为 "创建" 定义 Zod Schema ---
// (这与 admin/courses/page.tsx 中的 schema 几乎一样，
//  但移除了 id 和 enrolled，因为这些是后端生成的)
const createCourseSchema = z.object({
  name: z.string().min(2, { message: "课程名称至少2个字符" }),
  teacher: z.string().min(2, { message: "教师姓名至少2个字符" }),
  time: z.string().min(1, { message: "必须填写上课时间" }),
  location: z.string().min(1, { message: "必须填写上课地点" }),
  credits: z.coerce.number().min(0, { message: "学分不能为负" }),
  capacity: z.coerce.number().int().min(1, { message: "容量必须大于0" }),
  type: z.enum(['通识课程', '专业必修课', '专业选修课', '共通教育课'], {
    required_error: "必须选择课程类型",
  }),
  year: z.enum(['大一', '大二', '大三', '大四'], {
    required_error: "必须选择学年",
  }),
  college: z.string({ required_error: "必须选择学院" }).min(1),
  // 课程ID (id) 将由后端在创建时生成
  // 已选人数 (enrolled) 默认为 0
});

export default function CreateCoursePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // 用于成功后跳转

  // --- 3. 初始化表单 ---
  const form = useForm<z.infer<typeof createCourseSchema>>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: "",
      teacher: "",
      time: "",
      location: "",
      credits: 0,
      capacity: 50,
      // (Selects 需要一个 undefined 初始值才能显示 placeholder)
      type: undefined,
      year: undefined,
      college: undefined,
    },
  });

  // --- 4. 提交处理器 ---
  const onSubmit = (values: z.infer<typeof createCourseSchema>) => {
    setLoading(true);
    
    // (在真实应用中, 'id' 和 'enrolled' 会在后端添加)
    const newCourseData = {
      ...values,
      id: `C${Math.floor(Math.random() * 1000)}`, // 模拟生成 ID
      enrolled: 0,
    };
    
    console.log("API调用: POST /api/courses", newCourseData);
    
    // 模拟网络请求
    setTimeout(() => {
      setLoading(false);
      // (可选: 显示一个 "创建成功" 的 Toast)
      
      // 成功后重置表单
      form.reset();
      
      // (可选: 跳转回课程列表页)
      // router.push("/admin/courses");
    }, 1500);
  };

  return (
    // 使用 max-w-4xl 将表单限制在合理宽度，使其更易读
      <Card>
        <CardHeader>
          <CardTitle>新建课程</CardTitle>
          <CardDescription>
            填写所有必填字段以创建一门新课程。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 使用 grid 布局来排列表单 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 课程名称 */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>课程名称 *</FormLabel>
                      <FormControl><Input placeholder="例如: 计算机网络" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* 教师 */}
                <FormField
                  control={form.control}
                  name="teacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任课教师 *</FormLabel>
                      <FormControl><Input placeholder="例如: 王教授" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 上课时间 */}
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>上课时间 *</FormLabel>
                      <FormControl><Input placeholder="例如: 周二 3-4节" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 上课地点 */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>上课地点 *</FormLabel>
                      <FormControl><Input placeholder="例如: 教A-305" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 学分 */}
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>学分 *</FormLabel>
                      <FormControl><Input type="number" step="0.5" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 课程容量 */}
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>课程容量 *</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 开设学院 */}
                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>开设学院 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="选择一个学院" /></SelectTrigger>
                        </FormControl>
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

                {/* 课程类型 */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>课程类型 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="选择课程类型" /></SelectTrigger>
                        </FormControl>
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

                {/* 开设学年 */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>开设学年 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="选择开设学年" /></SelectTrigger>
                        </FormControl>
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
              
              {/* 提交按钮 */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  确认创建
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
  )
}