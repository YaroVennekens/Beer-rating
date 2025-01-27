import React, { useState, FunctionComponent } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import Slider from '@react-native-community/slider'; // Slider library import
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    GameSetup: undefined;
    PlayGame: { playerRoles: string[] };
};

type GameSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameSetup'>;

interface GameSetupScreenProps {
    navigation: GameSetupScreenNavigationProp;
}

const GameSetupScreen: FunctionComponent<GameSetupScreenProps> = ({ navigation }) => {
    const [playerCount, setPlayerCount] = useState<number>(3);
    const [mrWhiteCount, setMrWhiteCount] = useState<number>(1);
    const [detectiveCount, setDetectiveCount] = useState<number>(1);

    const handleStartGame = () => {
        if (playerCount < 3) {
            Alert.alert('Foutmelding', 'Om te starten zijn er minimaal 3 spelers nodig!');
            return;
        }

        if (mrWhiteCount < 1 || mrWhiteCount >= playerCount) {
            Alert.alert(
              'Foutmelding',
              `Het aantal Mr. White's moet minimaal 1 zijn en minder dan het totaal aantal spelers (${playerCount}).`
            );
            return;
        }

        if (detectiveCount < 1 || detectiveCount + mrWhiteCount >= playerCount) {
            Alert.alert(
              'Foutmelding',
              `Het aantal Detectives moet minimaal 1 zijn en samen met de Mr. White's minder dan het totaal aantal spelers (${playerCount}).`
            );
            return;
        }

        const roles = generateRoles(playerCount, mrWhiteCount, detectiveCount);
        navigation.navigate('PlayGame', { playerRoles: roles });
    };

    const generateRoles = (playerCount: number, mrWhiteCount: number, detectiveCount: number): string[] => {
        const mrWhiteRoles = new Array(mrWhiteCount).fill('Mr. White');
        const detectiveRoles = new Array(detectiveCount).fill('Detective');
        const remainingRoles = new Array(playerCount - mrWhiteCount - detectiveCount).fill('Citizen');

        return shuffleArray([...mrWhiteRoles, ...detectiveRoles, ...remainingRoles]);
    };

    const shuffleArray = (array: string[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Mr. White Minigame Setup</Text>

          {/* Slider: Aantal spelers */}
          <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                  Aantal spelers: <Text style={styles.number}>{playerCount}</Text>
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={3}
                maximumValue={10}
                step={1}
                value={playerCount}
                onValueChange={(value) => setPlayerCount(value)}
                thumbTintColor="#4CAF50"
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#d3d3d3"
              />
          </View>

          {/* Slider: Aantal Mr. White's */}
          <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                  Aantal Mr. White's: <Text style={styles.number}>{mrWhiteCount}</Text>
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={Math.floor(playerCount / 2)}
                step={1}
                value={mrWhiteCount}
                onValueChange={(value) => setMrWhiteCount(value)}
                thumbTintColor="#FF6347"
                minimumTrackTintColor="#FF6347"
                maximumTrackTintColor="#d3d3d3"
              />
          </View>

          {/* Slider: Aantal Detectives */}
          <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                  Aantal Detectives: <Text style={styles.number}>{detectiveCount}</Text>
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={playerCount - mrWhiteCount}
                step={1}
                value={detectiveCount}
                onValueChange={(value) => setDetectiveCount(value)}
                thumbTintColor="#1E90FF"
                minimumTrackTintColor="#1E90FF"
                maximumTrackTintColor="#d3d3d3"
              />
          </View>

          <TouchableOpacity style={styles.startGameButton} onPress={handleStartGame}>
              <Text style={styles.startGameButtonText}>Start Spel</Text>
          </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f7f7f7',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        textTransform: 'uppercase',
        color: '#444',
    },
    sliderContainer: {
        marginBottom: 24,
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    sliderLabel: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
        fontWeight: '600',
        color: '#555',
    },
    number: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#000',
    },
    slider: {
        width: '90%',
        height: 40,
    },
    startGameButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    startGameButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default GameSetupScreen;