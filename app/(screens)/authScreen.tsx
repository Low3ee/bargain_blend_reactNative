import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Image, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, loginUser } from '@/app/services/authService';
import Toast from 'react-native-toast-message'; // Import toast for notifications

const AuthScreen = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fname, setFname] = useState(''); // First name
    const [lname, setLname] = useState(''); // Last name
    const [username, setUsername] = useState(''); // Username
    const [loading, setLoading] = useState(false);

    // Toggle between Sign In and Sign Up views
    const handleSignInClick = () => {
        setIsSignUp(false);
    };

    const handleSignUpClick = () => {
        setIsSignUp(true);
    };

    // Handle Sign Up or Sign In
    const handlePress = async () => {
        setLoading(true);

        // Check if all required fields are filled
        if (!email || !password || (isSignUp && (!fname || !lname || !username))) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill all fields.',
            });
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                // Call API to register the user
                const response = await registerUser(email, password, fname, lname, username );
                if (response.success && response.token) {
                    await AsyncStorage.setItem('auth_token', response.token);
                    await AsyncStorage.setItem('user_info', JSON.stringify(response.user));
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Registration successful. Logging you in...',
                    });
                    router.push('/'); // Navigate to the index screen after successful signup
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error during registration',
                        text2: response.message,
                    });
                }
            } else {
                // Call API to log in the user
                const response = await loginUser(email, password);
                if (response.success && response.token) {
                    await AsyncStorage.setItem('auth_token', response.token);
                    await AsyncStorage.setItem('user_info', JSON.stringify(response.user));
                    Toast.show({
                        type: 'success',
                        text1: 'Welcome Back!',
                        text2: 'You have logged in successfully.',
                    });
                    router.push('/'); // Navigate to index screen after successful login
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error during login',
                        text2: response.message,
                    });
                }
            }
        } catch (error) {
            console.error('Error during authentication', error);
            Toast.show({
                type: 'error',
                text1: 'Authentication Error',
                text2: 'Something went wrong. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    
useEffect(() => {
    const checkLoggedIn = async () => {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('authToken');
      } else {
        token = await AsyncStorage.getItem('authToken');
      }
      if (token) {
        router.push('/');
      }
    };
  
    checkLoggedIn();
  }, []);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
                        <View style={styles.logoContainer}>
                            <Image source={require('@/assets/images/brand-logo.png')} style={styles.logo} resizeMode="contain" />
                            <Text style={styles.title}>Welcome to Bargain Blend</Text>
                        </View>

                        {/* Button container above the form */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleSignInClick}>
                                <Text style={[styles.signInButton, !isSignUp && styles.boldText]}>Sign In</Text>
                            </TouchableOpacity>
                            <Text style={styles.separator}>|</Text>
                            <TouchableOpacity onPress={handleSignUpClick}>
                                <Text style={[styles.signUpButton, isSignUp && styles.boldText]}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            {isSignUp ? (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Your Email"
                                        value={email}
                                        onChangeText={setEmail}
                                        editable={!loading}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Your Password"
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!loading}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Your First Name"
                                        value={fname}
                                        onChangeText={setFname}
                                        editable={!loading}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Your Last Name"
                                        value={lname}
                                        onChangeText={setLname}
                                        editable={!loading}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Your Username"
                                        value={username}
                                        onChangeText={setUsername}
                                        editable={!loading}
                                    />
                                    <TouchableOpacity onPress={handlePress} style={styles.button} disabled={loading}>
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.buttonText}>Sign Up</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Your Email"
                                        value={email}
                                        onChangeText={setEmail}
                                        editable={!loading}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Your Password"
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!loading}
                                    />
                                    <TouchableOpacity onPress={handlePress} style={styles.button} disabled={loading}>
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.buttonText}>Sign In</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            <Toast /> {/* Toast component for displaying messages */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    flex1: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 20,
    },
    logoContainer: {
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    logo: {
        width: '66.66%',
        height: '66.66%',
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20, // Added spacing below buttons
    },
    signInButton: {
        fontSize: 20,
        color: '#3498db',
        marginHorizontal: 10,
    },
    signUpButton: {
        fontSize: 20,
        color: '#3498db',
        marginHorizontal: 10,
    },
    separator: {
        fontSize: 18,
        color: '#888',
        marginHorizontal: 10,
    },
    boldText: {
        fontWeight: 'bold',
    },
    formContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginBottom: 28,
    },
    inputContainer: {
        width: '100%',
        maxWidth: 400,
    },
    input: {
        height: 48,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#3498db',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default AuthScreen;
