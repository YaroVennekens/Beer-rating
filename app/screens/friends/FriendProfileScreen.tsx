import React, { FunctionComponent, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';

interface FriendProfileScreenProps {
    route: {
        params: {
            friendId: string;
        };
    };
    navigation: any;
}

interface Friend {
    id: string;
    username: string;
}

interface Rating {
    key: string;
    beerName: string;
    bar: string;
    rating: number;
}

const FriendProfileScreen: FunctionComponent<FriendProfileScreenProps> = ({ route, navigation }) => {
    const { friendId } = route.params;
    const [username, setUsername] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [reviews, setReviews] = useState<Rating[]>([]);
    const [mutualFriends, setMutualFriends] = useState<Friend[]>([]);
    const [avatarColor, setAvatarColor] = useState<string>('#4CAF50'); // Default avatar color

    useEffect(() => {
        const fetchFriendData = async () => {
            try {
                const userRef = ref(db, `users/${friendId}`);
                const snapshot = await get(userRef);
                const friendData = snapshot.val();

                if (friendData) {
                    setUsername(friendData.username || 'Onbekend');
                    setBio(friendData.bio || 'Geen bio beschikbaar');
                    setAvatarColor(friendData.avatarColor || '#4CAF50'); // Set avatar color if available
                }
            } catch (error) {
                console.error('Error fetching friend data:', error);
            }
        };

        const fetchFriendReviews = async () => {
            try {
                const reviewsRef = ref(db, `users/${friendId}/reviews`);
                const snapshot = await get(reviewsRef);
                const reviewsData = snapshot.val();

                if (reviewsData) {
                    const reviewsArray: Rating[] = Object.entries(reviewsData).map(([key, review]) => ({
                        ...review,
                        key,
                    }));
                    setReviews(reviewsArray.reverse());
                }
            } catch (error) {
                console.error('Error fetching friend reviews:', error);
            }
        };

        const fetchMutualFriends = async () => {
            try {
                const currentUserId = getAuth().currentUser?.uid;
                if (!currentUserId) return;

                const userFriendsRef = ref(db, `users/${currentUserId}/friends`);
                const friendFriendsRef = ref(db, `users/${friendId}/friends`);

                const [userFriendsSnapshot, friendFriendsSnapshot] = await Promise.all([
                    get(userFriendsRef),
                    get(friendFriendsRef),
                ]);

                const userFriends = userFriendsSnapshot.val() || {};
                const friendFriends = friendFriendsSnapshot.val() || {};

                const mutualFriendIds = Object.keys(userFriends).filter((id) =>
                  Object.keys(friendFriends).includes(id)
                );

                const mutualFriendsData: Friend[] = await Promise.all(
                  mutualFriendIds.map(async (id) => {
                      const friendRef = ref(db, `users/${id}`);
                      const friendSnapshot = await get(friendRef);
                      const friendData = friendSnapshot.val();
                      return { id, username: friendData.username || 'Onbekend' };
                  })
                );

                setMutualFriends(mutualFriendsData);
            } catch (error) {
                console.error('Error fetching mutual friends:', error);
            }
        };

        setLoading(true);
        Promise.all([fetchFriendData(), fetchFriendReviews(), fetchMutualFriends()]).finally(() =>
          setLoading(false)
        );
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
          {/* Avatar */}
          <View style={[styles.avatarContainer, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{username.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>@{username.replaceAll(' ', '')}</Text>
          <Text style={styles.bio}>{bio}</Text>

          {/* Mutual Friends Section */}
          <Text style={styles.sectionTitle}>Gemeenschappelijke Vrienden</Text>
          {mutualFriends.length > 0 ? (
            mutualFriends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                onPress={() => navigation.navigate('FriendProfile', { friendId: friend.id })}
                style={styles.friendItem}
              >
                  <Text style={styles.friendName}>{friend.username}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>Geen gemeenschappelijke vrienden.</Text>
          )}

          {/* Reviews Section */}
          <Text style={styles.sectionTitle}>Reviews</Text>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <TouchableOpacity
                    key={review.key}
                    onPress={() => navigation.navigate('ReviewDetail', { rating: review })}
                    style={styles.ratingItem}
                  >
                      <Text style={styles.beerName}>{review.beerName.toUpperCase()}</Text>
                      <Text>{review.bar}</Text>
                      <Text>{'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>Geen reviews beschikbaar.</Text>
              )}
          </ScrollView>
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
    scrollViewContent: {
        paddingBottom: 16,
        width: '100%',
    },
    ratingItem: {
        backgroundColor: '#cdcdcd',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    beerName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendItem: {
        backgroundColor: '#e0e0e0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        width: '100%',
    },
    friendName: {
        fontSize: 16,
    },
});

export default FriendProfileScreen;