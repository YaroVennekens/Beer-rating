import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';
import {handleRemoveFriend} from '@/app/screens/friends/function/FriendshipFunctions'

interface Friend {
  id: string;
  username: string;
}

const FriendsListScreen: FunctionComponent = () => {
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



  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        if (!currentUserId) return;

        const friendsRef = ref(db, `users/${currentUserId}/friends`);
        onValue(friendsRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const friendsList: Friend[] = await Promise.all(
              Object.keys(data).map(async (friendId) => ({
                id: friendId,
                username: await fetchUsername(friendId),
              }))
            );
            setFriends(friendsList);
          } else {
            setFriends([]);
          }
        });
      } catch (error) {
        Alert.alert('Error', 'Kon vriendenlijst niet openen.');
      } finally {
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
              <Text style={styles.friendName}>{item.username}</Text>
              <Button
                title="Verwijder"
                color="#FF5722"
                onPress={() => handleRemoveFriend(item.id, currentUserId, setFriends)}
              />
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
  friendName: {
    fontSize: 18,
  },
});

export default FriendsListScreen;