// --- 基础枚举/联合类型 ---

export type UserRole = "student" | "admin" | null;

export type CourseType =
  | 1
  | 2
  | 3
  | 4;

export type CourseYear = 1 | 2 | 3 | 4;

// --- 实体数据模型 ---
export interface LoginResponseData {
  id: number;
  token: string;
  roletype: UserRole;
  name: string;
  avatar: string;
  college: string; // 学生特有
  major: string; // 学生特有
  year: string; // 学生特有
}
/**
 * 用户基础信息 (用于 Context 和 Auth)
 */
export interface UserData {
  id: number; // 学号或工号 (登录后通常会有)
  name: string;
  email: string;
  avatar: string | null;

  //共通
  college?: string; // 学院

  // 学生特有字段
  year?: string; // 年级/入学年份
  major?: string; // 专业
}

/**
 * 课程完整信息
 */
export interface Course {
  id: number;
  name: string;
  teacher: string;

  // 核心属性
  credits: number; // 学分
  capacity: number; // 容量
  enrolled: number; // 已选人数

  // 排课信息
  location: string; // 上课地点
  time: string; // 上课时间

  // 分类信息
  type: CourseType; // 课程性质
  year: CourseYear; // 开设年级
  college: string; // 开设学院

  // 扩展字段 (可选)
  //reason?: string;   // 推荐理由 (用于推荐算法返回)
}

/**
 * 学生完整信息 (用于管理员管理)
 */
export interface Student {
  id: number;
  name: string;
  college: string;
  major: string;
  year: CourseYear | string; // 兼容字符串或特定枚举
}
// 学院
export interface College {
  id: number | string; // 数据库ID
  name: string;        // 显示名 (如: 信息工程学院)
  code: string;        // 代号 (如: info, 用于筛选传参)
}
// --- API 响应结构 (预定义) ---

/**
 * 分页响应结构
 * 用于列表查询接口
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// API 响应包装器 (API Wrappers)

/**
 * 通用 API 响应结构
 * 对应后端的 Result<T> 类
 */
export interface ApiResponse<T> {
  code: number; // 对应 private Integer code;
  msg: string; // 对应 private String msg;
  data: T; // 对应 private T data;
  success: boolean; // 根据code的值，后端自动生成的布尔值
}
