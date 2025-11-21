import { UserData,UserRole } from "@/data/types";
import {
  Calendar,
  Home,
  Inbox,
  LucideIcon,
  MessageCircleMore,
  Search,
  Settings,
} from "lucide-react";

//数据类型
export interface State {
  role: UserRole;
  user: UserData;
  path: string; // 模拟当前路由路径
  isInitialized: boolean; // 初始化标志
}

//操作类型
export enum ActionType {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  NAVIGATE = "NAVIGATE",
  RESTORE_SESSION = "RESTORE_SESSION", // 恢复会话
  INITIALIZE_END = "INITIALIZE_END", // 初始化结束（即使没登录）
}

//具体操作
export interface LoginAction {
  type: ActionType.LOGIN;
  payload: {
    role: UserRole;
    user: UserData;
    redirectPath: string;
  };
}

export interface LogoutAction {
  type: ActionType.LOGOUT;
}

export interface NavigateAction {
  type: ActionType.NAVIGATE;
  route: string;
}

export interface RestoreSessionAction {
  type: ActionType.RESTORE_SESSION;
  payload: { role: UserRole; user:  UserData; path: string };
}

export interface InitializeEndAction {
  type: ActionType.INITIALIZE_END;
}

export type Action =
  | LoginAction
  | LogoutAction
  | NavigateAction
  | RestoreSessionAction
  | InitializeEndAction;

//初始化状态
export const initialState: State = {
  role: null,
  user: {
    name: "newbee",
    email: "newbee@ddj.eju.cn",
    avatar: null,
    id: "",
    year: "",
    major: "",
    college: "",
  },
  isInitialized: false, // [默认] 未初始化
  path: "/",
};

// Icon 映射
type IconName =
  | "Home"
  | "Inbox"
  | "Settings"
  | "Calendar"
  | "Search"
  | "MessageCircleMore";

export const IconMap: Record<IconName, LucideIcon> = {
  Home: Home,
  Inbox: Inbox,
  Calendar: Calendar,
  Search: Search,
  Settings: Settings,
  MessageCircleMore: MessageCircleMore,
  // ... 其他 Icon 组件
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        role: action.payload.role,
        user: action.payload.user,
        path: action.payload.redirectPath,
        isInitialized: true, // 登录必然意味着已初始化
      };
    case "LOGOUT":
      return {
        ...initialState, 
        path: "/",
        isInitialized: true, // 登出后也是已初始化状态
      };
    case "NAVIGATE":
      if (action.route === "#") {
        return state;
      }
      return {
        ...state,
        path: action.route,
      };
    case "RESTORE_SESSION":
      return {
        ...state,
        role: action.payload.role,
        user: action.payload.user,
        path: action.payload.path,
        isInitialized: true,
      };
    case "INITIALIZE_END":
      return {
        ...state,
        isInitialized: true,
      };
    default:
      return state;
  }
}