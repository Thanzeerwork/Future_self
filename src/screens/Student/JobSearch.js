import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { colors } from '../../constants/colors';

const JobSearch = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Job Search</Title>
          <Paragraph style={styles.text}>
            Browse and match jobs based on your profile. (Placeholder)
          </Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    color: colors.textSecondary,
  },
});

export default JobSearch;


