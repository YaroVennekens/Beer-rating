import React, { FunctionComponent, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';

interface FriendProfileScreenProps {
    route: {
        params: {
            friendId: string;
        };
    };
}

const FriendProfileScreen: FunctionComponent<FriendProfileScreenProps> = ({ route }) => {
    const { friendId } = route.params;
    const [username, setUsername] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

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
            } finally {
                setLoading(false);
            }
        };

        void fetchFriendProfile();
    }, [friendId]);

    if (loading) {
        return (
          <View style={styles.center}>
              <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        );
    }

    return (
      <View style={styles.container}>
          <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{username.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.bio}>{bio}</Text>
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
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FriendProfileScreen;