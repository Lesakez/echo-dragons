// src/store/index.ts
import { configureStore as reduxConfigureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import battleReducer from './slices/battleSlice';
import characterReducer from './slices/characterSlice';

// Создаем единственный экземпляр хранилища, который можно импортировать напрямую
export const store = reduxConfigureStore({
  reducer: {
    auth: authReducer,
    battle: battleReducer,
    character: characterReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем несериализуемые действия/состояния
        ignoredActions: ['battle/updateBattle', 'battle/endBattle'],
        ignoredPaths: ['battle.currentBattle.startTime', 'battle.currentBattle.lastActionTime']
      }
    })
});

// Для обратной совместимости сохраняем функцию configureStore
export const configureStore = () => {
  return store;
};

// Экспортируем типы RootState и AppDispatch из самого хранилища
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;