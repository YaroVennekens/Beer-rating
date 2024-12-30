import React, { FunctionComponent, useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, DataSnapshot } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';
import { sendFriendRequest } from '@/app/screens/friends/function/FriendshipFunctions';

type RootStackParamList = {
    Home: undefined;
    CreateRating: undefined;
    Overview: undefined;
    Maps: undefined;
    Login: undefined;
    Friends: undefined;
    AddFriends: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface AddFriendsScreenProps {
    navigation: HomeScreenNavigationProp;
}

interface User {
    id: string;
    username: string;
    avatarColor: string; // Add avatarColor to User interface
}

const AddFriendsScreen: FunctionComponent<AddFriendsScreenProps> = ({ navigation }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [friends, setFriends] = useState<string[]>([]);  // Store the list of friend IDs
    const currentUserId = getAuth().currentUser?.uid;

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Fetching current user friends
                const friendsRef = ref(db, `users/${currentUserId}/friends`);
                onValue(friendsRef, (snapshot: DataSnapshot) => {
                    const friendsData = snapshot.val() || {};
                    const friendIds = Object.keys(friendsData); // Get all friend IDs
                    setFriends(friendIds);  // Store the friend IDs
                });

                // Fetching all users
                const usersRef = ref(db, 'users');
                onValue(usersRef, (snapshot: DataSnapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const usersList: User[] = Object.keys(data)
                          .map(key => ({
                              id: key,
                              username: data[key].username || 'Onbekend',
                              avatarColor: data[key].avatarColor || '#4CAF50', // Default color
                          }))
                          .filter(user => user.id !== currentUserId && !friends.includes(user.id)); // Exclude current user and friends
                        setUsers(usersList);
                    }
                });
            } catch (error) {
                Alert.alert('Error', 'Kon geen vrienden ophalen.');
            } finally {
                setLoading(false);
            }
        };

        void fetchUsers();
    }, [currentUserId, friends]);

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Vrienden toevoegen</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                    {/* Display Avatar */}
                    <View style={[styles.avatarContainer, { backgroundColor: item.avatarColor }]}>
                        <Text style={styles.avatarText}>
                            {item.username.slice(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.username}>{item.username}</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => sendFriendRequest(item.id, currentUserId)}
                    >
                        <Text style={styles.addButtonText}>Toevoegen</Text>
                    </TouchableOpacity>
                </View>
              )}
            />
          )}
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#d5d4d4',
        padding: 16,
        borderRadius: 8,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 18,
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: 14,
    },
});

export default AddFriendsScreen;