import { Action, ActionReducer } from '@ngrx/store';
import { USER_KEY, userReducer } from './store/user.reducer';
import { UserEffects } from './store/user.effects';
import { UserState } from './store/user';

export interface AppState {
  [USER_KEY]: UserState;
}

export interface AppStore {
  users: ActionReducer<UserState, Action>;
}

export const appStore: AppStore = {
  users: userReducer,
};

export const appEffects = [UserEffects];
