import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getAuth, updateProfile } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';

interface ProfileScreenProps {
    navigation: any;
}

const ProfileScreen: FunctionComponent<ProfileScreenProps> = ({ navigation }) => {
    const [username, setUsername] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const user = getAuth().currentUser;

    useEffect(() => {
        if (!user) {
            navigation.navigate('Login');
            return;
        }

        const userId = user.uid;

        const userRef = ref(db, `users/${userId}`);
        get(userRef).then((snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                setUsername(userData.username);
                setBio(userData.bio || '');
            }
        }).catch((error) => {
            console.error('Error fetching user data:', error);
        });
    }, [navigation, user]);

    const handleProfileUpdate = async () => {
        if (!user) return;

        setLoading(true);

        try {
            const userId = user.uid;


            await update(ref(db, `users/${userId}`), { username, bio });


            await updateProfile(user, { displayName: username });

            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
      <View style={styles.screen}>
          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{username.slice(0, 2).toUpperCase()}</Text>
          </View>

          <Text style={styles.title}>@{username.replaceAll(' ', '')}</Text>

          <View style={styles.form}>
              <Text style={styles.label}>Gebruikersnaam</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Vul je gebruikersnaam in"
              />

              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Vertel iets over jezelf"
                multiline
              />

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Friends')}
              >
                  <Text style={styles.buttonText}>Vrienden</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Overview')}
              >
                  <Text style={styles.buttonText}>Reviews</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleProfileUpdate}
                disabled={loading}
              >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Opslaan</Text>
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
      </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    avatarContainer: {
        backgroundColor: '#4CAF50',
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    form: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        width: '100%',
        fontSize: 16,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
        color: 'white'
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    logoutButton: {
        backgroundColor: '#f44336',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 'auto',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
    },

});

export default ProfileScreen;