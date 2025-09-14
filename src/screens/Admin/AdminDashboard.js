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
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, getDocs } from 'firebase/firestore';

const AdminDashboard = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    mentors: 0,
    admins: 0,
    totalTests: 0,
    totalResumes: 0,
    activeUsers: 0,
    platformGrowth: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user statistics
      const usersSnapshot = await firestore().collection('users').get();
      const users = usersSnapshot.docs.map(doc => doc.data());
      
      const students = users.filter(user => user.role === 'student').length;
      const mentors = users.filter(user => user.role === 'mentor').length;
      const admins = users.filter(user => user.role === 'admin').length;
      
      // Load test statistics
      const testsSnapshot = await firestore().collection('tests').get();
      
      // Load resume statistics
      const resumesSnapshot = await firestore().collection('resumes').get();
      
      setStats({
        totalUsers: users.length,
        students,
        mentors,
        admins,
        totalTests: testsSnapshot.size,
        totalResumes: resumesSnapshot.size,
        activeUsers: users.length, // Simplified for now
        platformGrowth: 15, // Mock data
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: 'account-group',
      onPress: () => navigation.navigate('UserManagement'),
      color: colors.primary,
    },
    {
      title: 'Manage Tests',
      description: 'Create and manage tests',
      icon: 'school',
      onPress: () => navigation.navigate('TestManagement'),
      color: colors.secondary,
    },
    {
      title: 'Platform Analytics',
      description: 'View platform performance',
      icon: 'chart-line',
      onPress: () => navigation.navigate('PlatformAnalytics'),
      color: colors.accent,
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: 'cog',
      onPress: () => navigation.navigate('SystemSettings'),
      color: colors.success,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>
              Admin Dashboard
            </Title>
            <Paragraph style={styles.welcomeSubtitle}>
              Manage the FutureSelf platform
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Platform Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Platform Statistics</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.students}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.mentors}</Text>
                <Text style={styles.statLabel}>Mentors</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.admins}</Text>
                <Text style={styles.statLabel}>Admins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalTests}</Text>
                <Text style={styles.statLabel}>Total Tests</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalResumes}</Text>
                <Text style={styles.statLabel}>Resumes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.activeUsers}</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>+{stats.platformGrowth}%</Text>
                <Text style={styles.statLabel}>Growth</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Quick Actions</Title>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  style={[styles.actionCard, { borderLeftColor: action.color }]}
                  onPress={action.onPress}
                >
                  <Card.Content style={styles.actionContent}>
                    <Button
                      mode="contained"
                      icon={action.icon}
                      style={[styles.actionButton, { backgroundColor: action.color }]}
                      onPress={action.onPress}
                    >
                      {action.title}
                    </Button>
                    <Paragraph style={styles.actionDescription}>
                      {action.description}
                    </Paragraph>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Activity</Title>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>
                {stats.students} new students registered this month
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>
                {stats.totalTests} tests completed this week
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>
                {stats.totalResumes} resumes created and reviewed
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>
                Platform growth: +{stats.platformGrowth}% this month
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* System Status */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>System Status</Title>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Database</Text>
              <Chip
                icon="check-circle"
                style={[styles.statusChip, { backgroundColor: colors.success }]}
                textStyle={{ color: colors.white }}
              >
                Online
              </Chip>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Storage</Text>
              <Chip
                icon="check-circle"
                style={[styles.statusChip, { backgroundColor: colors.success }]}
                textStyle={{ color: colors.white }}
              >
                Online
              </Chip>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Authentication</Text>
              <Chip
                icon="check-circle"
                style={[styles.statusChip, { backgroundColor: colors.success }]}
                textStyle={{ color: colors.white }}
              >
                Online
              </Chip>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Notifications</Text>
              <Chip
                icon="check-circle"
                style={[styles.statusChip, { backgroundColor: colors.success }]}
                textStyle={{ color: colors.white }}
              >
                Online
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('QuickActions')}
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
  welcomeCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.primary,
  },
  welcomeTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: colors.white,
    fontSize: 16,
    opacity: 0.9,
  },
  statsCard: {
    margin: 16,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  actionContent: {
    padding: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  activityCard: {
    margin: 16,
    marginVertical: 8,
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
  },
  statusCard: {
    margin: 16,
    marginVertical: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text,
  },
  statusChip: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default AdminDashboard;
