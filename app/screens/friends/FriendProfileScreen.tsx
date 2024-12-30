import React, { FunctionComponent, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { db } from '@/app/firebase/firebaseConfig';

interface FriendProfileScreenProps {
    route: {
        params: {
            friendId: string;
        };
    };
}

interface Friend {
    id: string;
    username: string;
}

const FriendProfileScreen: FunctionComponent<FriendProfileScreenProps> = ({ route }) => {
    const { friendId } = route.params;
    const currentUserId = getAuth().currentUser?.uid;
    const [username, setUsername] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [commonFriends, setCommonFriends] = useState<Friend[]>([]);

    useEffect(() => {
        const fetchFriendProfile = async () => {
            try {
                const userRef = ref(db, `users/${friendId}`);
                const snapshot = await get(userRef);
                const friendData = snapshot.val();

                if (friendData) {
                    setUsername(friendData.username || 'Onbekend');
                    setBio(friendData.bio || 'Geen bio beschikbaar.');
                }
            } catch (error) {
                console.error('Error fetching friend profile:', error);
            }
        };

        const fetchCommonFriends = async () => {
            if (!currentUserId) return;

            try {
                const currentUserFriendsRef = ref(db, `users/${currentUserId}/friends`);
                const friendFriendsRef = ref(db, `users/${friendId}/friends`);

                const [currentUserFriendsSnap, friendFriendsSnap] = await Promise.all([
                    get(currentUserFriendsRef),
                    get(friendFriendsRef),
                ]);

                const currentUserFriends = currentUserFriendsSnap.val() || {};
                const friendFriends = friendFriendsSnap.val() || {};


                const commonFriendIds = Object.keys(currentUserFriends).filter((id) =>
                  Object.keys(friendFriends).includes(id)
                );

                const commonFriendsData = await Promise.all(
                  commonFriendIds.map(async (id) => {
                      const commonFriendRef = ref(db, `users/${id}`);
                      const commonFriendSnap = await get(commonFriendRef);
                      const commonFriendData = commonFriendSnap.val();
                      return { id, username: commonFriendData.username || 'Onbekend' };
                  })
                );

                setCommonFriends(commonFriendsData);
            } catch (error) {
                console.error('Error fetching common friends:', error);
            }
        };

        setLoading(true);
        Promise.all([fetchFriendProfile(), fetchCommonFriends()]).finally(() => {
            setLoading(false);
        });
    }, [friendId, currentUserId]);

    if (loading) {
        return (
          <View style={styles.center}>
              <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        );
    }

    return (
      <View style={styles.container}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{username.slice(0, 2).toUpperCase()}</Text>
          </View>

          {/* Profile Information */}
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.bio}>{bio}</Text>

          {/* Common Friends Section */}
          <Text style={styles.sectionTitle}>Gemeenschappelijke vrienden</Text>
          {commonFriends.length === 0 ? (
            <Text style={styles.noFriends}>Geen gemeenschappelijke vrienden gevonden.</Text>
          ) : (
            <FlatList
              data={commonFriends}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.friendItem}>
                    <Text style={styles.friendName}>{item.username}</Text>
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
        alignItems: 'center',
    },
    avatarContainer: {
        backgroundColor: '#4CAF50',
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    bio: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    noFriends: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
    friendItem: {
        backgroundColor: '#d5d4d4',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'stretch',
        alignItems: 'center',
    },
    friendName: {
        fontSize: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FriendProfileScreen;