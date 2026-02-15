export interface Item {
    id: string;
    name: string;
    type: 'food' | 'accessory';
    cost: number;
    description: string;
    effect?: string;
    value?: number; // Coin amount for food, multiplier for accessory
}

export const SHOP_ITEMS: Item[] = [
    // Foods (Consumables)
    {
        id: 'food_basic',
        name: 'Canned Tuna 🐟',
        type: 'food',
        cost: 50,
        description: 'Tasty snack. Restore 50 Coins.',
        value: 50
    },
    {
        id: 'food_premium',
        name: 'Premium Sashimi 🍣',
        type: 'food',
        cost: 150,
        description: 'Luxury meal. Restore 200 Coins!',
        value: 200
    },
    {
        id: 'toy_yarn',
        name: 'Yarn Ball 🧶',
        type: 'food', // Treated as consumable for "Playing"
        cost: 30,
        description: 'Play time! Small happiness boost.',
        value: 30
    },

    // Accessories (Passives)
    {
        id: 'acc_collar',
        name: 'Golden Collar 💎',
        type: 'accessory',
        cost: 1000,
        description: 'Shiny! Level Up costs 10% less.',
        effect: 'cost_reduction',
        value: 0.10 // 10% discount
    },
    {
        id: 'acc_bed',
        name: 'Cozy Bed 🛏️',
        type: 'accessory',
        cost: 500,
        description: 'Rest well. +10% Focus Rewards.',
        effect: 'reward_boost',
        value: 0.10 // 10% bonus
    },
];
