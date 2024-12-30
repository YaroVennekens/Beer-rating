import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';
import { formatDate, renderStars } from '@/app/components/RatingComponents';

interface Review {
    id: string;
    content: string;
    rating: number;
    friendUsername: string;
    bar: string;
    drinks: string;
    beerName: string;
    timestamp: number;
    avatarColor: string; // Add avatarColor to Review interface
}

const FriendReviewsScreen: FunctionComponent = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const currentUserId = getAuth().currentUser?.uid;

    const fetchUsername = async (userId: string): Promise<string> => {
        try {
            const userRef = ref(db, `users/${userId}/username`);
            const snapshot = await get(userRef);
            return snapshot.val() || 'Unknown';
        } catch {
            return 'Unknown';
        }
    };

    const fetchAvatarColor = async (userId: string): Promise<string> => {
        try {
            const userRef = ref(db, `users/${userId}/avatarColor`);
            const snapshot = await get(userRef);
            return snapshot.val() || '#4CAF50'; // Default color
        } catch {
            return '#4CAF50'; // Default color
        }
    };

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                if (!currentUserId) return;

                const friendsRef = ref(db, `users/${currentUserId}/friends`);
                const friendsSnapshot = await get(friendsRef);
                const friendsData = friendsSnapshot.val();
                const allReviews: Review[] = [];

                if (friendsData) {
                    const friendPromises = Object.keys(friendsData).map(async (friendId) => {
                        const friendUsername = await fetchUsername(friendId);
                        const avatarColor = await fetchAvatarColor(friendId); // Fetch avatar color for each friend
                        const reviewsRef = ref(db, `users/${friendId}/reviews`);
                        const reviewsSnapshot = await get(reviewsRef);
                        const reviewsData = reviewsSnapshot.val();

                        if (reviewsData) {
                            const friendReviews: Review[] = Object.keys(reviewsData).map((reviewId) => ({
                                id: reviewId,
                                content: reviewsData[reviewId].review,
                                rating: reviewsData[reviewId].rating,
                                friendUsername,
                                bar: reviewsData[reviewId].bar,
                                drinks: reviewsData[reviewId].drinks,
                                beerName: reviewsData[reviewId].beerName || 'N/A',
                                timestamp: Number(reviewsData[reviewId].timestamp) || 0,
                                avatarColor, // Attach the avatar color to the review
                            }));
                            return friendReviews;
                        }
                        return [];
                    });

                    const friendReviews = await Promise.all(friendPromises);
                    allReviews.push(...friendReviews.flat());
                }

                const userReviewsRef = ref(db, `users/${currentUserId}/reviews`);
                const userReviewsSnapshot = await get(userReviewsRef);
                const userReviewsData = userReviewsSnapshot.val();

                if (userReviewsData) {
                    const userReviews: Review[] = Object.keys(userReviewsData).map((reviewId) => ({
                        id: reviewId,
                        content: userReviewsData[reviewId].review,
                        rating: userReviewsData[reviewId].rating,
                        friendUsername: 'Ik', // Temporarily set to 'Ik' for user reviews
                        bar: userReviewsData[reviewId].bar,
                        drinks: userReviewsData[reviewId].drinks,
                        beerName: userReviewsData[reviewId].beerName || 'N/A',
                        timestamp: Number(userReviewsData[reviewId].timestamp) || 0,
                        avatarColor: '#4CAF50', // Default color for user reviews
                    }));
                    allReviews.push(...userReviews);
                }

                const sortedReviews = allReviews.sort((a, b) => b.timestamp - a.timestamp);
                setReviews(sortedReviews);
            } catch (error) {
                Alert.alert('Error', 'Kan reviews van vrienden niet ophalen.');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();

        return () => {
            // Clean up Firebase listeners if any
            const friendsRef = ref(db, `users/${currentUserId}/friends`);

        };
    }, [currentUserId]);

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Online</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviews}>Je hebt nog geen reviews.</Text>
          ) : (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                    {/* Display Avatar */}
                    <View style={[styles.avatarContainer, { backgroundColor: item.avatarColor }]}>
                        <Text style={styles.avatarText}>
                            {item.friendUsername === 'Ik'
                              ? getAuth().currentUser?.displayName?.slice(0, 2).toUpperCase() // Use first two letters of the user's name
                              : item.friendUsername.slice(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.reviewContentContainer}>
                        <View style={styles.dateContainer}>
                            <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
                        </View>
                        <Text style={styles.friendName}>{item.friendUsername === 'Ik' ? 'Jij' : item.friendUsername}</Text>
                        <Text>{item.bar}</Text>
                        <Text>{renderStars(item.rating)}</Text>
                        <Text>Drankje: {item.beerName}</Text>
                        <Text style={styles.reviewContent}>{item.content}</Text>
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
    noReviews: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 16,
    },
    reviewItem: {
        backgroundColor: '#d5d4d4',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        position: 'relative',
        flexDirection: 'row',
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
    reviewContentContainer: {
        flex: 1,
    },
    dateContainer: {
        position: 'absolute',
        top: 8,
        right: 16,
    },
    date: {
        fontSize: 12,
        color: '#757575',
    },
    friendName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    reviewContent: {
        fontSize: 16,
        marginVertical: 8,
    },
});

export default FriendReviewsScreen;