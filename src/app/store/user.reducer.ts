import { createReducer, on } from '@ngrx/store';
import { initialUserState, UserState } from './user';
import * as UserActions from './user.action';

export const USER_KEY = 'user';

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.loadUsers, (state) => ({
    ...state,
    loading: true,
  })),
  on(UserActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users: users,
    loading: false,
  })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
  })),
  on(UserActions.addUser, (state, { user }) => ({
    ...state,
    users: [...state.users, user],
  })),
  on(UserActions.updateUser, (state, { user }) => ({
    ...state,
    users: state.users.map((u: any) => (u.id === user.id ? user : u)),
  })),
  on(UserActions.deleteUser, (state, { id }) => ({
    ...state,
    users: state.users.filter((u: any) => u.id !== id),
  }))
);
