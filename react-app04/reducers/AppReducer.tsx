import { Calendar, Home, Icon, Inbox, MessageCircleMore, Search, Settings } from "lucide-react";
import type LucideIcon from "lucide-react";

//数据类型
export interface State {
  displaySidebar: boolean;
  conversations: ConversationItemState[];
  messages: Message[]; // 💡 新增：存储所有消息
  currentConversationId: string; // 💡 新增：当前选中的会话 ID
}

export interface ConversationItemState {
  id: string;
  title: string;
  url: string;
  icon: typeof Icon;
}

export interface Message {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: string; // 或 Date 类型
    conversationId: string; // 指明这条消息属于哪个会话
}

//操作类型
export enum ActionType {
  UPDATE = "UPDATE",
  RENAME_CONVERSATION = "RENAME_CONVERSATION",
  DELETE_CONVERSATION = "DELETE_CONVERSATION",
  SEND_MESSAGE = "SEND_MESSAGE",
}

//具体操作
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

export interface SendMessageAction {
    type: ActionType.SEND_MESSAGE;
    message: Message; // 包含完整消息对象的 Action
}
export type Action = UpdateAction | RenameConversationAction | DeleteConversationAction | SendMessageAction;

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

  messages: [
        // 示例消息，注意它们需要关联到一个 conversationId
        { id: 'm1', sender: 'user', content: '嗨，你能帮我总结一下 React Hooks 的最佳实践吗？', timestamp: '10:00 AM', conversationId: 'con1' },
        { id: 'm2', sender: 'ai', content: '当然！使用 React Hooks 的最佳实践包括：只在顶层调用 Hook；不从常规的 JavaScript 函数中调用 Hook；以及使用自定义 Hook 来封装复杂的逻辑。当然！使用 React Hooks 的最佳实践包括：只在顶层调用 Hook；不从常规的 JavaScript 函数中调用 Hook；以及使用自定义 Hook 来封装复杂的逻辑', timestamp: '10:01 AM', conversationId: 'con1' },
    ],
  currentConversationId: 'con1', // 默认选中第一个会话
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
    case ActionType.SEND_MESSAGE:
            return {
                ...state,
                // 将新消息添加到消息列表的末尾
                messages: [...state.messages, action.message],
            };
    default:
      throw new Error(`Unhandled action type: ${(action as Action).type}`);
  }
}
