import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Item } from '../data/items';

interface SessionRecord {
    id: string;
    date: string;
    duration: number;
    reward: number;
}

interface GameState {
    // State
    coins: number;
    level: number;
    streak: number;
    lastFocusDate: string | null; // ISO Date string
    inventory: Record<string, number>; // ItemId -> Quantity
    history: SessionRecord[];
    customPetUri: string | null;
    mood: 'happy' | 'sad' | 'sleeping';
    timerSettings: { focus: number; shortBreak: number; longBreak: number }; // In Minutes
    strictMode: boolean; // New Setting

    // Actions
    addCoins: (amount: number) => void;
    levelUp: () => void;
    incrementStreak: () => void;
    resetStreak: () => void;
    calculateLevelUpCost: () => number;
    completeSession: (durationInMinutes: number) => void;
    buyItem: (item: Item) => boolean;
    useItem: (item: Item) => boolean;
    setCustomPetUri: (uri: string | null) => void;
    setMood: (mood: 'happy' | 'sad' | 'sleeping') => void;
    setTimerSettings: (settings: { focus: number; shortBreak: number; longBreak: number }) => void;
    setStrictMode: (enabled: boolean) => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            coins: 0,
            level: 1,
            streak: 0,
            lastFocusDate: null,
            inventory: {},
            history: [],
            customPetUri: null,
            mood: 'happy',
            timerSettings: { focus: 25, shortBreak: 5, longBreak: 15 },
            strictMode: false,

            addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

            setCustomPetUri: (uri) => set({ customPetUri: uri }),

            setMood: (mood) => set({ mood }),

            setTimerSettings: (settings) => set({ timerSettings: settings }),

            setStrictMode: (enabled) => set({ strictMode: enabled }),

            buyItem: (item) => {
                const { coins, inventory } = get();
                if (coins >= item.cost) {
                    const currentQty = inventory[item.id] || 0;

                    // Prevent buying duplicate accessories
                    if (item.type === 'accessory' && currentQty > 0) {
                        return false;
                    }

                    set({
                        coins: coins - item.cost,
                        inventory: { ...inventory, [item.id]: currentQty + 1 },
                        mood: 'happy',
                    });
                    return true;
                }
                return false;
            },

            useItem: (item) => {
                const { inventory, addCoins } = get();
                const currentQty = inventory[item.id] || 0;

                if (currentQty > 0 && item.type === 'food') {
                    // Consume effect
                    if (item.value) {
                        // Restore coins (Energy)
                        addCoins(item.value);
                    }

                    set((state) => ({
                        inventory: { ...state.inventory, [item.id]: currentQty - 1 },
                        mood: 'happy',
                    }));
                    return true;
                }
                return false;
            },

            completeSession: (durationInMinutes) => {
                const currentState = get();
                // Ensure defaults for safety
                const streak = Number(currentState.streak) || 0;
                const inventory = currentState.inventory || {};
                const baseReward = 10;

                // Streak Multiplier
                const streakMultiplier = Math.min(1 + streak * 0.1, 2.0);

                // Passive Effect: Cozy Bed (acc_bed) -> +10%
                const passiveMultiplier = inventory['acc_bed'] ? 1.1 : 1.0;

                const totalMultiplier = streakMultiplier * passiveMultiplier;

                if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
                    Alert.alert("Error", "Invalid duration passed to reward calc");
                    return;
                }

                // Calculate Raw Reward
                let rawReward = baseReward * durationInMinutes * totalMultiplier;

                // Safety: Ensure not NaN
                if (isNaN(rawReward)) {
                    console.error("Reward calc resulted in NaN. Defaulting to 1.");
                    rawReward = 1;
                }

                // Minimum reward of 1 coin to ensure positive feedback
                const reward = Math.max(1, Math.floor(rawReward));

                const newRecord: SessionRecord = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    duration: durationInMinutes,
                    reward: reward,
                };

                // Update state
                set((state) => ({
                    coins: (state.coins || 0) + reward,
                    streak: (state.streak || 0) + 1,
                    lastFocusDate: new Date().toISOString(),
                    history: [newRecord, ...state.history],
                    mood: 'happy',
                }));
            },

            levelUp: () => {
                const { coins, level, calculateLevelUpCost } = get();
                const cost = calculateLevelUpCost();

                if (coins >= cost) {
                    set((state) => ({
                        coins: state.coins - cost,
                        level: state.level + 1,
                        mood: 'happy',
                    }));
                }
            },

            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

            resetStreak: () => set({ streak: 0, mood: 'sad' }),

            calculateLevelUpCost: () => {
                const { level, inventory } = get();
                const baseCost = 100;
                const growthRate = 1.15;

                let cost = Math.floor(baseCost * Math.pow(growthRate, level));

                // Passive Effect: Golden Collar (acc_collar) -> -10% Cost
                if (inventory['acc_collar']) {
                    cost = Math.floor(cost * 0.9);
                }

                return cost;
            },
        }),
        {
            name: 'digital-detox-storage',
            storage: createJSONStorage(() => AsyncStorage),
            merge: (persistedState: any, currentState: GameState) => {
                return {
                    ...currentState,
                    ...(persistedState as GameState),
                    timerSettings: {
                        ...currentState.timerSettings,
                        ...(persistedState as GameState)?.timerSettings,
                    },
                    strictMode: (persistedState as GameState)?.strictMode ?? currentState.strictMode,
                };
            },
        }
    )
);
