// src/types/redux.ts
import { Store, AnyAction, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { configureStore } from '../store';
import { AuthState } from '../store/slices/authSlice';  
import { BattleSliceState } from '../store/slices/battleSlice';
import { CharacterState } from '../store/slices/characterSlice';

// Определяем правильный тип RootState
export type RootState = {
  auth: AuthState;
  battle: BattleSliceState;
  character: CharacterState;
};

// Определяем AppDispatch на основе типа диспетчера хранилища
export type AppDispatch = ReturnType<typeof configureStore>['dispatch'];

// Создаем типизированные версии хуков useDispatch и useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Определяем тип AppThunk для асинхронных операций
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;