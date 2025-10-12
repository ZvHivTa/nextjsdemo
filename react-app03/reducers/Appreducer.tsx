export interface State{
    displayNavigation:boolean;
    themeMode:"light" | "dark";
}

export enum ActionType{
    UPDATE = "UPDATE"
}

interface UpdateAction{
    type: ActionType.UPDATE;
    field: string;
    value: any;
}

export type Action = UpdateAction;

export const initialState: State = {
    displayNavigation: true,
    themeMode: "light"
};

export function reducer(state: State, action: Action) {
    switch (action.type) {
        case ActionType.UPDATE:
            return {
                ...state,
                [action.field]: action.value
            };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}