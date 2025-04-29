// src/store/slices/characterSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

interface Character {
  id: number;
  name: string;
  level: number;
  experience: number;
  class: string;
  faction: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  // Другие необходимые поля
}

interface CharacterState {
  characters: Character[];
  current: Character | null;
  skills: any[];
  inventory: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CharacterState = {
  characters: [],
  current: null,
  skills: [],
  inventory: [],
  loading: false,
  error: null
};

export const fetchCharacters = createAsyncThunk(
  'character/fetchCharacters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/characters`);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Не удалось загрузить персонажей');
    }
  }
);

export const fetchCharacterById = createAsyncThunk(
  'character/fetchCharacterById',
  async (characterId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/characters/${characterId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Не удалось загрузить персонажа');
    }
  }
);

export const createCharacter = createAsyncThunk(
  'character/createCharacter',
  async (characterData: { name: string; class: string; faction: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/characters`, characterData);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Не удалось создать персонажа');
    }
  }
);

export const fetchCharacterSkills = createAsyncThunk(
  'character/fetchCharacterSkills',
  async (characterId: number, { rejectWithValue }) => {
    try {
      // Предполагаем, что у нас есть API для получения навыков персонажа
      const response = await axios.get(`${API_URL}/characters/${characterId}/skills`);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Не удалось загрузить навыки персонажа');
    }
  }
);

export const fetchCharacterInventory = createAsyncThunk(
  'character/fetchCharacterInventory',
  async (characterId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/inventory/character/${characterId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Не удалось загрузить инвентарь персонажа');
    }
  }
);

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    setCurrentCharacter: (state, action) => {
      state.current = action.payload;
    },
    clearCurrentCharacter: (state) => {
      state.current = null;
      state.skills = [];
      state.inventory = [];
    },
    // Можно добавить другие редюсеры для локальных изменений
  },
  extraReducers: (builder) => {
    // Обработка fetchCharacters
    builder.addCase(fetchCharacters.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCharacters.fulfilled, (state, action) => {
      state.loading = false;
      state.characters = action.payload;
    });
    builder.addCase(fetchCharacters.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchCharacterById
    builder.addCase(fetchCharacterById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCharacterById.fulfilled, (state, action) => {
      state.loading = false;
      state.current = action.payload;
    });
    builder.addCase(fetchCharacterById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка createCharacter
    builder.addCase(createCharacter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCharacter.fulfilled, (state, action) => {
      state.loading = false;
      state.characters.push(action.payload);
      state.current = action.payload;
    });
    builder.addCase(createCharacter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchCharacterSkills
    builder.addCase(fetchCharacterSkills.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCharacterSkills.fulfilled, (state, action) => {
      state.loading = false;
      state.skills = action.payload;
    });
    builder.addCase(fetchCharacterSkills.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchCharacterInventory
    builder.addCase(fetchCharacterInventory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCharacterInventory.fulfilled, (state, action) => {
      state.loading = false;
      state.inventory = action.payload;
    });
    builder.addCase(fetchCharacterInventory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setCurrentCharacter, clearCurrentCharacter } = characterSlice.actions;

export default characterSlice.reducer;