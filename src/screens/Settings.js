import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';

const Settings = () => {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Settings
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Information
          </Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Email:</Text>
            <Text variant="bodyMedium" style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Role:</Text>
            <Text variant="bodyMedium" style={styles.value}>{userProfile?.role}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            App Settings
          </Text>
          <Button 
            mode="text" 
            onPress={() => console.log('Notifications pressed')}
            style={styles.settingButton}
          >
            Notifications
          </Button>
          <Divider style={styles.divider} />
          <Button 
            mode="text" 
            onPress={() => console.log('Privacy pressed')}
            style={styles.settingButton}
          >
            Privacy & Security
          </Button>
          <Divider style={styles.divider} />
          <Button 
            mode="text" 
            onPress={() => console.log('About pressed')}
            style={styles.settingButton}
          >
            About
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button 
            mode="contained" 
            onPress={handleSignOut}
            style={styles.signOutButton}
            buttonColor={colors.error}
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    color: colors.textPrimary,
  },
  settingButton: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 4,
  },
  signOutButton: {
    marginTop: 8,
  },
});

export default Settings;
