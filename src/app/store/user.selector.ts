import { createSelector, createFeatureSelector } from '@ngrx/store';
import { UserState } from './user';
import { USER_KEY } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>(USER_KEY);

export const selectAllUsers = createSelector(
  selectUserState,
  (state: UserState) => state.users
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading
);

export const selectUserError = createSelector(
  selectUserState,
  (state: UserState) => state.error
);
