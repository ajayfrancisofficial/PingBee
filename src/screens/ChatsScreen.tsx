import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const ChatsScreen = () => {
    const navigation = useNavigation()
    return (
        <View style={styles.container} >
            <Pressable style={{ width: 100 }} onPress={() => {
                console.log('pressed');

                navigation.navigate('Chat', { name: 'Ajay', chatId: '1' })
            }}>
                <Text>go to a chat</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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

export default ChatsScreen;
