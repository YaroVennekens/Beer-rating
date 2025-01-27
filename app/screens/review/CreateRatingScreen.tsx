import React, { useState, useEffect, FunctionComponent } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { ref, push, serverTimestamp } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { db } from '@/app/firebase/firebaseConfig';
import GetLocation from 'react-native-get-location';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';


interface Place {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
}

interface PlacesResponse {
  results: Place[];
}



type CreateRatingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateRating'>;

interface CreateRatingScreenProps {
  navigation: CreateRatingScreenNavigationProp;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCzf_rcXRNIVUQ6_OvX7kgFqTFo6vzTOvI';

const CreateRatingScreen: FunctionComponent<CreateRatingScreenProps> = ({ navigation }) => {
  const [beerName, setBeerName] = useState('');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [bar, setBar] = useState('');
  const [publicSpots, setPublicSpots] = useState<string[]>([]);
  const [publicSpotsWithCoords, setPublicSpotsWithCoords] = useState<{ [key: string]: { lat: number, lng: number } }>({});
  const [isLoadingSpots, setIsLoadingSpots] = useState(false);

  useEffect(() => {
   
    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {
      if (result === RESULTS.GRANTED) {
        GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 60000,
        })
          .then((location) => {
            setLocation({
              latitude: location.latitude,
              longitude: location.longitude,
            });
            void fetchPublicSpots(location.latitude, location.longitude);
          })
          .catch((error: Error) => {
            console.warn(error.message);
            Alert.alert(
              'Locatie Error',
              'Je kon je locatie niet ophalen, staat je locatie service wel aan?'
            );
          });
      } else {
        Alert.alert('Permissie geweigerd', 'We hebben toegang nodig tot je locatie');
      }
    });
  }, []);

  const fetchPublicSpots = async (latitude: number, longitude: number) => {
    setIsLoadingSpots(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=bar&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as PlacesResponse;
      const spotsWithCoords = data.results.map((spot: Place) => ({
        name: spot.name,
        coords: spot.geometry.location,
      }));

      setPublicSpots(spotsWithCoords.map((spot) => spot.name));
      setPublicSpotsWithCoords(
        spotsWithCoords.reduce<{ [key: string]: { lat: number; lng: number } }>((acc, spot) => {
          acc[spot.name] = spot.coords;
          return acc;
        }, {})
      );
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Kon geen cafés ophalen.');
    } finally {
      setIsLoadingSpots(false);
    }
  };

  const handleSubmit = () => {
    if (!beerName || !rating || !review || !bar || !location) {
      Alert.alert('Error', 'Je moet alle velden in vullen');
      return;
    }

    const numericRating = parseFloat(rating);
    if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      Alert.alert('Error', 'Uw score moet tussen 0 en 5 liggen');
      return;
    }

    setIsSubmitting(true);

    const selectedSpotCoords = publicSpotsWithCoords[bar];


    const userId = getAuth().currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'Je moet ingelogd zijn om een beoordeling te maken');
      setIsSubmitting(false);
      return;
    }

    const userReviewsRef = ref(db, `users/${userId}/reviews`);

    setTimeout(() => {
      push(userReviewsRef, {
        beerName,
        rating: numericRating,
        review,
        bar,
        location: {
          latitude: selectedSpotCoords.lat,
          longitude: selectedSpotCoords.lng,
        },
        spotLatitude: selectedSpotCoords.lat,
        spotLongitude: selectedSpotCoords.lng,
        timestamp: serverTimestamp(),
      })
        .then(() => {
          setIsSubmitting(false);
          navigation.navigate('Home');
        })
        .catch((error: Error) => {
          setIsSubmitting(false);
          console.error('Error adding rating and review: ', error.message);
          Alert.alert('Error', 'Uw review is niet aangemaakt');
        });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Welke drankje heb je gedronken?"
        value={beerName}
        onChangeText={setBeerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Geef uw score van 0 tot 5 "
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Beschrijf een korte review"
        value={review}
        onChangeText={setReview}
        multiline
      />
      <View style={styles.pickerContainer}>
        <Text>Op welke locatie heb je dit drankje gedronken?</Text>
        {isLoadingSpots ? (
          <ActivityIndicator />
        ) : (
          <Picker
            selectedValue={bar}
            onValueChange={(itemValue: string) => setBar(itemValue)}
          >
            <Picker.Item label="Kies uw café" value="" />
            {publicSpots.length === 0 ? (
              <Picker.Item label="Geen café's gevonden" value="" />
            ) : (
              publicSpots.map((spot) => (
                <Picker.Item key={spot} label={spot} value={spot} />
              ))
            )}
          </Picker>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting ? styles.submitButtonDisabled : null,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Review toevoegen</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
  },
  locationInfo: {
    marginVertical: 16,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
});

export default CreateRatingScreen;