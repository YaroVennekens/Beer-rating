import React, { FunctionComponent, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ref, query, orderByChild, onValue, remove } from 'firebase/database';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { db } from '@/app/firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import {Rating} from '@/app/interrface/ReviewInterface'

type RootStackParamList = {
    Home: undefined;
    CreateRating: undefined;
    Overview: undefined;
    ReviewDetail: { rating: Rating };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

interface RatingsData {
    [key: string]: Rating;
}

const HomeScreen: FunctionComponent<HomeScreenProps> = ({ navigation }) => {
    const [allRatings, setAllRatings] = useState<Rating[]>([]);
    const [bars, setBars] = useState<string[]>([]);
    const [selectedBar, setSelectedBar] = useState<string>('');

    useEffect(() => {
        const user = getAuth().currentUser;
        if (user) {
            const userId = user.uid;

            const ratingsRef = ref(db, `users/${userId}/reviews`); // Haal beoordelingen van de ingelogde gebruiker op
            const allRatingsQuery = query(ratingsRef, orderByChild('timestamp'));

            const unsubscribe = onValue(allRatingsQuery, (snapshot) => {
                const data = snapshot.val() as RatingsData | null;

                if (data) {
                    const ratingsArray: Rating[] = Object.entries(data).map(([key, rating]) => ({
                        ...rating,
                        key,
                    }));
                    setAllRatings(ratingsArray.reverse());

                    const uniqueBars = Array.from(new Set(ratingsArray.map((rating) => rating.bar)));
                    setBars(uniqueBars);
                }
            });

            return () => unsubscribe();
        }
    }, []);

    const deleteRating = (key: string) => {
        Alert.alert(
          'Verwijder Beoordeling',
          'Weet je zeker dat je deze beoordeling wilt verwijderen?',
          [
              {
                  text: 'Annuleren',
                  style: 'cancel',
              },
              {
                  text: 'Verwijderen',
                  onPress: () => {
                      const ratingRef = ref(db, `users/${getAuth().currentUser?.uid}/reviews/${key}`); // Verwijder beoordeling van de ingelogde gebruiker
                      remove(ratingRef)
                        .then(() => {
                            setAllRatings((prevRatings) => prevRatings.filter((rating) => rating.key !== key));
                        })
                        .catch((error: Error) => {
                            console.error('Fout bij verwijderen beoordeling: ', error.message);
                            Alert.alert('Fout', 'Er was een probleem met het verwijderen van de beoordeling');
                        });
                  },
              },
          ],
          { cancelable: true }
        );
    };

    const renderStars = (rating: number) => {
        const fullStars = '★'.repeat(rating);
        const emptyStars = '☆'.repeat(5 - rating);
        return fullStars + emptyStars;
    };

    const filteredRatings = selectedBar
      ? allRatings.filter((rating) => rating.bar === selectedBar)
      : allRatings;

    const groupedRatings: { [key: string]: Rating[] } = {};

    filteredRatings.forEach((rating) => {
        const firstLetter = rating.beerName.charAt(0).toUpperCase();
        if (!groupedRatings[firstLetter]) {
            groupedRatings[firstLetter] = [];
        }
        groupedRatings[firstLetter].push(rating);
    });

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Filter op Cafés</Text>
          <Picker
            selectedValue={selectedBar}
            onValueChange={(itemValue) => setSelectedBar(itemValue)}
            style={styles.picker}
          >
              <Picker.Item label="Alle cafés" value="" />
              {bars.map((bar) => (
                <Picker.Item key={bar} label={bar} value={bar} />
              ))}
          </Picker>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {Object.keys(groupedRatings).length > 0 ? (
                Object.keys(groupedRatings).sort().map((letter) => (
                  <View key={letter}>
                      <Text style={styles.sectionHeader}>{letter}</Text>
                      {groupedRatings[letter].map((rating) => (
                        <TouchableOpacity
                          key={rating.key}
                          onPress={() => navigation.navigate('ReviewDetail', { rating })}
                          onLongPress={() => deleteRating(rating.key)}
                          style={styles.ratingItem}
                        >
                            <Text style={styles.beerName}>{rating.beerName.toUpperCase()}</Text>
                            <Text>{rating.bar}</Text>
                            <Text>{renderStars(rating.rating)}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                ))
              ) : (
                <Text>Je hebt nog geen reviews aangemaakt</Text>
              )}
          </ScrollView>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateRating')}
          >
              <Text style={styles.addButtonText}>Voeg review toe</Text>
          </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    scrollViewContent: {
        paddingBottom: 16,
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
    picker: {
        marginVertical: 16,
        height: 50,
        width: '100%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
});

export default HomeScreen;