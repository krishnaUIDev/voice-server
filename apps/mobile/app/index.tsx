import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />
            <View style={styles.content}>
                <Text style={styles.title}>Voice Server</Text>
                <Text style={styles.subtitle}>The Premium Voice Experience</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Mobile App (Router)</Text>
                    <Text style={styles.cardText}>You are now using Expo Router for file-based navigation.</Text>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fb923c', // orange-400
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#94a3b8', // slate-400
        marginBottom: 40,
    },
    card: {
        backgroundColor: '#1e293b', // slate-800
        borderRadius: 16,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: '#334155', // slate-700
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc', // slate-50
        marginBottom: 12,
    },
    cardText: {
        fontSize: 16,
        color: '#cbd5e1', // slate-300
        marginBottom: 24,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#fb923c',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#0f172a',
        fontSize: 18,
        fontWeight: '600',
    },
});
