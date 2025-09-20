import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Chip,
  DataTable,
  FAB,
  Searchbar,
  Menu,
  IconButton,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

const TestManagement = ({ navigation }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTests, setFilteredTests] = useState([]);
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [searchQuery, tests]);

  const loadTests = async () => {
    try {
      setLoading(true);
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
      Alert.alert('Error', 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    if (!searchQuery) {
      setFilteredTests(tests);
      return;
    }

    const filtered = tests.filter(test =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTests(filtered);
  };

  const handleCreateTest = () => {
    navigation.navigate('CreateTest');
  };

  const handleEditTest = (testId) => {
    navigation.navigate('EditTest', { testId });
  };

  const handleDeleteTest = async (testId) => {
    Alert.alert(
      'Delete Test',
      'Are you sure you want to delete this test? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, 'tests', testId));
              setTests(tests.filter(test => test.id !== testId));
              Alert.alert('Success', 'Test deleted successfully');
            } catch (error) {
              console.error('Error deleting test:', error);
              Alert.alert('Error', 'Failed to delete test');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (testId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(firestore, 'tests', testId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      
      setTests(tests.map(test =>
        test.id === testId ? { ...test, status: newStatus } : test
      ));
      
      Alert.alert('Success', `Test ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating test status:', error);
      Alert.alert('Error', 'Failed to update test status');
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? colors.success : colors.error;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return colors.success;
      case 'intermediate':
        return colors.warning;
      case 'advanced':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const toggleMenu = (testId) => {
    setMenuVisible({
      ...menuVisible,
      [testId]: !menuVisible[testId],
    });
  };

  const closeMenu = (testId) => {
    setMenuVisible({
      ...menuVisible,
      [testId]: false,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>Test Management</Title>
            <Paragraph style={styles.headerSubtitle}>
              Manage and monitor all tests in the system
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Search and Filters */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search tests..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Test Statistics</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{tests.length}</Text>
                <Text style={styles.statLabel}>Total Tests</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tests.filter(test => test.status === 'active').length}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tests.filter(test => test.status === 'inactive').length}
                </Text>
                <Text style={styles.statLabel}>Inactive</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Tests List */}
        <Card style={styles.testsCard}>
          <Card.Content>
            <Title style={styles.testsTitle}>All Tests</Title>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading tests...</Text>
              </View>
            ) : filteredTests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tests found</Text>
                <Button
                  mode="contained"
                  onPress={handleCreateTest}
                  style={styles.createButton}
                >
                  Create First Test
                </Button>
              </View>
            ) : (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Title</DataTable.Title>
                  <DataTable.Title>Category</DataTable.Title>
                  <DataTable.Title>Difficulty</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>

                {filteredTests.map((test) => (
                  <DataTable.Row key={test.id}>
                    <DataTable.Cell>
                      <View>
                        <Text style={styles.testTitle}>{test.title}</Text>
                        <Text style={styles.testDescription}>
                          {test.questionCount} questions • {test.duration} min
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip style={styles.categoryChip}>
                        {test.category}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        style={[
                          styles.difficultyChip,
                          { backgroundColor: getDifficultyColor(test.difficulty) }
                        ]}
                        textStyle={{ color: colors.white }}
                      >
                        {test.difficulty}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        style={[
                          styles.statusChip,
                          { backgroundColor: getStatusColor(test.status) }
                        ]}
                        textStyle={{ color: colors.white }}
                      >
                        {test.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Menu
                        visible={menuVisible[test.id] || false}
                        onDismiss={() => closeMenu(test.id)}
                        anchor={
                          <IconButton
                            icon="dots-vertical"
                            onPress={() => toggleMenu(test.id)}
                          />
                        }
                      >
                        <Menu.Item
                          onPress={() => {
                            closeMenu(test.id);
                            handleEditTest(test.id);
                          }}
                          title="Edit"
                          leadingIcon="pencil"
                        />
                        <Menu.Item
                          onPress={() => {
                            closeMenu(test.id);
                            handleToggleStatus(test.id, test.status);
                          }}
                          title={test.status === 'active' ? 'Deactivate' : 'Activate'}
                          leadingIcon={test.status === 'active' ? 'pause' : 'play'}
                        />
                        <Menu.Item
                          onPress={() => {
                            closeMenu(test.id);
                            handleDeleteTest(test.id);
                          }}
                          title="Delete"
                          leadingIcon="delete"
                          titleStyle={{ color: colors.error }}
                        />
                      </Menu>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.actionsTitle}>Quick Actions</Title>
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={handleCreateTest}
                style={styles.actionButton}
                icon="plus"
              >
                Create Test
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('TestAnalytics')}
                style={styles.actionButton}
                icon="chart-line"
              >
                View Analytics
              </Button>
              <Button
                mode="outlined"
                onPress={loadTests}
                style={styles.actionButton}
                icon="refresh"
              >
                Refresh
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateTest}
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  searchCard: {
    margin: 16,
    marginVertical: 8,
  },
  searchBar: {
    elevation: 0,
  },
  statsCard: {
    margin: 16,
    marginVertical: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  testsCard: {
    margin: 16,
    marginVertical: 8,
  },
  testsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
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
  testTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  testDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryChip: {
    backgroundColor: colors.secondary,
  },
  difficultyChip: {
    marginBottom: 4,
  },
  statusChip: {
    marginBottom: 4,
  },
  actionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
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