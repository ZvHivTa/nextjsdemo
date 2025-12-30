"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner" // 引入 Toast

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
import { api } from "@/lib/api"
import { ApiResponse, College } from "@/types"

// --- 1. 常量定义 (保持与后端一致) ---
// 注意：value 改为了数字的字符串形式，方便后端转换
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
const createCourseSchema = z.object({
  name: z.string().min(2, { message: "课程名称至少2个字符" }),
  teacher: z.string().min(2, { message: "教师姓名至少2个字符" }),
  time: z.string().min(1, { message: "必须填写上课时间" }),
  
  // [修改] 字段名 location -> place
  place: z.string().min(1, { message: "必须填写上课地点" }),
  
  // [修改] 字段名 credits -> credit
  credit: z.coerce.number().min(0.5, { message: "学分至少0.5" }),
  capacity: z.coerce.number().int().min(1, { message: "容量必须大于0" }),
  
  // 类型和学年：先存字符串，提交时转数字
  type: z.string({ required_error: "必须选择课程类型" }),
  year: z.string({ required_error: "必须选择学年" }),
  
  // [修改] 字段名 college -> collegeId
  collegeId: z.string({ required_error: "必须选择学院" }).min(1),
});

export default function CreateCoursePage() {
  const [loading, setLoading] = useState(false);
  const [collegeOptions, setCollegeOptions] = useState<{ value: string, label: string }[]>([]);
  const router = useRouter(); 

  // --- 3. 初始化表单 ---
  const form = useForm<z.infer<typeof createCourseSchema>>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: "",
      teacher: "",
      time: "",
      place: "",
      credit: 2, // 默认学分可以设为2
      capacity: 50,
      type: undefined,
      year: undefined,
      collegeId: undefined,
    },
  });

  // --- 4. 获取学院列表 ---
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get<ApiResponse<College[]>>('/colleges');
        if (res.success) {
          // 【关键修复】确保 value 是字符串，防止数字ID导致Select不显示
          setCollegeOptions(res.data.map(c => ({ value: c.id.toString(), label: c.name })));
        }
      } catch (error) {
        console.error("Fetch colleges failed", error);
        toast.error("加载学院数据失败");
      }
    };
    fetchColleges();
  }, []);

  // --- 5. 提交逻辑 ---
  const onSubmit = async (values: z.infer<typeof createCourseSchema>) => {
    setLoading(true);
    
    try {
      // 构造 Payload，进行类型转换
      const payload = {
        ...values,
        type: Number(values.type),
        year: Number(values.year),
        // id 和 chosenNumber 由后端处理
      };
      
      // 真实调用
      await api.post('/admin/course/insert', payload);
      
      toast.success("课程创建成功");
      form.reset(); // 重置表单

    } catch (error: any) {
      console.error("Create course failed", error);
      toast.error("创建失败", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle>新建课程</CardTitle>
          <CardDescription>
            填写下面的表单以录入一门新课程到系统中。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
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

                {/* 上课地点 (修正为 place) */}
                <FormField
                  control={form.control}
                  name="place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>上课地点 *</FormLabel>
                      <FormControl><Input placeholder="例如: 教A-305" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 学分 (修正为 credit) */}
                <FormField
                  control={form.control}
                  name="credit"
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

                {/* 开设学院 (动态加载) */}
                <FormField
                  control={form.control}
                  name="collegeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>开设学院 *</FormLabel>
                      {/* 【关键修复】
                          1. key={collegeOptions.length}：当选项加载完成时，强制重新渲染组件，解决异步加载导致的空白问题。
                          2. value={field.value}：受控绑定。
                      */}
                      <Select 
                        key={collegeOptions.length} 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择一个学院" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {collegeOptions.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 课程类型 (修正 Value) */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>课程类型 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择课程类型" />
                          </SelectTrigger>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择开设学年" />
                          </SelectTrigger>
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
              
              <div className="flex justify-end pt-4 gap-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => form.reset()}
                    disabled={loading}
                >
                    重置
                </Button>
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  确认创建
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
  )
}