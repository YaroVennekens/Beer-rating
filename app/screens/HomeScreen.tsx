
import React, { FunctionComponent, useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import { Rating } from '@/app/interrface/ReviewInterface';
import {formatDate, renderStars} from '@/app/components/RatingComponents'

type RootStackParamList = {
  Home: undefined;
  CreateRating: undefined;
  Overview: undefined;
  Maps: undefined;
  Login: undefined;
  Friends: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: FunctionComponent<HomeScreenProps> = ({ navigation }) => {
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    const userId = user.uid;
    navigation.setOptions({
      headerLeft: () => null,
    });

    const userRef = ref(db, `users/${userId}/username`);
    onValue(userRef, (snapshot) => {
      const usernameData = snapshot.val();
      if (usernameData) {
        setUsername(usernameData);
      }
    });

    const ratingsRef = ref(db, `users/${userId}/reviews`);
    const unsubscribe = onValue(ratingsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const ratingsArray = Object.values(data).reverse();
      setRecentRatings(ratingsArray);
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(getAuth());
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.username}>Welkom, {username}!</Text>
      <FlatList
        data={recentRatings}
        renderItem={({ item }) => (
          <View style={styles.ratingItem}>
            <Text>{item.beerName.toUpperCase()}</Text>
            <Text>{item.bar}</Text>
            <Text>{formatDate(item.timestamp)}</Text>
            <Text>{renderStars(item.rating)}</Text>
          </View>
        )}
        keyExtractor={(_, index) => `rating-${index}`}
      />

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

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.logoutButtonText}>Uitloggen</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  logoutButton: {
    backgroundColor: '#f44336',
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
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ratingItem: {
    backgroundColor: '#d5d4d4',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
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

});

export default HomeScreen;