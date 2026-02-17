import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Item } from '../data/items';
import { EvolutionStage, PetSpecies, CollectionEntry, PET_SPECIES_DATA } from '../types/game';


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
    lastFocusDate: string | null;
    inventory: Record<string, number>;
    history: SessionRecord[];
    // Removed old customPetUri in favor of new system, but keeping for migration if needed or just replace?
    // Let's replace 'customPetUri' with the new system, or keep it as an override?
    // Plan: The new system drives the main avatar. 'customPetUri' can be a "skin" override if we want, or removed.
    // For now, let's keep it but prioritize the new system in UI if null.
    customPetUri: string | null;
    mood: 'happy' | 'sad' | 'sleeping';
    timerSettings: { focus: number; shortBreak: number; longBreak: number };
    strictMode: boolean;

    // New Evolution State
    evolutionStage: EvolutionStage;
    currentSpecies: PetSpecies;
    collection: CollectionEntry[];

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
    evolve: () => void; // Manually trigger evolution animation/state change if needed, or auto in levelUp
    collectAndRestart: () => void; // Store current adult to collection and reset to egg
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            coins: 10000, // TEST: Start with coins
            level: 15, // TEST: Start at Level 15 (Puppy -> Adult soon)
            streak: 0,
            lastFocusDate: null,
            inventory: {},
            history: [],
            customPetUri: null,
            mood: 'happy',
            timerSettings: { focus: 25, shortBreak: 5, longBreak: 15 },
            strictMode: false,
            evolutionStage: 'puppy', // TEST: Start as Puppy
            currentSpecies: 'shiba', // TEST: Start as Shiba
            collection: [],

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
                    set((state) => {
                        const newLevel = state.level + 1;
                        let newStage = state.evolutionStage;
                        let newSpecies = state.currentSpecies;

                        // Evolution Logic
                        // Level 6: Egg -> Puppy (Hatch)
                        if (newLevel === 6 && state.evolutionStage === 'egg') {
                            newStage = 'puppy';
                            // Random species (excluding 'unknown')
                            const speciesKeys = Object.keys(PET_SPECIES_DATA).filter(k => k !== 'unknown') as PetSpecies[];
                            newSpecies = speciesKeys[Math.floor(Math.random() * speciesKeys.length)];
                            Alert.alert("Oh?", "The Egg is hatching!");
                        }
                        // Level 16: Puppy -> Adult
                        else if (newLevel === 16 && state.evolutionStage === 'puppy') {
                            newStage = 'adult';
                            Alert.alert("Congratulations!", "Your puppy has grown into an adult dog!");
                        }

                        return {
                            coins: state.coins - cost,
                            level: newLevel,
                            evolutionStage: newStage,
                            currentSpecies: newSpecies,
                            mood: 'happy',
                        };
                    });
                }
            },

            evolve: () => {
                // Manual trigger if needed, or dev tool
                const { level, evolutionStage, currentSpecies } = get();
                // Logic already in levelUp, but could be separated if we want animations to trigger it
            },

            collectAndRestart: () => {
                const { currentSpecies, evolutionStage, collection } = get();
                if (evolutionStage !== 'adult') return;

                const newEntry: CollectionEntry = {
                    id: Date.now().toString(),
                    species: currentSpecies,
                    name: PET_SPECIES_DATA[currentSpecies].name,
                    obtainedDate: new Date().toISOString(),
                    description: PET_SPECIES_DATA[currentSpecies].description
                };

                set((state) => ({
                    collection: [...state.collection, newEntry],
                    level: 1,
                    evolutionStage: 'egg',
                    currentSpecies: 'unknown',
                    coins: state.coins, // Keep coins? Yes.
                    mood: 'happy'
                }));
                Alert.alert("New Friend!", "Dog added to your collection. Here is a new egg!");
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
            name: 'digital-detox-storage-v2', // Changed name to force reset (or use versioning if supported)
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
                    evolutionStage: (persistedState as GameState)?.evolutionStage ?? currentState.evolutionStage,
                    currentSpecies: (persistedState as GameState)?.currentSpecies ?? currentState.currentSpecies,
                    collection: (persistedState as GameState)?.collection ?? currentState.collection,
                };
            },
        }
    )
);
