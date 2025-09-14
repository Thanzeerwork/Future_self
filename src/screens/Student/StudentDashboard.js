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
  FAB,
  Chip,
  ProgressBar,
  Text,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const StudentDashboard = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    testsCompleted: 0,
    resumeUpdated: false,
    badgesEarned: 0,
    progressPercentage: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user's test results
      const testResultsQuery = query(
        collection(firestore, 'testResults'),
        where('userId', '==', userProfile?.uid)
      );
      const testResultsSnapshot = await getDocs(testResultsQuery);

      // Load user's resume status
      const resumeDocRef = doc(firestore, 'resumes', userProfile?.uid);
      const resumeDoc = await getDoc(resumeDocRef);

      // Load user's badges
      const badgesDocRef = doc(firestore, 'userBadges', userProfile?.uid);
      const badgesDoc = await getDoc(badgesDocRef);

      setStats({
        testsCompleted: testResultsSnapshot.size,
        resumeUpdated: resumeDoc.exists(),
        badgesEarned: badgesDoc.exists() ? badgesDoc.data().badges?.length || 0 : 0,
        progressPercentage: Math.min((testResultsSnapshot.size * 10) + (resumeDoc.exists() ? 20 : 0), 100),
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
      title: 'Build Resume',
      description: 'Create an ATS-friendly resume',
      icon: 'file-document',
      onPress: () => navigation.navigate('ResumeBuilder'),
      color: colors.primary,
    },
    {
      title: 'Take Test',
      description: 'Practice with aptitude tests',
      icon: 'school',
      onPress: () => navigation.navigate('TestList'),
      color: colors.secondary,
    },
    {
      title: 'Career Roadmap',
      description: 'Get personalized career guidance',
      icon: 'map',
      onPress: () => navigation.navigate('CareerRoadmap'),
      color: colors.accent,
    },
    {
      title: 'Analytics',
      description: 'View your progress',
      icon: 'chart-line',
      onPress: () => navigation.navigate('Analytics'),
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
              Welcome back, {userProfile?.email?.split('@')[0]}!
            </Title>
            <Paragraph style={styles.welcomeSubtitle}>
              Ready to take the next step in your career?
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Progress Section */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Your Progress</Title>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {stats.progressPercentage}% Complete
              </Text>
              <ProgressBar
                progress={stats.progressPercentage / 100}
                color={colors.primary}
                style={styles.progressBar}
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.testsCompleted}</Text>
                <Text style={styles.statLabel}>Tests Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.badgesEarned}</Text>
                <Text style={styles.statLabel}>Badges Earned</Text>
              </View>
              <View style={styles.statItem}>
                <Chip
                  icon={stats.resumeUpdated ? 'check' : 'alert'}
                  mode={stats.resumeUpdated ? 'flat' : 'outlined'}
                  textStyle={{ color: stats.resumeUpdated ? colors.success : colors.warning }}
                >
                  {stats.resumeUpdated ? 'Resume Ready' : 'Resume Pending'}
                </Chip>
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
                {stats.testsCompleted > 0
                  ? `Completed ${stats.testsCompleted} test(s) recently`
                  : 'No tests completed yet'}
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>
                {stats.resumeUpdated
                  ? 'Resume updated and ready for applications'
                  : 'Resume needs to be created or updated'}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('QuickStart')}
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
  progressCard: {
    margin: 16,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default StudentDashboard;
