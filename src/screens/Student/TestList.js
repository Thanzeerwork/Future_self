import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  ProgressBar,
  Text,
  FAB,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const TestList = ({ navigation }) => {
  const [tests, setTests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const testsQuery = query(
        collection(firestore, 'tests'),
        orderBy('createdAt', 'desc')
      );
      const testsSnapshot = await getDocs(testsQuery);
      
      const testsData = testsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setTests(testsData);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTests();
    setRefreshing(false);
  };

  const startTest = (testId) => {
    navigation.navigate('TestScreen', { testId });
  };

  const testCategories = [
    { name: 'Aptitude', color: colors.primary, icon: 'calculator' },
    { name: 'Coding', color: colors.secondary, icon: 'code-tags' },
    { name: 'Technical', color: colors.accent, icon: 'cog' },
    { name: 'Soft Skills', color: colors.success, icon: 'account-group' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Categories */}
        <Card style={styles.categoriesCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Test Categories</Title>
            <View style={styles.categoriesContainer}>
              {testCategories.map((category, index) => (
                <Chip
                  key={index}
                  icon={category.icon}
                  style={[styles.categoryChip, { backgroundColor: category.color }]}
                  textStyle={{ color: colors.white }}
                >
                  {category.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* AI Test Generator */}
        <Card style={styles.generatorCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>AI Test Generator</Title>
            <Paragraph style={styles.generatorDescription}>
              Generate personalized tests using advanced AI technology. Get questions tailored to your skill level and learning goals.
            </Paragraph>
            <View style={styles.generatorActions}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('TestGenerator')}
                style={styles.generatorButton}
                icon="robot"
              >
                Generate AI Test
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('TestGenerator')}
                style={styles.quickButton}
              >
                Quick Test
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Available Tests */}
        <Card style={styles.testsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Available Tests</Title>
            {tests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No pre-made tests available</Text>
                <Text style={styles.emptySubtext}>Use the AI Test Generator to create personalized tests</Text>
              </View>
            ) : (
              tests.map((test) => (
                <Card key={test.id} style={styles.testCard}>
                  <Card.Content>
                    <View style={styles.testHeader}>
                      <Title style={styles.testTitle}>{test.title}</Title>
                      <Chip
                        mode="outlined"
                        style={styles.difficultyChip}
                      >
                        {test.difficulty}
                      </Chip>
                    </View>
                    <Paragraph style={styles.testDescription}>
                      {test.description}
                    </Paragraph>
                    <View style={styles.testInfo}>
                      <Text style={styles.testInfoText}>
                        Duration: {test.duration} minutes
                      </Text>
                      <Text style={styles.testInfoText}>
                        Questions: {test.questionCount}
                      </Text>
                    </View>
                    <View style={styles.testActions}>
                      <Button
                        mode="contained"
                        onPress={() => startTest(test.id)}
                        style={styles.startButton}
                      >
                        Start Test
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('TestPreview', { testId: test.id })}
                      >
                        Preview
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Recent Results */}
        <Card style={styles.resultsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Results</Title>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No recent test results</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateTest')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  categoriesCard: {
    margin: 16,
    marginBottom: 8,
  },
  generatorCard: {
    margin: 16,
    marginVertical: 8,
    backgroundColor: colors.primary,
  },
  generatorDescription: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 20,
  },
  generatorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  generatorButton: {
    flex: 1,
    backgroundColor: colors.white,
  },
  quickButton: {
    flex: 1,
    borderColor: colors.white,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 8,
  },
  testsCard: {
    margin: 16,
    marginVertical: 8,
  },
  testCard: {
    marginBottom: 12,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: colors.text,
  },
  difficultyChip: {
    marginLeft: 8,
  },
  testDescription: {
    marginBottom: 12,
    color: colors.textSecondary,
  },
  testInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  testInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  testActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startButton: {
    flex: 1,
    marginRight: 8,
  },
  resultsCard: {
    margin: 16,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default TestList;
