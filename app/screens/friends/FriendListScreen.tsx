import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, get } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';
import { handleRemoveFriend } from '@/app/screens/friends/function/FriendshipFunctions';

interface Friend {
  id: string;
  username: string;
  avatarColor: string; // Add avatarColor to Friend interface
}

const FriendsListScreen: FunctionComponent<{ navigation: any }> = ({ navigation }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const currentUserId = getAuth().currentUser?.uid;

  const fetchUsername = async (userId: string): Promise<string> => {
    return new Promise((resolve) => {
      const userRef = ref(db, `users/${userId}/username`);
      onValue(userRef, (snapshot) => {
        resolve(snapshot.val() || 'Onbekend');
      });
    });
  };

  const fetchAvatarColor = async (userId: string): Promise<string> => {
    return new Promise((resolve) => {
      const userRef = ref(db, `users/${userId}/avatarColor`);
      onValue(userRef, (snapshot) => {
        resolve(snapshot.val() || '#4CAF50'); // Default color
      });
    });
  };

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        if (!currentUserId) return;

        const friendsRef = ref(db, `users/${currentUserId}/friends`);
        const listener = onValue(friendsRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const friendsList: Friend[] = await Promise.all(
              Object.keys(data).map(async (friendId) => {
                const username = await fetchUsername(friendId);
                const avatarColor = await fetchAvatarColor(friendId); // Fetch avatar color
                return { id: friendId, username, avatarColor };
              })
            );
            setFriends(friendsList);
          } else {
            setFriends([]);
          }
          setLoading(false);
        });

        return () => {
          // Cleanup listener on unmount
          listener();
        };
      } catch (error) {
        Alert.alert('Error', 'Kon vriendenlijst niet openen.');
        setLoading(false);
      }
    };

    void fetchFriends();
  }, [currentUserId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uw vrienden</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : friends.length === 0 ? (
        <Text style={styles.noFriends}>Je hebt nog geen vrienden.</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              {/* Display Avatar */}
              <View style={[styles.avatarContainer, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.avatarText}>
                  {item.username.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('FriendProfile', { friendId: item.id })}
                style={styles.friendDetails}
              >
                <Text style={styles.friendName}>{item.username}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFriend(item.id, currentUserId, setFriends)}
              >
                <Text style={styles.removeButtonText}>Verwijder</Text>
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
  noFriends: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  friendItem: {
    backgroundColor: '#d5d4d4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
  },
  removeButton: {
    backgroundColor: '#FF5722',
    padding: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FriendsListScreen;