import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { RouteProp } from '@react-navigation/native';
import { formatDate, renderStars } from '@/app/components/RatingComponents';
import { Rating } from '@/app/interface/ReviewInterface';
import { fetchUsername } from '@/app/screens/friends/function/FriendshipFunctions';

type RootStackParamList = {
  Home: undefined;
  CreateRating: undefined;
  Overview: undefined;
  Maps: undefined;
  ReviewDetail: { rating: Rating; friendId: string; avatarColor: string };
};

type ReviewDetailScreenRouteProp = RouteProp<RootStackParamList, 'ReviewDetail'>;

type ReviewDetailScreenProps = {
  route: ReviewDetailScreenRouteProp;
};

const ReviewDetailScreen: FunctionComponent<ReviewDetailScreenProps> = ({ route }) => {
  const { rating, friendId, avatarColor } = route.params;

  const [username, setUsername] = useState<string>('Laden...');

  // Fetch the username asynchronously
  useEffect(() => {
    const loadUsername = async () => {
      try {
        const fetchedUsername = await fetchUsername(friendId);
        setUsername(fetchedUsername || 'Onbekende gebruiker');
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername('Onbekende gebruiker');
      }
    };

    loadUsername();
  }, [friendId]);

  return (
    <View style={styles.container}>
      {/* Reviewer Info */}
      <View style={styles.reviewerContainer}>
        <View style={[styles.avatar, { backgroundColor: avatarColor || '#4CAF50' }]}>
          <Text style={styles.avatarText}>
            {(username === 'Unknown' ? 'Ik' : username.substring(0, 2)).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.reviewerName}>
          {username === 'Unknown' ? 'Mijn review' : username}
        </Text>
      </View>

      {/* Beer Info */}
      <Text style={styles.title}>{rating.beerName.toUpperCase()}</Text>
      <Text style={styles.date}>{formatDate(rating.timestamp)}</Text>
      <Text style={styles.subtitle}>Bar</Text>
      <Text style={styles.text}>{rating.bar || 'Geen bar informatie beschikbaar.'}</Text>

      {/* Stars Section */}
      <Text style={styles.subtitle}>Beoordeling</Text>
      <Text style={styles.text}>{renderStars(rating.rating)}</Text>

      {/* Review Section */}
      <Text style={styles.subtitle}>Omschrijving</Text>
      <Text style={styles.text}>
        {rating.review || 'Geen recensie beschikbaar.'}
      </Text>

      {/* Map Section */}
      <Text style={styles.subtitle}>Locatie</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: rating.spotLatitude,
          longitude: rating.spotLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: rating.spotLatitude,
            longitude: rating.spotLongitude,
          }}
          title={rating.beerName}
          description={renderStars(rating.rating)}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  reviewerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
});

export default ReviewDetailScreen;