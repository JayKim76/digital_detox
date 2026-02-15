import React from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type StatsScreenProps = NativeStackScreenProps<RootStackParamList, 'Stats'>;

export const StatsScreen = ({ navigation }: StatsScreenProps) => {
    const { history, streak } = useGameStore();

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.recordItem}>
            <View>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}</Text>
                <Text style={styles.details}>{item.duration} min focus</Text>
            </View>
            <Text style={styles.reward}>+{item.reward} 💰</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Button title="← Back" onPress={() => navigation.goBack()} />
                <Text style={styles.title}>History</Text>
                <Text style={styles.subtitle}>Current Streak: {streak} 🔥</Text>
            </View>

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No sessions yet.</Text>
                    <Text style={styles.emptySubText}>Start focusing to build your history!</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 40,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#FF5722',
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 20,
    },
    recordItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    date: {
        fontSize: 16,
        fontWeight: '500',
    },
    details: {
        fontSize: 14,
        color: '#888',
    },
    reward: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 20,
        color: '#ccc',
        fontWeight: 'bold',
    },
    emptySubText: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 10,
    }
});
