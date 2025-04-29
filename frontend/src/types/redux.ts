// frontend/src/utils/redux.ts - Helper functions for Redux store setup

import { Store, AnyAction, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Define RootState and AppDispatch types to be used throughout the app
export type RootState = ReturnType<typeof import('../store').configureStore>['getState'];
export type AppDispatch = typeof import('../store').configureStore extends () => infer R 
  ? R extends Store<any, any> 
    ? R['dispatch'] 
    : never 
  : never;

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Thunk action type for async operations
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Function to create properly typed thunks
export const createAppThunk = <ReturnType, ArgType = void>(
  type: string,
  thunk: (arg: ArgType) => ThunkAction<Promise<ReturnType>, RootState, unknown, AnyAction>
) => {
  return thunk;
};