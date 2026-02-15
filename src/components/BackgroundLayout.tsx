import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/useGameStore';

interface BackgroundLayoutProps {
    children: React.ReactNode;
}

export const BackgroundLayout = ({ children }: BackgroundLayoutProps) => {
    const { mood } = useGameStore();
    const [gradientColors, setGradientColors] = useState<readonly [string, string, ...string[]]>(['#ffffff', '#ffffff']);

    useEffect(() => {
        const updateGradient = () => {
            const hour = new Date().getHours();

            // Mood overrides time
            if (mood === 'sad') {
                setGradientColors(['#bdc3c7', '#2c3e50']); // Melancholy Grey
                return;
            }

            if (mood === 'sleeping') {
                setGradientColors(['#141E30', '#243B55']); // Deep Sleep
                return;
            }

            // Time-based (Healing Palette)
            if (hour >= 6 && hour < 12) {
                // Morning: Fresh & Airy (Lavender to Soft Blue)
                setGradientColors(['#E0C3FC', '#8EC5FC']);
            } else if (hour >= 12 && hour < 17) {
                // Afternoon: Energetic but Calm (Sky Blue)
                setGradientColors(['#89f7fe', '#66a6ff']);
            } else if (hour >= 17 && hour < 20) {
                // Sunset: Warm & cozy (Peach to Pink)
                setGradientColors(['#fad0c4', '#ffd1ff']);
            } else {
                // Night: Deep & Restful (Royal Purple to Navy)
                setGradientColors(['#4e4376', '#2b5876']);
            }
        };

        updateGradient();
        const interval = setInterval(updateGradient, 600000); // Check every 10 mins
        return () => clearInterval(interval);
    }, [mood]);

    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.container}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
