import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../..';



type FriendsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Friends'>;

interface FriendsScreenProps {
    navigation: FriendsScreenNavigationProp;
}

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
    return (
      <View style={styles.container}>
          <Text style={styles.title}>Vriendenbeheer</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('FriendsList')}
          >
              <Text style={styles.buttonText}>Vriendenlijst</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AddFriend')}
          >
              <Text style={styles.buttonText}>Vriend Toevoegen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AcceptFriendRequest')}
          >
              <Text style={styles.buttonText}>Vriendenverzoek Accepteren</Text>
          </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('FriendReviews')}
        >
          <Text style={styles.buttonText}>Vrienden reviews</Text>
        </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 32,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        width: '100%',
        marginVertical: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default FriendsScreen;