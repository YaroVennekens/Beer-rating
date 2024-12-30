import React, { FunctionComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps'; // Import Marker
import {formatDate, renderStars} from '@/app/components/RatingComponents'
import { Rating } from '@/app/interrface/ReviewInterface';

type RootStackParamList = {
  Home: undefined;
  CreateRating: undefined;
  Overview: undefined;
  Maps: undefined;
  ReviewDetail: { rating: Rating };
};

type ReviewDetailScreenRouteProp = RouteProp<RootStackParamList, 'ReviewDetail'>;

type ReviewDetailScreenProps = {
  route: ReviewDetailScreenRouteProp;
};

const ReviewDetailScreen: FunctionComponent<ReviewDetailScreenProps> = ({ route }) => {
  const { rating } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{rating.beerName.toUpperCase()}</Text>
      <Text>{formatDate(rating.timestamp)}</Text>
      <Text style={styles.text}>{rating.bar}</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: rating.spotLatitude,
          longitude: rating.spotLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
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
      <Text style={styles.text}>
        {renderStars(rating.rating)}
      </Text>
      <Text>Omschrijving</Text>
      <Text style={styles.text}>
        {rating.review || 'Geen recensie beschikbaar.'}
      </Text>

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
    marginBottom: 2,
  },
  text: {
    fontSize: 20,
    marginBottom: 8,
  },
  map: {
    width: 300,
    height: 300,
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
});

export default ReviewDetailScreen;