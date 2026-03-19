import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { useFetchChats, Chat } from '../hooks/queries/useChats';

const ChatsScreen = () => {
    const navigation = useNavigation<any>()
    const { data: chats, isPending, isError } = useFetchChats()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => isPending ? <ActivityIndicator size="small" color="#000" /> : null,
        })
    }, [navigation, isPending])

    const renderItem = ({ item }: { item: Chat }) => (
        <Pressable style={styles.chatItem} onPress={() => {
            navigation.navigate('Chat', { name: item.name, chatId: item.id })
        }}>
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </Pressable>
    )

    return (
        <View style={styles.container} >
            {isError ? (
                <Text style={styles.errorText}>Error fetching chats</Text>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
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
    },
    list: {
        padding: 16,
    },
    chatItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'red',
    }
});

export default ChatsScreen;
