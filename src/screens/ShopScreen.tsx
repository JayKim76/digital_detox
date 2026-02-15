import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { SHOP_ITEMS, Item } from '../data/items';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { ShopItemCard } from '../components/ShopItemCard';
import { ArrowLeft, ShoppingBag, Zap } from 'lucide-react-native';

type ShopScreenProps = NativeStackScreenProps<RootStackParamList, 'Shop'>;

export const ShopScreen = ({ navigation }: ShopScreenProps) => {
    const { coins, buyItem, inventory } = useGameStore();
    const [activeTab, setActiveTab] = useState<'food' | 'accessory'>('food');

    const handleBuy = (item: Item) => {
        const ownedQty = inventory[item.id] || 0;

        if (item.type === 'accessory' && ownedQty > 0) {
            Alert.alert("Already owned", "You already have this accessory!");
            return;
        }

        if (coins < item.cost) {
            Alert.alert("Not Enough Coins", "You need more coins to buy this.");
            return;
        }

        const success = buyItem(item);
        if (success) {
            Alert.alert("Success!", `You bought ${item.name}`);
        } else {
            Alert.alert("Error", "Something went wrong.");
        }
    };

    const displayedItems = SHOP_ITEMS.filter(item => item.type === activeTab);

    return (
        <BackgroundLayout>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Shop</Text>
                    <View style={styles.coinBadge}>
                        <Text style={styles.coinText}>{coins} 💰</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'food' && styles.activeTab]}
                        onPress={() => setActiveTab('food')}
                    >
                        <ShoppingBag size={20} color={activeTab === 'food' ? '#fff' : '#666'} />
                        <Text style={[styles.tabText, activeTab === 'food' && styles.activeTabText]}>Consumables</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'accessory' && styles.activeTab]}
                        onPress={() => setActiveTab('accessory')}
                    >
                        <Zap size={20} color={activeTab === 'accessory' ? '#fff' : '#666'} />
                        <Text style={[styles.tabText, activeTab === 'accessory' && styles.activeTabText]}>Upgrades</Text>
                    </TouchableOpacity>
                </View>

                {/* Ad Button (Mock) */}
                <TouchableOpacity
                    style={styles.adButton}
                    onPress={async () => {
                        const success = await import('../services/AdService').then(m => m.AdService.showRewardedAd());
                        if (success) {
                            useGameStore.getState().addCoins(50);
                            Alert.alert("Reward!", "You earned 50 Coins! 💰");
                        }
                    }}
                >
                    <View style={styles.adContent}>
                        <Text style={styles.adText}>📺 Watch Ad</Text>
                        <Text style={styles.adReward}>+50 💰</Text>
                    </View>
                </TouchableOpacity>

                {/* Grid List */}
                <FlatList
                    data={displayedItems}
                    renderItem={({ item }) => (
                        <ShopItemCard
                            item={item}
                            onBuy={handleBuy}
                            isOwned={inventory[item.id] > 0}
                            ownedQuantity={inventory[item.id] || 0}
                            disabled={item.type === 'accessory' && (inventory[item.id] || 0) > 0}
                        />
                    )}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    key={activeTab} // Force re-render when switching tabs to reset scroll/layout
                />
            </View>
        </BackgroundLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    coinBadge: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.5)',
    },
    coinText: {
        color: '#FFD700',
        fontWeight: '700',
        fontSize: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 15,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 3,
    },
    activeTab: {
        backgroundColor: '#6C5CE7', // Distinct purple/blue for selection
    },
    tabText: {
        fontWeight: '600',
        color: '#636e72',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
    },
    adButton: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#6c5ce7',
        borderRadius: 15,
        padding: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    adContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    adText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    adReward: {
        color: '#FFD700',
        fontWeight: '800',
        fontSize: 18,
    },
});
