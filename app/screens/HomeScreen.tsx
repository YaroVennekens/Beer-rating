import React, { FunctionComponent, useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import { Rating } from '@/app/interrface/ReviewInterface';
import { formatDate, renderStars } from '@/app/components/RatingComponents';

type RootStackParamList = {
  Home: undefined;
  CreateRating: undefined;
  Overview: undefined;
  Maps: undefined;
  Login: undefined;
  Friends: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const generateColorFromUsername = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  const color = `hsl(${Math.abs(hash % 360)}, 70%, 50%)`;
  return color;
};

const HomeScreen: FunctionComponent<HomeScreenProps> = ({ navigation }) => {
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState<boolean>(true);  // Initially, the data is loading
  const [username, setUsername] = useState<string>('');
  const [avatarColor, setAvatarColor] = useState<string>(''); // Avatar color state
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    const userId = user.uid;

    // Fetch username
    const userRef = ref(db, `users/${userId}/username`);
    onValue(userRef, (snapshot) => {
      const usernameData = snapshot.val();
      if (usernameData) {
        setUsername(usernameData);
      }
    });

    // Fetch avatar color
    const avatarColorRef = ref(db, `users/${userId}/avatarColor`);
    onValue(avatarColorRef, (snapshot) => {
      const color = snapshot.val();
      setAvatarColor(color || generateColorFromUsername(username)); // Use the color from DB or generate
    });

    // Fetch recent ratings
    const ratingsRef = ref(db, `users/${userId}/reviews`);
    const unsubscribe = onValue(ratingsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const ratingsArray = Object.values(data).reverse();
      setRecentRatings(ratingsArray);
      setLoading(false); // Set loading to false once data is fetched
    });

    return () => unsubscribe();
  }, [navigation, user, username]); // Add `username` dependency to ensure the avatar color updates when the username changes

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.username}>Welkom, {username}!</Text>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: avatarColor }]} // Use avatarColor here
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileButtonText}>
            {username.slice(0, 2).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Display a loading spinner while data is being fetched */}
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <FlatList
            data={recentRatings}
            renderItem={({ item }) => (
              <View style={styles.ratingItem}>
                <Text style={styles.beerName}>{item.beerName.toUpperCase()}</Text>
                <Text style={styles.barName}>{item.bar}</Text>
                <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
                <Text style={styles.stars}>{renderStars(item.rating)}</Text>
              </View>
            )}
            keyExtractor={(_, index) => `rating-${index}`}
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateRating')}
        >
          <Text style={styles.addButtonText}>Review aanmaken</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.overviewButton}
            onPress={() => navigation.navigate('Friends')}
          >
            <Text style={styles.overviewButtonText}>Vrienden</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.overviewButton}
            onPress={() => navigation.navigate('Overview')}
          >
            <Text style={styles.overviewButtonText}>Overzicht</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.overviewButton}
            onPress={() => navigation.navigate('Maps')}
          >
            <Text style={styles.overviewButtonText}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  ratingItem: {
    backgroundColor: '#d5d4d4',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  beerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  barName: {
    fontSize: 14,
    color: '#555',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  stars: {
    fontSize: 14,
    color: '#ffb800',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  overviewButton: {
    backgroundColor: '#cac7c7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  overviewButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default HomeScreen;