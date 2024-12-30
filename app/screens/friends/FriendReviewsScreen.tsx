import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, get, onValue, off } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';
import {formatDate, renderStars} from '@/app/components/RatingComponents'

interface Review {
    id: string;
    content: string;
    rating: number;
    friendUsername: string;
    bar: string;
    drinks: string;
    beerName: string;
    timestamp: number;
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
                        friendUsername: 'Ik',
                        bar: userReviewsData[reviewId].bar,
                        drinks: userReviewsData[reviewId].drinks,
                        beerName: userReviewsData[reviewId].beerName || 'N/A',
                        timestamp: Number(userReviewsData[reviewId].timestamp) || 0,
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
            off(friendsRef);
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
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
                    </View>
                    <Text style={styles.friendName}>{item.friendUsername}</Text>
                    <Text>{item.bar}</Text>
                    <Text>{renderStars(item.rating)}</Text>
                    <Text>Drankje: {item.beerName}</Text>
                    <Text style={styles.reviewContent}>{item.content}</Text>
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