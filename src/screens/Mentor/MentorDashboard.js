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
import { collection, query, where, getDocs } from 'firebase/firestore';

const MentorDashboard = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    studentsAssigned: 0,
    resumesReviewed: 0,
    feedbackGiven: 0,
    activeStudents: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load mentor's assigned students
      const studentsSnapshot = await firestore()
        .collection('mentorAssignments')
        .where('mentorId', '==', userProfile?.uid)
        .get();

      // Load resume reviews
      const reviewsSnapshot = await firestore()
        .collection('resumeReviews')
        .where('mentorId', '==', userProfile?.uid)
        .get();

      // Load feedback given
      const feedbackSnapshot = await firestore()
        .collection('feedback')
        .where('mentorId', '==', userProfile?.uid)
        .get();

      setStats({
        studentsAssigned: studentsSnapshot.size,
        resumesReviewed: reviewsSnapshot.size,
        feedbackGiven: feedbackSnapshot.size,
        activeStudents: studentsSnapshot.size, // Simplified for now
      });

      // Load recent students (simplified)
      const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentStudents(students.slice(0, 5));
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
      title: 'Review Resumes',
      description: 'Review student resumes and provide feedback',
      icon: 'file-document-edit',
      onPress: () => navigation.navigate('ResumeReview'),
      color: colors.primary,
    },
    {
      title: 'Assign Tests',
      description: 'Create and assign custom tests',
      icon: 'school',
      onPress: () => navigation.navigate('AssignTests'),
      color: colors.secondary,
    },
    {
      title: 'Student Progress',
      description: 'Track student progress and performance',
      icon: 'chart-line',
      onPress: () => navigation.navigate('StudentProgress'),
      color: colors.accent,
    },
    {
      title: 'Mentorship',
      description: 'Provide guidance and mentorship',
      icon: 'account-group',
      onPress: () => navigation.navigate('Mentorship'),
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
              Welcome, Mentor {userProfile?.email?.split('@')[0]}!
            </Title>
            <Paragraph style={styles.welcomeSubtitle}>
              Help students achieve their career goals
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Stats Section */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Your Impact</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.studentsAssigned}</Text>
                <Text style={styles.statLabel}>Students Assigned</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.resumesReviewed}</Text>
                <Text style={styles.statLabel}>Resumes Reviewed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.feedbackGiven}</Text>
                <Text style={styles.statLabel}>Feedback Given</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.activeStudents}</Text>
                <Text style={styles.statLabel}>Active Students</Text>
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

        {/* Recent Students */}
        <Card style={styles.studentsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Students</Title>
            {recentStudents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No students assigned yet</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('StudentManagement')}
                  style={styles.assignButton}
                >
                  Assign Students
                </Button>
              </View>
            ) : (
              recentStudents.map((student) => (
                <Card key={student.id} style={styles.studentCard}>
                  <Card.Content>
                    <View style={styles.studentHeader}>
                      <Text style={styles.studentName}>{student.studentName}</Text>
                      <Chip
                        mode="outlined"
                        style={styles.statusChip}
                      >
                        {student.status || 'Active'}
                      </Chip>
                    </View>
                    <Text style={styles.studentEmail}>{student.studentEmail}</Text>
                    <View style={styles.studentActions}>
                      <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('StudentDetails', { studentId: student.id })}
                        style={styles.studentButton}
                      >
                        View Details
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => navigation.navigate('ResumeReview', { studentId: student.id })}
                        style={styles.studentButton}
                      >
                        Review Resume
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Pending Reviews */}
        <Card style={styles.pendingCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Pending Reviews</Title>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending reviews</Text>
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
  statsContainer: {
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
  studentsCard: {
    margin: 16,
    marginVertical: 8,
  },
  studentCard: {
    marginBottom: 12,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: colors.text,
  },
  statusChip: {
    marginLeft: 8,
  },
  studentEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  pendingCard: {
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
    marginBottom: 16,
  },
  assignButton: {
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

export default MentorDashboard;
