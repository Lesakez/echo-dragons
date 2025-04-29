import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BattleState, BattleParticipantState, BattleAction, BattleResult, BattleType } from '../../types/battle';
import battleService from '../../services/battleService';

interface BattleSliceState {
  currentBattle: BattleState | null;
  battleHistory: {
    id: number;
    type: BattleType; // Изменяем с string на BattleType для соответствия
    result: string;
    date: Date;
  }[];
  loading: boolean;
  error: string | null;
  battleResult: BattleResult | null;
}

const initialState: BattleSliceState = {
  currentBattle: null,
  battleHistory: [],
  loading: false,
  error: null,
  battleResult: null,
};

// Асинхронные thunk-действия
export const startPvEBattle = createAsyncThunk(
  'battle/startPvE',
  async (params: { characterId: number; monsterIds: number[] }, { rejectWithValue }) => {
    try {
      const battle = await battleService.startPvEBattle(params.characterId, params.monsterIds);
      return battle;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error as Error).message);
    }
  }
);

export const startPvPBattle = createAsyncThunk(
  'battle/startPvP',
  async (characterIds: number[], { rejectWithValue }) => {
    try {
      const battle = await battleService.startPvPBattle(characterIds);
      return battle;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error as Error).message);
    }
  }
);

export const performAction = createAsyncThunk(
  'battle/performAction',
  async (params: { battleId: number; participantId: number; action: BattleAction }, { rejectWithValue }) => {
    try {
      const updatedBattle = await battleService.performAction(
        params.battleId,
        params.participantId,
        params.action
      );
      return updatedBattle;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error as Error).message);
    }
  }
);

export const getBattleHistory = createAsyncThunk(
  'battle/getHistory',
  async (characterId: number, { rejectWithValue }) => {
    try {
      const history = await battleService.getBattleHistory(characterId);
      return history;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error as Error).message);
    }
  }
);

// Создание слайса
const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    updateBattle(state, action: PayloadAction<BattleState>) {
      state.currentBattle = action.payload;
      state.error = null;
    },
    endBattle(state, action: PayloadAction<BattleResult>) {
      state.battleResult = action.payload;
      
      // Сохраняем currentBattle в локальную переменную
      const currentBattle = state.currentBattle;
      
      // Устанавливаем currentBattle в null
      state.currentBattle = null;
      
      // Добавляем запись в историю боёв, если currentBattle не null
      if (currentBattle) {
        state.battleHistory.unshift({
          id: currentBattle.id,
          type: currentBattle.type, // Теперь type: BattleType
          result: action.payload.status,
          date: new Date(),
        });
      }
    },
    resetBattleState(state) {
      state.currentBattle = null;
      state.error = null;
      state.battleResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startPvEBattle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startPvEBattle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
        state.battleResult = null;
      })
      .addCase(startPvEBattle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(startPvPBattle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startPvPBattle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
        state.battleResult = null;
      })
      .addCase(startPvPBattle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(performAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performAction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
      })
      .addCase(performAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getBattleHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBattleHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.battleHistory = action.payload;
      })
      .addCase(getBattleHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateBattle, endBattle, resetBattleState } = battleSlice.actions;

export default battleSlice.reducer;