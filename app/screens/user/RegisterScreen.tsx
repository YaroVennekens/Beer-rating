import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { ref, set } from 'firebase/database';

const RegisterScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Wachtwoorden komen zijn niet gelijk');
            return;
        }
        setLoading(true);
        try {

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;


            await set(ref(db, `users/${user.uid}`), {
                username,
                email,
                createdAt: new Date().toISOString(),
            });


            await signInWithEmailAndPassword(auth, email, password);

            navigation.navigate('Home');
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.message || 'Er is iets fout gegaan!');
        }
    };

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Registreer</Text>
          <TextInput
            placeholder="Gebruikersnaam"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Wachtwoord"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          <TextInput
            placeholder="Herhaal wachtwoord"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Registreer</Text>
              )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Heb je al een account? Ga naar Login</Text>
          </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    linkText: {
        marginTop: 16,
        textAlign: 'center',
        color: '#007BFF',
    },
});

export default RegisterScreen;