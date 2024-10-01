export interface AppState {
  users: UserState;
}

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  tempKey: string;
  approved: boolean;
  role?: string;
  avatar: string
}

export const initialUserState: UserState = {
  users: [],
  loading: false,
  error: null,
};
