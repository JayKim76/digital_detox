import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Item } from '../data/items';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding

interface ShopItemCardProps {
    item: Item;
    onBuy: (item: Item) => void;
    isOwned: boolean;
    ownedQuantity: number;
    disabled?: boolean;
}

export const ShopItemCard = ({ item, onBuy, isOwned, ownedQuantity, disabled }: ShopItemCardProps) => {
    return (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.5)']}
                style={styles.cardGradient}
            >
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{item.name.split(' ').pop()}</Text>
                </View>

                <Text style={styles.name} numberOfLines={1}>{item.name.replace(/ .*/, '')}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                {item.type === 'food' && (
                    <Text style={styles.effect}>⚡ +{item.value} Energy</Text>
                )}
                {item.type === 'accessory' && (
                    <Text style={styles.effect}>✨ Passive Effect</Text>
                )}

                <TouchableOpacity
                    style={[styles.buyButton, disabled && styles.disabledButton]}
                    onPress={() => onBuy(item)}
                    disabled={disabled}
                >
                    <Text style={styles.buyButtonText}>
                        {isOwned && item.type === 'accessory' ? 'Owned' : `${item.cost} 💰`}
                    </Text>
                </TouchableOpacity>

                {ownedQuantity > 0 && item.type !== 'accessory' && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>x{ownedQuantity}</Text>
                    </View>
                )}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        marginBottom: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardGradient: {
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        fontSize: 30,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: '#636e72',
        textAlign: 'center',
        marginBottom: 8,
        height: 32, // Fixed height for 2 lines
    },
    effect: {
        fontSize: 11,
        color: '#0984e3',
        fontWeight: '700',
        marginBottom: 10,
    },
    buyButton: {
        backgroundColor: '#00b894',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#b2bec3',
    },
    buyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fdcb6e',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#2d3436',
    },
});
