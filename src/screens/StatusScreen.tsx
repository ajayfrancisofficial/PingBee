import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

const StatusScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.text}>StatusScreen</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingBottom: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default StatusScreen;
