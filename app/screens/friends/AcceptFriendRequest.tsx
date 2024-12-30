
import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import {ref, onValue,  DataSnapshot} from 'firebase/database'
import { db } from '@/app/firebase/firebaseConfig';
import {
    fetchUsername,
    handleAcceptRequest,
    handleRejectRequest,
} from '@/app/screens/friends/function/FriendshipFunctions'


interface FriendRequest {
    id: string;
    senderId: string;
    senderName: string;
    status: string;
}

const AcceptFriendRequest: FunctionComponent = () => {
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const currentUserId = getAuth().currentUser?.uid;


    useEffect(() => {
        const fetchFriendRequests = async () => {
            setLoading(true);
            try {
                if (!currentUserId) return;

                const requestsRef = ref(db, 'friendRequests');
                onValue(requestsRef, async (snapshot: DataSnapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const requestsList: FriendRequest[] = await Promise.all(
                          Object.keys(data)
                            .filter(
                              (key) =>
                                data[key].receiverId === currentUserId &&
                                data[key].status === 'pending'
                            )
                            .map(async (key) => ({
                                id: key,
                                senderId: data[key].senderId,
                                senderName: await fetchUsername(data[key].senderId),
                                status: data[key].status,
                            }))
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

        void fetchFriendRequests();
    }, [currentUserId]);



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
                <View style={styles.requestItem}>
                    <Text style={styles.senderName}>{item.senderName}</Text>
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
    senderName: {
        fontSize: 18,
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
});

export default AcceptFriendRequest;