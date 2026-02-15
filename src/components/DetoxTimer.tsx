import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, AppState, AppStateStatus, Alert, TouchableOpacity, Modal, TextInput, Switch } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { Settings, X } from 'lucide-react-native';

type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';



export const DetoxTimer = () => {
    const { timerSettings, strictMode, setTimerSettings, setStrictMode, completeSession, resetStreak } = useGameStore();

    const [mode, setMode] = useState<TimerMode>('FOCUS');
    // Initialize timeLeft with correct default from store
    const [timeLeft, setTimeLeft] = useState(timerSettings.focus * 60);
    const [isActive, setIsActive] = useState(false);
    const [endTime, setEndTime] = useState<number | null>(null);

    // Strict Mode: Background Timestamp
    const backgroundTime = useRef<number | null>(null);

    // Settings Modal State
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [tempSettings, setTempSettings] = useState({
        focus: timerSettings.focus.toString(),
        shortBreak: timerSettings.shortBreak.toString(),
        longBreak: timerSettings.longBreak.toString(),
        strictMode: strictMode,
    });

    const handleTimerComplete = React.useCallback(() => {
        setIsActive(false);
        setEndTime(null);

        if (mode === 'FOCUS') {
            let duration = Number(timerSettings.focus);

            // Safety check for NaN or <= 0
            if (isNaN(duration) || duration <= 0) {
                console.warn("Invalid duration detected " + duration + ", defaulting to 25");
                duration = 25;
            }

            completeSession(duration);

            // Monetization: Offer Double Reward
            Alert.alert(
                "Focus Complete! 🎉",
                "Great job! You earned rewards.\n\nWatch an Ad to DOUBLE your coins?",
                [
                    { text: "No thanks", style: "cancel" },
                    {
                        text: "Double It! 📺",
                        onPress: async () => {
                            const success = await import('../services/AdService').then(m => m.AdService.showRewardedAd());
                            if (success) {
                                // "Double" means adding the same amount again (since completeSession already added 1x)
                                // We need to calculate what 1x was.
                                // Simplification: Just add a flat bonus or re-calculate.
                                // To be accurate, let's just add a "Bonus" of 50 coins for now to keep it simple and safe,
                                // or try to read the last reward from store (complex).
                                // Let's simplify: "Watch Ad for +50 Bonus Coins"
                                useGameStore.getState().addCoins(50);
                                Alert.alert("Double Reward!", "You received a bonus 50 Coins! 💰");
                            }
                        }
                    }
                ]
            );

            setMode('SHORT_BREAK');
        } else {
            Alert.alert("Break Over! ☕", "Ready to focus again?");
            setMode('FOCUS');
        }
    }, [mode, timerSettings, completeSession]);

    // Update timeLeft when settings or mode change (only if timer is NOT active)
    useEffect(() => {
        if (!isActive) {
            const minutes = mode === 'FOCUS' ? timerSettings.focus
                : mode === 'SHORT_BREAK' ? timerSettings.shortBreak
                    : timerSettings.longBreak;
            setTimeLeft(minutes * 60);
        }
    }, [timerSettings, mode, isActive]);

    // AppState Listener for Distraction Detection
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (mode === 'FOCUS' && isActive && endTime) {
                // Strict Mode Handling
                if (strictMode) {
                    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                        // Gone to background
                        backgroundTime.current = Date.now();
                        console.log("App backgrounded at:", backgroundTime.current);
                    } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                        // Returned to foreground
                        if (backgroundTime.current) {
                            const diff = Date.now() - backgroundTime.current;
                            console.log("App returned. Diff:", diff);

                            if (diff > 10000) { // 10 seconds Grace Period
                                // Failed!
                                setIsActive(false);
                                setEndTime(null);
                                resetStreak();
                                backgroundTime.current = null;
                                Alert.alert("Session Failed 🚫", "You left the app for too long in Strict Mode!\nStreak reset.");
                                return; // Stop processing
                            } else {
                                // Warning
                                Alert.alert("Careful! ⚠️", "Keep the app open to stay focused!");
                            }
                            backgroundTime.current = null;
                        }
                    }
                }

                // Normal Timer Update on Return
                if (nextAppState === 'active') {
                    const now = Date.now();
                    if (now >= endTime) {
                        setIsActive(false);
                        setTimeLeft(0);
                        handleTimerComplete();
                    } else {
                        setTimeLeft(Math.ceil((endTime - now) / 1000));
                    }
                }
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [isActive, mode, endTime, handleTimerComplete, strictMode, resetStreak]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && endTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const remaining = Math.ceil((endTime - now) / 1000);

                if (remaining <= 0) {
                    setTimeLeft(0);
                    handleTimerComplete();
                    clearInterval(interval);
                } else {
                    setTimeLeft(remaining);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, endTime, handleTimerComplete]);



    const toggleTimer = () => {
        if (isActive) {
            // Pause/Stop
            if (mode === 'FOCUS' && strictMode) {
                Alert.alert(
                    "Give Up?",
                    "Stopping in Strict Mode will reset your streak!",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Stop", style: "destructive", onPress: () => {
                                setIsActive(false);
                                setEndTime(null);
                                resetStreak();
                            }
                        }
                    ]
                );
                return;
            }
            setIsActive(false);
            setEndTime(null);
        } else {
            // Start
            setIsActive(true);
            setEndTime(Date.now() + timeLeft * 1000);
        }
    };

    const switchMode = (newMode: TimerMode) => {
        if (isActive) {
            Alert.alert("Timer Running", "Stop the timer to switch modes.");
            return;
        }
        setMode(newMode);
        // Time update handled by useEffect
    };

    const handleGiveUp = () => {
        Alert.alert(
            "Give Up?",
            "If you stop now, you lose your progress.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Give Up",
                    style: "destructive",
                    onPress: () => {
                        setIsActive(false);
                        setEndTime(null);
                        if (mode === 'FOCUS') resetStreak();
                        // Time update handled by useEffect
                    }
                }
            ]
        );
    };

    const openSettings = () => {
        if (isActive) {
            Alert.alert("Cannot Edit", "Please stop the timer to change settings.");
            return;
        }
        setTempSettings({
            focus: timerSettings.focus.toString(),
            shortBreak: timerSettings.shortBreak.toString(),
            longBreak: timerSettings.longBreak.toString(),
            strictMode: strictMode,
        });
        setIsSettingsVisible(true);
    };

    const saveSettings = () => {
        const focus = parseFloat(tempSettings.focus) || 25;
        const shortBreak = parseFloat(tempSettings.shortBreak) || 5;
        const longBreak = parseFloat(tempSettings.longBreak) || 15;

        setTimerSettings({ focus, shortBreak, longBreak });
        setStrictMode(tempSettings.strictMode);
        setIsSettingsVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Settings Button */}
            <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
                <Settings color="white" size={24} />
            </TouchableOpacity>
            {/* Mode Selector */}
            <View style={styles.modeContainer}>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'FOCUS' && styles.activeMode]}
                    onPress={() => switchMode('FOCUS')}
                >
                    <Text style={[styles.modeText, mode === 'FOCUS' && styles.activeModeText]}>Focus</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'SHORT_BREAK' && styles.activeMode]}
                    onPress={() => switchMode('SHORT_BREAK')}
                >
                    <Text style={[styles.modeText, mode === 'SHORT_BREAK' && styles.activeModeText]}>Short</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'LONG_BREAK' && styles.activeMode]}
                    onPress={() => switchMode('LONG_BREAK')}
                >
                    <Text style={[styles.modeText, mode === 'LONG_BREAK' && styles.activeModeText]}>Long</Text>
                </TouchableOpacity>
            </View>

            <Text style={[
                styles.timer,
                mode !== 'FOCUS' && { color: '#4CAF50' } // Green for break
            ]}>
                {formatTime(timeLeft)}
            </Text>

            <View style={styles.buttonGroup}>
                {!isActive ? (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: mode === 'FOCUS' ? '#2196F3' : '#4CAF50' }]}
                        onPress={toggleTimer}
                    >
                        <Text style={styles.actionButtonText}>Start {mode === 'FOCUS' ? 'Focus' : 'Break'}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#FF5252' }]}
                        onPress={handleGiveUp}
                    >
                        <Text style={styles.actionButtonText}>Give Up</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Settings Modal */}
            <Modal
                visible={isSettingsVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsSettingsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Timer Settings ⏳</Text>
                            <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
                                <X color="#333" size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.strictModeContainer}>
                            <View>
                                <Text style={styles.strictModeLabel}>Strict Mode 🚫</Text>
                                <Text style={styles.strictModeDescription}>Reset streak if you leave app</Text>
                            </View>
                            <Switch
                                value={!!tempSettings.strictMode}
                                onValueChange={(val) => setTempSettings(prev => ({ ...prev, strictMode: val }))}
                                trackColor={{ false: "#767577", true: "#ff6b6b" }}
                                thumbColor={tempSettings.strictMode ? "#fff" : "#f4f3f4"}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Focus (min)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="decimal-pad"
                                value={tempSettings.focus}
                                onChangeText={(t) => setTempSettings(prev => ({ ...prev, focus: t }))}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Short Break (min)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={tempSettings.shortBreak}
                                onChangeText={(t) => setTempSettings(prev => ({ ...prev, shortBreak: t }))}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Long Break (min)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={tempSettings.longBreak}
                                onChangeText={(t) => setTempSettings(prev => ({ ...prev, longBreak: t }))}
                            />
                        </View>



                        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
                            <Text style={styles.saveButtonText}>Save Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 5,
        width: '100%',
    },
    settingsButton: {
        position: 'absolute',
        top: 0,
        right: 20,
        padding: 8,
        zIndex: 10,
    },
    modeContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        borderRadius: 25,
        padding: 3,
        gap: 6,
    },
    modeButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 70,
        alignItems: 'center',
    },
    activeMode: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    modeText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.65)',
        fontWeight: '600',
    },
    activeModeText: {
        color: '#4A90E2',
        fontWeight: '800',
    },
    timer: {
        fontSize: 56,
        fontWeight: '200',
        marginBottom: 20,
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 8,
        letterSpacing: 2,
    },
    buttonGroup: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
    actionButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        minWidth: 150,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    saveButton: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    strictModeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    strictModeLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D32F2F',
    },
    strictModeDescription: {
        fontSize: 12,
        color: '#E57373',
        marginTop: 2,
    }
});
