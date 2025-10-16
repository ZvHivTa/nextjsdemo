import { Calendar, Home, Icon, Inbox, MessageCircleMore, Search, Settings } from "lucide-react";
import type LucideIcon from "lucide-react";

//数据类型
export interface State {
  displaySidebar: boolean;
  conversations: ConversationItemState[];
}

export interface ConversationItemState {
  id: string;
  title: string;
  url: string;
  icon: typeof Icon;
}

//操作类型
export enum ActionType {
  UPDATE = "UPDATE",
  RENAME_CONVERSATION = "RENAME_CONVERSATION",
  DELETE_CONVERSATION = "DELETE_CONVERSATION",
}

export interface DeleteConversationAction{
  type: ActionType.DELETE_CONVERSATION;
  id: string;
}

export interface UpdateAction {
  type: ActionType.UPDATE;
  field: string;
  value: any;
}

export interface RenameConversationAction {
    type: ActionType.RENAME_CONVERSATION;
    oldTitle: string;
    newTitle: string;
    id: string;
}

export type Action = UpdateAction | RenameConversationAction | DeleteConversationAction;

//初始化状态
export const initialState: State = {
  displaySidebar: true,
  conversations: [
    {
      id: "con1",
      title: "Home",
      url: "#",
      icon: Home,
    },
    {
      id: "con2",
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      id: "con3",
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      id: "con4",
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      id: "con5",
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      id: "con6",
      title: "Conversation",
      url: "#",
      icon: MessageCircleMore,
    },
  ],
};

export function reducer(state: State, action: Action):State {
  switch (action.type) {
    case ActionType.UPDATE:
      return {
        ...state,
        [action.field]: action.value,
      };
    case ActionType.RENAME_CONVERSATION:
        return {
            ...state,
            // 遍历 conversations 列表，找到旧标题的项目并更新
            conversations: state.conversations.map(conv => {
                if (conv.id === action.id) {
                    return { ...conv, title: action.newTitle };
                }
                return conv;
            })
        };
    case ActionType.DELETE_CONVERSATION:
        return{
          ...state,
          conversations: state.conversations.filter(conv => conv.id !== action.id),
        };
    default:
      throw new Error(`Unhandled action type: ${(action as Action).type}`);
  }
}
