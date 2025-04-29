// frontend/config.ts

// API endpoints
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

// Game configuration
export const MAX_INVENTORY_SIZE = 20;
export const MAX_QUEST_SLOTS = 10;
export const MAX_PARTY_SIZE = 4;

// Asset paths
export const ASSET_PATH = process.env.PUBLIC_URL + '/assets';
export const CHARACTER_SPRITES_PATH = ASSET_PATH + '/sprites/characters';
export const MONSTER_SPRITES_PATH = ASSET_PATH + '/sprites/monsters';
export const UI_SPRITES_PATH = ASSET_PATH + '/sprites/ui';

// Other configuration
export const DEFAULT_BATTLE_LOG_SIZE = 100; // Maximum number of log entries to keep
export const SESSION_TIMEOUT = 3600000; // Session timeout in milliseconds (1 hour)