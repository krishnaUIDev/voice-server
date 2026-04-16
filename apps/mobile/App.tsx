import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cilantro</Text>
            <Text style={styles.subtitle}>The Fresh Finish for Pulao</Text>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4ade80',
    },
    subtitle: {
        fontSize: 20,
        color: '#94a3b8',
        marginTop: 10,
    }
});
