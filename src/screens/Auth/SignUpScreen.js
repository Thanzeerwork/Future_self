import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  Divider,
  RadioButton,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { USER_ROLES } from '../../constants/roles';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(USER_ROLES.STUDENT);
  const [loading, setLoading] = useState(false);
  const { signUp, signUpWithGoogle } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, role);
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signUpWithGoogle(role);
    } catch (error) {
      Alert.alert('Google Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Title style={styles.title}>Join FutureSelf</Title>
          <Paragraph style={styles.subtitle}>
            Start your career journey today
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Create Account</Title>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>I am a:</Text>
              <RadioButton.Group onValueChange={setRole} value={role}>
                <View style={styles.roleOption}>
                  <RadioButton value={USER_ROLES.STUDENT} />
                  <Text style={styles.roleText}>Student</Text>
                </View>
                <View style={styles.roleOption}>
                  <RadioButton value={USER_ROLES.MENTOR} />
                  <Text style={styles.roleText}>Mentor</Text>
                </View>
                <View style={styles.roleOption}>
                  <RadioButton value={USER_ROLES.ADMIN} />
                  <Text style={styles.roleText}>Admin</Text>
                </View>
              </RadioButton.Group>
            </View>
            
            <Button
              mode="contained"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              style={styles.signUpButton}
            >
              Create Account
            </Button>
            
            <Divider style={styles.divider} />
            
            <Button
              mode="outlined"
              onPress={handleGoogleSignUp}
              loading={loading}
              disabled={loading}
              style={styles.googleButton}
              icon="google"
            >
              Continue with Google
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Login')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    elevation: 4,
    marginBottom: 20,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text,
  },
  input: {
    marginBottom: 16,
  },
  roleSection: {
    marginVertical: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  signUpButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  googleButton: {
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
  },
  linkText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
