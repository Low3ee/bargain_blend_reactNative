import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Image, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const AuthScreen = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignInClick = () => {
        if (isSignUp) {
            setIsSignUp(false);
        }
    };

    const handleSignUpClick = () => {
        if (!isSignUp) {
            setIsSignUp(true);
        }
    };

    const handleLogOut = () => {
        // logOutSession();
    };

    const handlePress = async () => {
        setLoading(true);

        try {
            if (isSignUp) {
                // await createUser(email, number, name, password);
            } else {
                // await LogInUser(email, password);
            }
        } catch (error) {
            console.error('Error during authentication', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSession = async () => {
            // CreatePaymentService.createPaymentIntent(null, null);
        };

        fetchSession();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollViewContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('@/assets/images/brand-logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.title}>Welcome to Bargain Blend</Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={handleSignInClick}>
                                    <Text style={[styles.signInButton, !isSignUp && styles.boldText]}>Sign In</Text>
                                </TouchableOpacity>

                                <Text style={styles.separator}>|</Text>

                                <TouchableOpacity onPress={handleSignUpClick}>
                                    <Text style={[styles.signUpButton, isSignUp && styles.boldText]}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
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
                                        placeholder="Enter Your Phone Number"
                                        value={number}
                                        onChangeText={setNumber}
                                        editable={!loading}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Your Full Name"
                                        value={name}
                                        onChangeText={setName}
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
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AuthScreen;
