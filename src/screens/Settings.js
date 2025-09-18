import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, Switch } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

const Settings = () => {
  const { user, userProfile, signOut } = useAuth();
  const { isDark, toggleMode, colors } = useThemeMode();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: colors.textPrimary }]}>
          Settings
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Account Information
          </Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={[styles.label, { color: colors.textSecondary }]}>Email:</Text>
            <Text variant="bodyMedium" style={[styles.value, { color: colors.textPrimary }]}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={[styles.label, { color: colors.textSecondary }]}>Role:</Text>
            <Text variant="bodyMedium" style={[styles.value, { color: colors.textPrimary }]}>{userProfile?.role}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
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
          <View style={styles.infoRow}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { marginBottom: 0, color: colors.textPrimary }]}>
              Appearance
            </Text>
            <Switch value={isDark} onValueChange={toggleMode} />
          </View>
          <Text variant="bodySmall" style={[{ color: colors.textSecondary }]}>
            Toggle Dark Mode
          </Text>
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
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
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
    fontWeight: '500',
  },
  value: {
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
