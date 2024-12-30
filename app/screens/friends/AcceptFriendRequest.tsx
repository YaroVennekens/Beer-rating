import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, get, DataSnapshot } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';
import { fetchUsername, handleAcceptRequest, handleRejectRequest } from '@/app/screens/friends/function/FriendshipFunctions';
import { useNavigation } from '@react-navigation/native'; // For navigation

interface FriendRequest {
    id: string;
    senderId: string;
    senderName: string;
    status: string;
    avatarColor: string;
    mutualFriendsCount: number;
}

const fetchAvatarColor = async (userId: string): Promise<string> => {
    try {
        const userRef = ref(db, `users/${userId}/avatarColor`);
        const snapshot = await get(userRef);
        return snapshot.val() || '#4CAF50';
    } catch {
        return '#4CAF50';
    }
};

const fetchMutualFriends = async (userId: string, senderId: string): Promise<number> => {
    try {
        // Get the current user's friends list
        const userFriendsRef = ref(db, `friends/${userId}`);
        const userFriendsSnapshot = await get(userFriendsRef);
        const userFriends = userFriendsSnapshot.val() || [];

        // Get the sender's friends list
        const senderFriendsRef = ref(db, `friends/${senderId}`);
        const senderFriendsSnapshot = await get(senderFriendsRef);
        const senderFriends = senderFriendsSnapshot.val() || [];

        // Find common friends
        const mutualFriends = userFriends.filter((friend: string) => senderFriends.includes(friend));

        return mutualFriends.length;
    } catch (error) {
        console.error("Error fetching mutual friends:", error);
        return 0;
    }
};

const AcceptFriendRequest: FunctionComponent = () => {
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const currentUserId = getAuth().currentUser?.uid;
    const navigation = useNavigation();  // Use navigation

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                if (!currentUserId) return;

                const requestsRef = ref(db, 'friendRequests');
                onValue(requestsRef, async (snapshot: DataSnapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const requestsList: FriendRequest[] = await Promise.all(
                          Object.keys(data)
                            .filter((key) => data[key].receiverId === currentUserId && data[key].status === 'pending')
                            .map(async (key) => {
                                const senderId = data[key].senderId;
                                const mutualFriendsCount = await fetchMutualFriends(currentUserId, senderId);

                                return {
                                    id: key,
                                    senderId,
                                    senderName: await fetchUsername(senderId),
                                    status: data[key].status,
                                    avatarColor: await fetchAvatarColor(senderId),
                                    mutualFriendsCount,
                                };
                            })
                        );
                        setFriendRequests(requestsList);
                    } else {
                        setFriendRequests([]);
                    }
                });
            } catch (error) {
                Alert.alert('Error', 'Kan geen vrienden ophalen.');
            } finally {
                setLoading(false);
            }
        };

        fetchFriendRequests();
    }, [currentUserId]);

    const navigateToProfile = (senderId: string) => {
        navigation.navigate('FriendProfile', { senderId });  // Navigate to the Profile screen
    };

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Vriendschap verzoeken</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : friendRequests.length === 0 ? (
            <Text style={styles.noRequests}>Je hebt geen vriendschap verzoeken.</Text>
          ) : (
            <FlatList
              data={friendRequests}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => navigateToProfile(item.senderId)}>
                    <View style={styles.requestItem}>
                        <View style={[styles.avatarContainer, { backgroundColor: item.avatarColor }]}>
                            <Text style={styles.avatarText}>
                                {item.senderName.slice(0, 2).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.requestContent}>
                            <Text style={styles.senderName}>{item.senderName}</Text>
                            <Text style={styles.mutualFriends}>
                                {item.mutualFriendsCount} gemeenschappelijke vrienden
                            </Text>
                            <View style={styles.buttonGroup}>
                                <TouchableOpacity
                                  style={styles.acceptButton}
                                  onPress={() => handleAcceptRequest(item.id, item.senderId, currentUserId)}
                                >
                                    <Text style={styles.buttonText}>Accepteer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.rejectButton}
                                  onPress={() => handleRejectRequest(item.id, setFriendRequests)}
                                >
                                    <Text style={styles.buttonText}>Afwijzen</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
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
    noRequests: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 16,
    },
    requestItem: {
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
    senderName: {
        fontSize: 18,
    },
    requestContent: {
        flex: 1,
    },
    buttonGroup: {
        flexDirection: 'row',
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    rejectButton: {
        backgroundColor: '#F44336',
        padding: 8,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
    },
    mutualFriends: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
});

export default AcceptFriendRequest;