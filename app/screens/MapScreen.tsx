import React, { useState, useEffect, FunctionComponent } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import GetLocation from 'react-native-get-location';
import { ref, query, orderByChild, get, onValue } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';

interface Rating {
    beerName: string;
    rating: number;
    bar: string;
    location: {
        latitude: number;
        longitude: number;
    };
    friendId?: string;
}

interface Location {
    latitude: number;
    longitude: number;
}

interface NavigationProps {
    navigate: (screen: string, params?: object) => void;
}

interface MapScreenProps {
    navigation: NavigationProps;
}

const fetchUsername = async (userId: string): Promise<string> => {
    return new Promise((resolve) => {
        const userRef = ref(db, `users/${userId}/username`);
        onValue(userRef, (snapshot) => {
            resolve(snapshot.val() || 'Unknown');
        });
    });
};

const MapScreen: FunctionComponent<MapScreenProps> = ({ navigation }) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [isLoadingRatings, setIsLoadingRatings] = useState<boolean>(true);
    const [friendUsernames, setFriendUsernames] = useState<{ [key: string]: string }>({});
    const currentUserId = getAuth().currentUser?.uid;

    useEffect(() => {
        const user = getAuth().currentUser;
        if (user) {
            const userId = user.uid;

            GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 60000,
            })
              .then((loc) => {
                  setLocation({
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                  });
                  void fetchRatings(userId);
              })
              .catch((error: Error) => {
                  console.log(error);
                  Alert.alert('Location Error', 'Unable to fetch your location. Please enable location services.');
              })
              .finally(() => setIsLoadingLocation(false));
        } else {
            Alert.alert('User Error', 'You are not logged in.');
            navigation.navigate('Home');
        }
    }, []);

    const fetchRatings = async (userId: string) => {
        try {
            const friendsRef = ref(db, `users/${userId}/friends`);
            const friendsSnapshot = await get(friendsRef);
            let friendsRatings: Rating[] = [];
            let tempFriendUsernames: { [key: string]: string } = {};

            if (friendsSnapshot.exists()) {
                const friendsData = friendsSnapshot.val();
                for (const friendId in friendsData) {
                    const username = await fetchUsername(friendId);
                    tempFriendUsernames[friendId] = username;

                    const friendReviewsRef = ref(db, `users/${friendId}/reviews`);
                    const friendReviewsSnapshot = await get(friendReviewsRef);
                    if (friendReviewsSnapshot.exists()) {
                        const friendReviewsData = friendReviewsSnapshot.val();
                        const friendReviewsArray: Rating[] = Object.entries(friendReviewsData).map(([key, rating]) => ({
                            ...rating,
                            key,
                            friendId,
                        }));
                        friendsRatings = friendsRatings.concat(friendReviewsArray.reverse());
                    }
                }
            }

            const ratingsRef = ref(db, `users/${userId}/reviews`);
            const ratingsQuery = query(ratingsRef, orderByChild('timestamp'));
            const snapshot = await get(ratingsQuery);
            let userRatings: Rating[] = [];

            if (snapshot.exists()) {
                const ratingsData = snapshot.val();
                userRatings = Object.entries(ratingsData).map(([key, rating]) => ({
                    ...rating,
                    key,
                    friendId: 'Ik',
                }));
            }

            const allRatings = [...friendsRatings, ...userRatings];
            setRatings(allRatings.reverse());
            setFriendUsernames(tempFriendUsernames);
        } catch (error) {
            console.error('Error fetching ratings: ', error);
            Alert.alert('Error', 'Failed to load ratings.');
        } finally {
            setIsLoadingRatings(false);
        }
    };

    const groupedRatings: Record<string, Rating[]> = {};

    ratings.forEach((rating) => {
        const key = `${rating.location.latitude},${rating.location.longitude}`;
        if (!groupedRatings[key]) {
            groupedRatings[key] = [];
        }
        groupedRatings[key].push(rating);
    });

    const handleMarkerPress = (lat: number, lng: number) => {
        const key = `${lat},${lng}`;
        const reviews = groupedRatings[key];

        if (reviews.length > 1) {
            const bar = reviews[0].bar;

            navigation.navigate('Reviews', {
                location: { lat, lng },
                bar,
                reviews,
            });
        }
    };

    const renderStars = (rating: number) => {
        const fullStars = '★'.repeat(rating);
        const emptyStars = '☆'.repeat(5 - rating);
        return fullStars + emptyStars;
    };

    return (
      <View style={styles.container}>
          {location && (
            <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                  }}
                  showsUserLocation={false}
                >
                    {/* User location marker */}
                    <Marker coordinate={location}>
                        <View style={styles.userLocationMarker} />
                    </Marker>

                    {/* Conditionally render review markers */}
                    {!isLoadingRatings &&
                      Object.entries(groupedRatings).map(([key, reviews]) => {
                          const [lat, lng] = key.split(',').map(Number);
                          const isFriend = reviews[0].friendId !== "Ik";
                          const title = isFriend
                            ? `${friendUsernames[reviews[0].friendId]} review`
                            : `${reviews[0].beerName} ${renderStars(reviews[0].rating)}`;

                          return (
                            <Marker
                              key={key}
                              coordinate={{ latitude: lat, longitude: lng }}
                              title={title}
                              description={reviews.length > 1 ? `${reviews.length} reviews` : `${reviews[0].bar}`}
                              onPress={() => handleMarkerPress(lat, lng)}
                              pinColor={isFriend ? 'blue' : 'red'}
                            />
                          );
                      })}
                </MapView>

                {/* Loading spinner over the map */}
                {isLoadingRatings && (
                  <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color="#0000ff" />
                  </View>
                )}
            </View>
          )}
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
        width: '100%',
    },
    userLocationMarker: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ff0000',
        borderWidth: 4,
        borderColor: '#b30000',
        borderStyle: 'solid',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MapScreen;