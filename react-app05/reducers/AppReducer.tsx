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
  user: UserData | null;
  path: string; // 模拟当前路由路径
  // isSidebarOpen: boolean; // 如果使用外部 sidebar context，可以省略
}

export type UserRole = "student" | "manager" | null;

interface UserData {
  name: string;
  email: string;
}

//操作类型
export enum ActionType {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  NAVIGATE = "NAVIGATE",
}

//具体操作
export interface LoginAction {
  type: ActionType.LOGIN;
  payload: { role: UserRole; user: UserData; redirectPath: string };
}

export interface LogoutAction {
  type: ActionType.LOGOUT;
}

export interface NavigateAction {
  type: ActionType.NAVIGATE;
  route: string;
}

export type Action = LoginAction | LogoutAction | NavigateAction;

//初始化状态
export const initialState: State = {
  role: null,
  user: null,
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
        path: action.payload.redirectPath, // 登录时设置初始路径
      };
    case "LOGOUT":
      return {
        ...initialState, // 重置所有状态
        path: "/",
      };
    case "NAVIGATE":
      // 阻止对 # 的跳转
      if (action.route === "#") {
        console.warn("Sidebar link '#' clicked. Navigation blocked.");
        return state;
      }
      return {
        ...state,
        path: action.route,
      };
    default:
      if (process.env.NODE_ENV !== 'production') {
                console.error("Unknown action type:", (action as any).type);
            }
      return state;
  }
}
