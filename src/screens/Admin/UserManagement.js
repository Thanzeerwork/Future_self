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
import { USER_ROLES, ROLE_LABELS, ROLE_COLORS } from '../../constants/roles';
import { firestore } from '../../../firebase.config';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const UserManagement = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole]);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getRoleColor = (role) => {
    return ROLE_COLORS[role] || colors.textSecondary;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? colors.success : colors.error;
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? 'check-circle' : 'close-circle';
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
              placeholder="Search users..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by role:</Text>
              <View style={styles.roleFilters}>
                <Chip
                  selected={selectedRole === 'all'}
                  onPress={() => setSelectedRole('all')}
                  style={styles.roleChip}
                >
                  All
                </Chip>
                {Object.values(USER_ROLES).map((role) => (
                  <Chip
                    key={role}
                    selected={selectedRole === role}
                    onPress={() => setSelectedRole(role)}
                    style={styles.roleChip}
                  >
                    {ROLE_LABELS[role]}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Users List */}
        <Card style={styles.usersCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>
              Users ({filteredUsers.length})
            </Title>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} style={styles.userCard}>
                  <Card.Content>
                    <View style={styles.userHeader}>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                          {user.fullName || user.email?.split('@')[0] || 'Unknown User'}
                        </Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>
                      <View style={styles.userActions}>
                        <Chip
                          icon={getStatusIcon(user.status || 'active')}
                          style={[
                            styles.statusChip,
                            { backgroundColor: getStatusColor(user.status || 'active') }
                          ]}
                          textStyle={{ color: colors.white }}
                        >
                          {user.status || 'active'}
                        </Chip>
                      </View>
                    </View>
                    
                    <View style={styles.userDetails}>
                      <Chip
                        style={[
                          styles.roleChip,
                          { backgroundColor: getRoleColor(user.role) }
                        ]}
                        textStyle={{ color: colors.white }}
                      >
                        {ROLE_LABELS[user.role] || 'Unknown Role'}
                      </Chip>
                      <Text style={styles.userDate}>
                        Joined: {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </Text>
                    </View>

                    <View style={styles.userControls}>
                      <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('UserDetails', { userId: user.id })}
                        style={styles.controlButton}
                      >
                        View Details
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => toggleUserStatus(user.id, user.status || 'active')}
                        style={styles.controlButton}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </View>

                    {/* Role Change */}
                    <View style={styles.roleChange}>
                      <Text style={styles.roleChangeLabel}>Change Role:</Text>
                      <View style={styles.roleButtons}>
                        {Object.values(USER_ROLES).map((role) => (
                          <Button
                            key={role}
                            mode={user.role === role ? 'contained' : 'outlined'}
                            onPress={() => updateUserRole(user.id, role)}
                            style={styles.roleButton}
                            compact
                          >
                            {ROLE_LABELS[role]}
                          </Button>
                        ))}
                      </View>
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
        onPress={() => navigation.navigate('CreateUser')}
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
  roleFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    marginBottom: 8,
  },
  usersCard: {
    margin: 16,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  userCard: {
    marginBottom: 12,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userActions: {
    marginLeft: 8,
  },
  statusChip: {
    marginLeft: 8,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  roleChange: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  roleChangeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default UserManagement;
