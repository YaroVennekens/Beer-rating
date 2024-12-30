import React, {FunctionComponent} from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native';
import {Rating} from '@/app/interrface/ReviewInterface'
import {renderStars} from '@/app/components/RatingComponents'



interface ReviewsScreenProps {
  route: {
    params: {
      reviews: Rating[];
      bar: string;
    };
  };
}

const ReviewsScreen: FunctionComponent<ReviewsScreenProps> = ({ route }) => {
  const { reviews, bar } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dit zijn al uw reviews in {bar}</Text>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewText}>
              {item.beerName}
            </Text>
            <Text>{item.bar}</Text>
            <Text>{renderStars(item.rating)}</Text>

            <Text>{item.review}</Text>
          </View>
        )}
      />
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
  reviewContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 8,
  },
  reviewText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReviewsScreen;