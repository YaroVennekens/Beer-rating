import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Image,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { StackScreenProps } from '@react-navigation/stack';

type RootStackParamList = {
    GameSetup: undefined;
    PlayGame: { playerRoles: string[] };
};

type PlayGameScreenProps = StackScreenProps<RootStackParamList, 'PlayGame'>;

const wordPairs = [
    { realWord: 'huis', similarWord: 'flat' },
    // Add more word pairs here
];

const PlayGameScreen: React.FC<PlayGameScreenProps> = ({ route, navigation }) => {
    const { playerRoles } = route.params;

    const [cardNames, setCardNames] = useState<string[]>(Array(playerRoles.length).fill(''));
    const [playerSelfies, setPlayerSelfies] = useState<(string | null)[]>(
      Array(playerRoles.length).fill(null)
    );
    const [modalVisible, setModalVisible] = useState(false);
    const [nameInputModalVisible, setNameInputModalVisible] = useState(false);
    const [kickPlayerModalVisible, setKickPlayerModalVisible] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null);
    const [playerName, setPlayerName] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [activePlayers, setActivePlayers] = useState(
      playerRoles.map((role, index) => ({ index, role, cardText: '', selfie: null }))
    );
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [isMrWhiteDiscovered, setIsMrWhiteDiscovered] = useState(false);
    const [mrWhiteGuess, setMrWhiteGuess] = useState('');

    const [selectedWords] = useState(() => {
        const randomIndex = Math.floor(Math.random() * wordPairs.length);
        return wordPairs[randomIndex];
    });

    const handleCardPress = (index: number) => {
        setCurrentCardIndex(index);
        setNameInputModalVisible(true);
    };

    const handleAddSelfie = async () => {
        const result = await ImagePicker.launchCamera({
            mediaType: 'photo',
            cameraType: 'front',
        });

        if (result.assets && result.assets.length > 0) {
            const photoUri = result.assets[0].uri || null;

            const updatedSelfies = [...playerSelfies];
            if (currentCardIndex !== null) {
                updatedSelfies[currentCardIndex] = photoUri;

                const updatedPlayers = [...activePlayers];
                updatedPlayers[currentCardIndex].selfie = photoUri;
                setActivePlayers(updatedPlayers);
            }

            setPlayerSelfies(updatedSelfies);
        } else {
            console.log('Geen selfie geselecteerd');
        }
    };

    const handleNameSubmit = () => {
        if (!playerName.trim()) {
            alert('Je moet een spelersnaam invullen!');
            return;
        }

        const role = activePlayers[currentCardIndex ?? 0].role;
        let wordToShow = '';

        if (role === 'Citizen') {
            wordToShow = selectedWords.realWord;
        } else if (role === 'Detective') {
            wordToShow = selectedWords.similarWord;
        } else if (role === 'Mr. White') {
            wordToShow = 'Mr. White';
        }

        const updatedCardNames = [...cardNames];
        if (currentCardIndex !== null) {
            updatedCardNames[currentCardIndex] = playerName;

            const updatedPlayers = [...activePlayers];
            updatedPlayers[currentCardIndex].cardText = playerName;
            setActivePlayers(updatedPlayers);
        }

        setCardNames(updatedCardNames);
        setSelectedRole(wordToShow);
        setNameInputModalVisible(false);
        setModalVisible(true);

        setTimeout(() => {
            setModalVisible(false);
            setSelectedRole(null);
            setPlayerName('');
            setCurrentCardIndex(null);
        }, 1000);
    };

    const handleKickPlayer = (playerIndex: number) => {
        const player = activePlayers[playerIndex];
        if (!player) return;

        if (player.role === 'Mr. White') {
            setIsMrWhiteDiscovered(true);
            setKickPlayerModalVisible(false);
            return;
        } else {
            alert(`Speler gekickt: ${player.cardText || `Speler ${playerIndex + 1}`}`);
        }

        const updatedPlayers = activePlayers.filter((_, index) => index !== playerIndex);
        setActivePlayers(updatedPlayers);
        setKickPlayerModalVisible(false);
    };

    const handleMrWhiteGuess = () => {
        if (mrWhiteGuess.toLowerCase() === selectedWords.realWord.toLowerCase()) {
            alert('Mr. White heeft gewonnen!');
            setIsGameEnded(true);
        } else {
            alert('Mr. White heeft verloren!');
            setIsGameEnded(true);
        }
        setIsMrWhiteDiscovered(false);
    };

    const handleEndGame = () => {
        setIsGameEnded(true);
    };

    if (isGameEnded) {
        return (
          <View style={styles.endGameContainer}>
              <Text style={styles.endGameTitle}>Het spel is afgelopen!</Text>
              <Text style={styles.endGameMessage}>Je hebt Mr. White ontdekt!</Text>

              <TouchableOpacity
                style={styles.restartGameButton}
                onPress={() => navigation.navigate('GameSetup')}
              >
                  <Text style={styles.restartGameText}>Terug naar Start</Text>
              </TouchableOpacity>
          </View>
        );
    }

    if (isMrWhiteDiscovered) {
        return (
          <View style={styles.container}>
              <Text style={styles.title}>Mr. White is ontdekt!</Text>
              <Text style={styles.subtitle}>Mr. White, raad het echte woord:</Text>
              <TextInput
                style={styles.input}
                value={mrWhiteGuess}
                onChangeText={setMrWhiteGuess}
                placeholder="Voer het woord in"
              />
              <TouchableOpacity style={styles.button} onPress={handleMrWhiteGuess}>
                  <Text style={styles.buttonText}>Bevestig</Text>
              </TouchableOpacity>
          </View>
        );
    }

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Mr. White</Text>

          <FlatList
            data={activePlayers}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    if (!item.cardText) {
                        handleCardPress(item.index);
                    }
                }}
              >
                  {item.selfie ? (
                    <Image source={{ uri: item.selfie }} style={styles.cardSelfie} />
                  ) : item.cardText ? (
                    <Text style={styles.cardInitials}>
                        {item.cardText.slice(0, 2).toUpperCase()}
                    </Text>
                  ) : (
                    <>
                        <Text style={styles.cardText}>?</Text>
                    </>
                  )}
                  {item.cardText ? (
                    <Text style={styles.cardName}>{item.cardText}</Text>
                  ) : null}
              </TouchableOpacity>
            )}
            keyExtractor={(_, index) => index.toString()}
            numColumns={2}
          />

          {activePlayers.every((player) => player.cardText !== '') && (
            <TouchableOpacity
              style={styles.kickPlayerButton}
              onPress={() => setKickPlayerModalVisible(true)}
            >
                <Text style={styles.endGameButtonText}>Kick Speler</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.endGameButton} onPress={handleEndGame}>
              <Text style={styles.endGameButtonText}>Spel beëindigen</Text>
          </TouchableOpacity>

          <Modal transparent animationType="fade" visible={kickPlayerModalVisible}>
              <View style={styles.modalOuterContainer}>
                  <View style={styles.modalInnerContainer}>
                      <Text style={styles.modalTitle}>Kick Speler</Text>
                      <FlatList
                        data={activePlayers}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity
                            style={styles.kickModalPlayer}
                            onPress={() => handleKickPlayer(index)}
                          >
                              <Text style={styles.kickModalPlayerText}>
                                  {item.cardText || `Speler ${index + 1}`}
                              </Text>
                          </TouchableOpacity>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                      />
                      <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: '#e74c3c' }]}
                        onPress={() => setKickPlayerModalVisible(false)}
                      >
                          <Text style={styles.submitButtonText}>Sluiten</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </Modal>

          <Modal transparent animationType="fade" visible={nameInputModalVisible}>
              <View style={styles.modalOuterContainer}>
                  <View style={styles.modalInnerContainer}>
                      <TouchableOpacity style={styles.selfieCircle} onPress={handleAddSelfie}>
                          {currentCardIndex !== null && playerSelfies[currentCardIndex] ? (
                            <Image
                              source={{ uri: playerSelfies[currentCardIndex] }}
                              style={styles.selfieCircleImage}
                            />
                          ) : (
                            <Text style={styles.selfieCircleText}>+</Text>
                          )}
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Naam Invoeren</Text>
                      <Text style={styles.modalSubtitle}>
                          Vul je naam in en voeg een foto toe!
                      </Text>
                      <TextInput
                        style={styles.nameInput}
                        placeholder="Bijv. Jouw Naam"
                        placeholderTextColor="#aaa"
                        value={playerName}
                        onChangeText={setPlayerName}
                        maxLength={25}
                      />
                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleNameSubmit}
                      >
                          <Text style={styles.submitButtonText}>Bekijk jouw kaart</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </Modal>

          <Modal transparent animationType="slide" visible={modalVisible}>
              <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Jouw woord</Text>
                      <Text style={styles.modalRole}>{selectedRole}</Text>
                      <Text style={styles.modalTimer}>
                          Sluit automatisch in 5 seconden...
                      </Text>
                  </View>
              </View>
          </Modal>
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
        fontSize: 28,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 8,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    cardText: {
        fontSize: 40,
        color: '#aaa',
        fontWeight: 'bold',
    },
    cardInitials: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333',
    },
    cardName: {
        marginTop: 8,
        fontSize: 16,
        color: '#555',
        textTransform: 'capitalize',
    },
    cardSelfie: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    kickPlayerButton: {
        backgroundColor: '#e74c3c',
        borderRadius: 8,
        padding: 15,
        marginTop: 20,
    },
    endGameButton: {
        backgroundColor: '#3498db',
        borderRadius: 8,
        padding: 15,
        marginTop: 10,
    },
    endGameButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalOuterContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalInnerContainer: {
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 16,
        borderRadius: 10,
        width: '90%',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        color: '#333',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalRole: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginVertical: 15,
    },
    modalTimer: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 10,
    },
    selfieCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    selfieCircleText: {
        fontSize: 30,
        color: '#555',
    },
    selfieCircleImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    nameInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#27ae60',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    restartGameButton: {
        backgroundColor: '#8e44ad',
        borderRadius: 8,
        padding: 15,
        marginTop: 20,
        width: '80%',
        alignSelf: 'center',
    },
    restartGameText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    endGameContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
    },
    endGameTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    endGameMessage: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    kickModalPlayer: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginVertical: 5,
    },
    kickModalPlayerText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        width: '80%',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 8,
        width: '80%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default PlayGameScreen;

