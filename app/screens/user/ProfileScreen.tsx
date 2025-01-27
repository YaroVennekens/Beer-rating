import React, { FunctionComponent, useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { getAuth, updateProfile } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';
import ColorPicker from 'react-native-wheel-color-picker';

interface ProfileScreenProps {
    navigation: any;
}

const ProfileScreen: FunctionComponent<ProfileScreenProps> = ({ navigation }) => {
    const [username, setUsername] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingColor, setLoadingColor] = useState<boolean>(true);
    const [avatarColor, setAvatarColor] = useState<string>('#4CAF50');
    const user = getAuth().currentUser;

    useEffect(() => {
        if (!user) {
            navigation.navigate('Login');
            return;
        }

        const userId = user.uid;
        const userRef = ref(db, `users/${userId}`);
        get(userRef)
          .then((snapshot) => {
              const userData = snapshot.val();
              if (userData) {
                  setUsername(userData.username);
                  setBio(userData.bio || '');
                  setAvatarColor(userData.avatarColor || '#4CAF50');
              }
          })
          .catch((error) => console.error('Error fetching user data:', error))
          .finally(() => setLoadingColor(false));
    }, [navigation, user]);

    const handleProfileUpdate = async () => {
        if (!user) return;

        setLoading(true);

        try {
            const userId = user.uid;

            await update(ref(db, `users/${userId}`), {
                username,
                bio,
                avatarColor,
            });

            await updateProfile(user, { displayName: username });

            alert('Wijzigingen zijn opgeslagen');
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleColorSelect = (color: string) => {
        setAvatarColor(color);
    };

    return (
      <ScrollView contentContainerStyle={styles.screen}>
          {/* Profile Avatar */}
          <TouchableOpacity
            style={[styles.avatarContainer, { backgroundColor: avatarColor }]}
            onPress={() => {}}
          >
              <Text style={styles.avatarText}>{username.slice(0, 2).toUpperCase()}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>@{username.replaceAll(' ', '')}</Text>

          <View style={styles.form}>
              {/* Username Input */}
              <Text style={styles.label}>Gebruikersnaam</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Vul je gebruikersnaam in"
                placeholderTextColor="#999"
              />

              {/* Bio Input */}
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Vertel iets over jezelf"
                placeholderTextColor="#999"
                multiline
              />

              {/* Color Picker */}
              <Text style={styles.label}>Personalizatie</Text>
              {loadingColor ? (
                <ActivityIndicator size="large" color="#4CAF50" />
              ) : (
                <View style={styles.colorPickerSection}>
                    {/* Small Avatar Preview - Links Boven */}
                    <View style={styles.smallAvatarContainer}>
                        <View
                          style={[
                              styles.smallAvatar,
                              { backgroundColor: avatarColor },
                          ]}
                        >
                            <Text style={styles.smallAvatarText}>
                                {username.slice(0, 2).toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    {/* ColorPicker - Gecentreerd */}
                    <View style={styles.colorPickerContainer}>
                        <ColorPicker
                          color={avatarColor}
                          onColorChange={handleColorSelect}
                          thumbSize={30}
                          sliderSize={30}
                          noSnap
                          row={false}
                          style={styles.colorPicker}
                        />
                    </View>
                </View>
              )}

              {/* Navigation Buttons */}
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => navigation.navigate('FriendsList')}
              >
                  <Text style={styles.navigationButtonText}>Vrienden</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => navigation.navigate('Overview')}
              >
                  <Text style={styles.navigationButtonText}>Reviews</Text>
              </TouchableOpacity>

              {/* Save Profile Button */}
              <TouchableOpacity
                style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleProfileUpdate}
                disabled={loading}
              >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Opslaan</Text>
                  )}
              </TouchableOpacity>
          </View>

          {/* Log Out Button at the bottom */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
                getAuth().signOut();
                navigation.navigate('Login');
            }}
          >
              <Text style={styles.logoutButtonText}>Uitloggen</Text>
          </TouchableOpacity>
      </ScrollView>
    );
};

// ------ Styles ------
const styles = StyleSheet.create({
    screen: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ccc',
        marginBottom: 10,
        elevation: 3,
    },
    avatarText: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
    },
    form: {
        width: '90%',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 5,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    colorPickerSection: {
        alignItems: 'flex-start', // Avatar links plaatsen
        justifyContent: 'center',
        marginBottom: 20,
    },
    smallAvatarContainer: {
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    smallAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ccc',
    },
    smallAvatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    colorPickerContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 50
    },
    colorPicker: {
        width: 250,
        height: 250,
    },
    navigationButton: {
        width: '100%',
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    navigationButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    logoutButton: {
        width: '90%',
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 10,
        marginTop: 30,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;