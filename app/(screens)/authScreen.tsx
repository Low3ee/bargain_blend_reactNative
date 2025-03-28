import React, { useState, useEffect } from 'react';
import { ScrollView, Text, Image, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

type SignInFormProps = {
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
    handlePress: () => Promise<void>;
};

type SignUpFormProps = {
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    number: string;
    setNumber: React.Dispatch<React.SetStateAction<string>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
    handlePress: () => Promise<void>;
};

const SignInForm: React.FC<SignInFormProps> = ({ email, setEmail, password, setPassword, loading, handlePress }) => (
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
);

const SignUpForm: React.FC<SignUpFormProps> = ({ email, setEmail, password, setPassword, number, setNumber, name, setName, loading, handlePress }) => (
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
);

const AuthScreen: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [number, setNumber] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const colorScheme = useColorScheme(); // Detect the color scheme of the device

    const handleSignInClick = () => setIsSignUp(false);
    const handleSignUpClick = () => setIsSignUp(true);

    const handlePress = async () => {
        setLoading(true);
        try {
            if (isSignUp) {
                // Handle Sign Up logic
                // await createUser(email, number, name, password);
            } else {
                // Handle Sign In logic
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
        <SafeAreaView style={[styles.container, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
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
                            <Text style={[styles.title]}>
                                Welcome to Bargain Blend
                            </Text>
                        </View>

                        {/* Buttons: Sign In / Sign Up */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleSignInClick}>
                                <Text style={[styles.signInButton, !isSignUp && styles.boldText]}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.separator}>|</Text>

                            <TouchableOpacity onPress={handleSignUpClick}>
                                <Text style={[styles.signUpButton, isSignUp && styles.boldText]}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={styles.formContainer}>
                            {isSignUp ? (
                                <SignUpForm
                                    email={email}
                                    setEmail={setEmail}
                                    password={password}
                                    setPassword={setPassword}
                                    number={number}
                                    setNumber={setNumber}
                                    name={name}
                                    setName={setName}
                                    loading={loading}
                                    handlePress={handlePress}
                                />
                            ) : (
                                <SignInForm
                                    email={email}
                                    setEmail={setEmail}
                                    password={password}
                                    setPassword={setPassword}
                                    loading={loading}
                                    handlePress={handlePress}
                                />
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
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    lightContainer: {
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
        marginTop: 20,
    },
    darkText: {
        color: '#fff',
    },
    lightText: {
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    signInButton: {
        fontSize: 20,
        color: '#DD2222',
        marginHorizontal: 10,
    },
    signUpButton: {
        fontSize: 20,
        color: '#DD2222',
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
        marginBottom: 40,
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
        backgroundColor: '#DD2222',
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
