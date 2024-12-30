import React, { FunctionComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import {renderStars} from '@/app/components/RatingComponents'

type Rating = {
    beerName: string;
    bar: string;
    rating: number;
    review?: string;
};

type RootStackParamList = {
    Home: undefined;
    CreateRating: undefined;
    Overview: undefined;
    Maps: undefined;
    ReviewDetail: { rating: Rating }; // Route with its parameters
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
          <Text style={styles.text}>{rating.bar}</Text>
          <Text style={styles.text}>
              {renderStars(rating.rating)}
          </Text>
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
        marginBottom: 16,
    },
    text: {
        fontSize: 18,
        marginBottom: 8,
    },
});

export default ReviewDetailScreen;