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
  Text,
  FAB,
  TextInput,
  Searchbar,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, getDocs, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const TestManagement = ({ navigation }) => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const testCategories = [
    { name: 'Aptitude', value: 'aptitude', color: colors.primary },
    { name: 'Coding', value: 'coding', color: colors.secondary },
    { name: 'Technical', value: 'technical', color: colors.accent },
    { name: 'Soft Skills', value: 'soft-skills', color: colors.success },
  ];

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchQuery, selectedCategory]);

  const loadTests = async () => {
    try {
      const testsSnapshot = await firestore().collection('tests').get();
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

  const filterTests = () => {
    let filtered = tests;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(test =>
        test.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    setFilteredTests(filtered);
  };

  const deleteTest = async (testId) => {
    try {
      await firestore().collection('tests').doc(testId).delete();
      
      // Update local state
      setTests(prev => prev.filter(test => test.id !== testId));
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const toggleTestStatus = async (testId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await firestore()
        .collection('tests')
        .doc(testId)
        .update({
          status: newStatus,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Update local state
      setTests(prev => prev.map(test =>
        test.id === testId ? { ...test, status: newStatus } : test
      ));
    } catch (error) {
      console.error('Error updating test status:', error);
    }
  };

  const getCategoryColor = (category) => {
    const categoryObj = testCategories.find(cat => cat.value === category);
    return categoryObj?.color || colors.textSecondary;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search and Filters */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search tests..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by category:</Text>
              <View style={styles.categoryFilters}>
                <Chip
                  selected={selectedCategory === 'all'}
                  onPress={() => setSelectedCategory('all')}
                  style={styles.categoryChip}
                >
                  All
                </Chip>
                {testCategories.map((category) => (
                  <Chip
                    key={category.value}
                    selected={selectedCategory === category.value}
                    onPress={() => setSelectedCategory(category.value)}
                    style={styles.categoryChip}
                  >
                    {category.name}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Tests List */}
        <Card style={styles.testsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>
              Tests ({filteredTests.length})
            </Title>
            {filteredTests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No tests found</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('CreateTest')}
                  style={styles.createButton}
                >
                  Create Test
                </Button>
              </View>
            ) : (
              filteredTests.map((test) => (
                <Card key={test.id} style={styles.testCard}>
                  <Card.Content>
                    <View style={styles.testHeader}>
                      <View style={styles.testInfo}>
                        <Text style={styles.testTitle}>{test.title}</Text>
                        <Text style={styles.testDescription}>
                          {test.description}
                        </Text>
                      </View>
                      <View style={styles.testStatus}>
                        <Chip
                          icon={test.status === 'active' ? 'check-circle' : 'close-circle'}
                          style={[
                            styles.statusChip,
                            { backgroundColor: test.status === 'active' ? colors.success : colors.error }
                          ]}
                          textStyle={{ color: colors.white }}
                        >
                          {test.status || 'active'}
                        </Chip>
                      </View>
                    </View>
                    
                    <View style={styles.testDetails}>
                      <Chip
                        style={[
                          styles.categoryChip,
                          { backgroundColor: getCategoryColor(test.category) }
                        ]}
                        textStyle={{ color: colors.white }}
                      >
                        {test.category || 'Uncategorized'}
                      </Chip>
                      <Chip
                        style={[
                          styles.difficultyChip,
                          { backgroundColor: getDifficultyColor(test.difficulty) }
                        ]}
                        textStyle={{ color: colors.white }}
                      >
                        {test.difficulty || 'Unknown'}
                      </Chip>
                      <Text style={styles.testMeta}>
                        {test.questionCount || 0} questions • {test.duration || 0} min
                      </Text>
                    </View>

                    <View style={styles.testStats}>
                      <Text style={styles.statText}>
                        Attempts: {test.attempts || 0}
                      </Text>
                      <Text style={styles.statText}>
                        Avg Score: {test.averageScore || 0}%
                      </Text>
                      <Text style={styles.statText}>
                        Created: {test.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </Text>
                    </View>

                    <View style={styles.testControls}>
                      <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('EditTest', { testId: test.id })}
                        style={styles.controlButton}
                      >
                        Edit
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('TestPreview', { testId: test.id })}
                        style={styles.controlButton}
                      >
                        Preview
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => toggleTestStatus(test.id, test.status || 'active')}
                        style={styles.controlButton}
                      >
                        {test.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => deleteTest(test.id)}
                        style={[styles.controlButton, styles.deleteButton]}
                        buttonColor={colors.error}
                        textColor={colors.white}
                      >
                        Delete
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
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
  searchCard: {
    margin: 16,
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterContainer: {
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  categoryFilters: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  testCard: {
    marginBottom: 12,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  testDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  testStatus: {
    marginLeft: 8,
  },
  statusChip: {
    marginLeft: 8,
  },
  testDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  difficultyChip: {
    marginLeft: 8,
    marginBottom: 8,
  },
  testMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  testStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  testControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    minWidth: 80,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
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

export default TestManagement;
