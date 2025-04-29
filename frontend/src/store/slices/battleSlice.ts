// src/store/slices/battleSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BattleState, BattleParticipantState, BattleAction, BattleResult } from '../../types/battle';
import battleService from '../../services/battleService';

interface BattleSliceState {
  currentBattle: BattleState | null;
  battleHistory: {
    id: number;
    type: string;
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
  battleResult: null
};

// Асинхронные thunk-действия

export const startPvEBattle = createAsyncThunk(
  'battle/startPvE',
  async (params: { characterId: number, monsterIds: number[] }, { rejectWithValue }) => {
    try {
      const battle = await battleService.startPvEBattle(params.characterId, params.monsterIds);
      return battle;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const startPvPBattle = createAsyncThunk(
  'battle/startPvP',
  async (characterIds: number[], { rejectWithValue }) => {
    try {
      const battle = await battleService.startPvPBattle(characterIds);
      return battle;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const performAction = createAsyncThunk(
  'battle/performAction',
  async (params: { battleId: number, participantId: number, action: BattleAction }, { rejectWithValue }) => {
    try {
      const updatedBattle = await battleService.performAction(
        params.battleId, 
        params.participantId, 
        params.action
      );
      return updatedBattle;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getBattleHistory = createAsyncThunk(
  'battle/getHistory',
  async (characterId: number, { rejectWithValue }) => {
    try {
      const history = await battleService.getBattleHistory(characterId);
      return history;
    } catch (error) {
      return rejectWithValue((error as Error).message);
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
      state.currentBattle = null;
      
      // Добавляем запись в историю боёв
      if (state.currentBattle) {
        state.battleHistory.unshift({
          id: state.currentBattle.id,
          type: state.currentBattle.type,
          result: action.payload.status,
          date: new Date()
        });
      }
    },
    
    resetBattleState(state) {
      state.currentBattle = null;
      state.error = null;
      state.battleResult = null;
    }
  },
  extraReducers: (builder) => {
    // Обработка начала PvE боя
    builder.addCase(startPvEBattle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(startPvEBattle.fulfilled, (state, action) => {
      state.loading = false;
      state.currentBattle = action.payload;
      state.battleResult = null;
    });
    builder.addCase(startPvEBattle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Обработка начала PvP боя
    builder.addCase(startPvPBattle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(startPvPBattle.fulfilled, (state, action) => {
      state.loading = false;
      state.currentBattle = action.payload;
      state.battleResult = null;
    });
    builder.addCase(startPvPBattle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Обработка боевых действий
    builder.addCase(performAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(performAction.fulfilled, (state, action) => {
      state.loading = false;
      state.currentBattle = action.payload;
    });
    builder.addCase(performAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Обработка получения истории боёв
    builder.addCase(getBattleHistory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getBattleHistory.fulfilled, (state, action) => {
      state.loading = false;
      state.battleHistory = action.payload;
    });
    builder.addCase(getBattleHistory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { updateBattle, endBattle, resetBattleState } = battleSlice.actions;

export default battleSlice.reducer;