import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { UserService } from '../services/user.service';
import * as UserActions from './user.action';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class UserEffects {

  constructor(private actions$: Actions, private userService: UserService) {}

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      mergeMap(() =>
        this.userService.getUsers().pipe(
          map(users => {
            return UserActions.loadUsersSuccess({ users });
          }),
          catchError(error => {
            return of(UserActions.loadUsersFailure({ error }));
          })
        )
      )
    )
  );
}
