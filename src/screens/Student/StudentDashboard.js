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
  Avatar,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useThemeMode } from '../../context/ThemeContext';
import AIFeedbackService from '../../services/aiFeedbackService';

const StudentDashboard = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { colors: themeColors } = useThemeMode();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    testsCompleted: 0,
    resumeUpdated: false,
    badgesEarned: 0,
    progressPercentage: 0,
    readinessScore: 0,
    componentScores: {
      aptitude: 0,
      coding: 0,
      technical: 0,
      softSkills: 0,
      resume: 0,
    },
  });
  const [aiTips, setAiTips] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user's test results
      const testResultsQuery = query(
        collection(firestore, 'testResults'),
        where('userId', '==', userProfile?.uid)
      );
      const testResultsSnapshot = await getDocs(testResultsQuery);
      const testResults = testResultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load user's resume status
      const resumeDocRef = doc(firestore, 'resumes', userProfile?.uid);
      const resumeDoc = await getDoc(resumeDocRef);

      // Load user's badges
      const badgesDocRef = doc(firestore, 'userBadges', userProfile?.uid);
      const badgesDoc = await getDoc(badgesDocRef);

      // Calculate component scores
      const componentScores = calculateComponentScores(testResults, resumeDoc);

      // Calculate overall readiness score
      const readinessScore = calculateReadinessScore(componentScores);

      // Generate AI tips
      const tips = await generateAITips(testResults, resumeDoc, componentScores);

      setStats({
        testsCompleted: testResults.length,
        resumeUpdated: resumeDoc.exists(),
        badgesEarned: badgesDoc.exists() ? badgesDoc.data().badges?.length || 0 : 0,
        progressPercentage: Math.min((testResults.length * 10) + (resumeDoc.exists() ? 20 : 0), 100),
        readinessScore,
        componentScores,
      });

      setAiTips(tips);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateComponentScores = (testResults, resumeDoc) => {
    const aptitudeTests = testResults.filter(r => r.category === 'Aptitude');
    const codingTests = testResults.filter(r => r.category === 'Coding');
    const technicalTests = testResults.filter(r => r.category === 'Technical');
    const softSkillsTests = testResults.filter(r => r.category === 'Soft Skills');

    return {
      aptitude: aptitudeTests.length > 0
        ? Math.round(aptitudeTests.reduce((sum, test) => sum + (test.score || 0), 0) / aptitudeTests.length)
        : 0,
      coding: codingTests.length > 0
        ? Math.round(codingTests.reduce((sum, test) => sum + (test.score || 0), 0) / codingTests.length)
        : 0,
      technical: technicalTests.length > 0
        ? Math.round(technicalTests.reduce((sum, test) => sum + (test.score || 0), 0) / technicalTests.length)
        : 0,
      softSkills: softSkillsTests.length > 0
        ? Math.round(softSkillsTests.reduce((sum, test) => sum + (test.score || 0), 0) / softSkillsTests.length)
        : 0,
      resume: resumeDoc.exists() ? (resumeDoc.data().atsScore || 70) : 0,
    };
  };

  const calculateReadinessScore = (scores) => {
    const weights = {
      aptitude: 0.20,
      coding: 0.25,
      technical: 0.20,
      softSkills: 0.15,
      resume: 0.20,
    };

    const weightedSum =
      scores.aptitude * weights.aptitude +
      scores.coding * weights.coding +
      scores.technical * weights.technical +
      scores.softSkills * weights.softSkills +
      scores.resume * weights.resume;

    return Math.round(weightedSum);
  };

  const generateAITips = async (testResults, resumeDoc, componentScores) => {
    try {
      if (!userProfile || testResults.length === 0) {
        return [
          { text: 'Complete your profile to get personalized tips', priority: 'high' },
          { text: 'Take your first test to begin your journey', priority: 'medium' },
        ];
      }

      // Generate tips based on scores
      const tips = [];

      if (componentScores.aptitude < 70) {
        tips.push({
          text: 'Focus on improving your aptitude skills. Practice more quantitative and logical reasoning questions.',
          priority: 'high',
          action: 'Take Aptitude Test',
          onPress: () => navigation.navigate('TestList'),
        });
      }

      if (componentScores.coding < 70) {
        tips.push({
          text: 'Strengthen your coding skills. Try practicing algorithm problems daily.',
          priority: 'high',
          action: 'Practice Coding',
          onPress: () => navigation.navigate('TestList'),
        });
      }

      if (!resumeDoc.exists()) {
        tips.push({
          text: 'Build an ATS-friendly resume to improve your job application success rate.',
          priority: 'high',
          action: 'Build Resume',
          onPress: () => navigation.navigate('ResumeBuilder'),
        });
      }

      if (componentScores.resume < 70 && resumeDoc.exists()) {
        tips.push({
          text: 'Your resume needs optimization. Update it with better keywords and formatting.',
          priority: 'medium',
          action: 'Optimize Resume',
          onPress: () => navigation.navigate('ResumeBuilder'),
        });
      }

      if (tips.length === 0) {
        tips.push({
          text: 'Great progress! Keep practicing and explore new learning resources.',
          priority: 'low',
          action: 'View Resources',
          onPress: () => navigation.navigate('LearningResources'),
        });
      }

      return tips.slice(0, 3); // Return top 3 tips
    } catch (error) {
      console.error('Error generating AI tips:', error);
      return [
        { text: 'Complete tests to get personalized recommendations', priority: 'medium' },
      ];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      title: 'Readiness Score',
      description: `Your placement readiness: ${stats.readinessScore}%`,
      icon: 'chart-line',
      onPress: () => navigation.navigate('ReadinessDashboard'),
      color: stats.readinessScore >= 80 ? colors.success : stats.readinessScore >= 60 ? colors.warning : colors.error,
    },
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
      title: 'AI Analysis',
      description: 'Get AI-powered career insights',
      icon: 'robot',
      onPress: () => navigation.navigate('LLMAnalysis'),
      color: colors.accent,
    },
    {
      title: 'Career Roadmap',
      description: 'Get personalized career guidance',
      icon: 'map',
      onPress: () => navigation.navigate('CareerRoadmap'),
      color: colors.info,
    },
    {
      title: 'Learn Skills',
      description: 'Explore learning resources',
      icon: 'book-open',
      onPress: () => navigation.navigate('LearningResources'),
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
          <Card.Content style={styles.welcomeContent}>
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeText}>
                <Title style={styles.welcomeTitle}>
                  Welcome back, {userProfile?.studentName || userProfile?.email?.split('@')[0]}!
                </Title>
                <Paragraph style={styles.welcomeSubtitle}>
                  Ready to take the next step in your career?
                </Paragraph>
              </View>
              {userProfile?.profileImageUrl ? (
                <Avatar.Image 
                  size={60} 
                  source={{ uri: userProfile.profileImageUrl }} 
                  style={styles.profileAvatar}
                />
              ) : (
                <Avatar.Text 
                  size={60} 
                  label={userProfile?.studentName ? userProfile.studentName.charAt(0).toUpperCase() : 'U'} 
                  style={styles.profileAvatar}
                />
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Readiness Score Section */}
        <Card style={styles.readinessCard}>
          <Card.Content>
            <View style={styles.readinessHeader}>
              <View>
                <Title style={styles.readinessTitle}>Placement Readiness</Title>
                <Text style={styles.readinessLabel}>Overall Score</Text>
              </View>
              <View style={styles.readinessScoreContainer}>
                <Text style={[
                  styles.readinessScore,
                  { color: stats.readinessScore >= 80 ? colors.success : stats.readinessScore >= 60 ? colors.warning : colors.error }
                ]}>
                  {stats.readinessScore}%
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={stats.readinessScore / 100}
              color={stats.readinessScore >= 80 ? colors.success : stats.readinessScore >= 60 ? colors.warning : colors.error}
              style={styles.readinessProgressBar}
            />
            <Button
              mode="text"
              onPress={() => navigation.navigate('ReadinessDashboard')}
              style={styles.viewDetailsButton}
            >
              View Detailed Breakdown →
            </Button>
          </Card.Content>
        </Card>

        {/* Component Scores Quick View */}
        <Card style={styles.componentScoresCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Component Scores</Title>
            <View style={styles.componentScoresGrid}>
              <View style={styles.componentScoreItem}>
                <Text style={styles.componentScoreLabel}>Aptitude</Text>
                <Text style={[styles.componentScoreValue, { color: stats.componentScores.aptitude >= 70 ? colors.success : colors.error }]}>
                  {stats.componentScores.aptitude}%
                </Text>
              </View>
              <View style={styles.componentScoreItem}>
                <Text style={styles.componentScoreLabel}>Coding</Text>
                <Text style={[styles.componentScoreValue, { color: stats.componentScores.coding >= 70 ? colors.success : colors.error }]}>
                  {stats.componentScores.coding}%
                </Text>
              </View>
              <View style={styles.componentScoreItem}>
                <Text style={styles.componentScoreLabel}>Technical</Text>
                <Text style={[styles.componentScoreValue, { color: stats.componentScores.technical >= 70 ? colors.success : colors.error }]}>
                  {stats.componentScores.technical}%
                </Text>
              </View>
              <View style={styles.componentScoreItem}>
                <Text style={styles.componentScoreLabel}>Resume</Text>
                <Text style={[styles.componentScoreValue, { color: stats.componentScores.resume >= 70 ? colors.success : colors.error }]}>
                  {stats.componentScores.resume}%
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* AI Tips Section */}
        {aiTips.length > 0 && (
          <Card style={styles.aiTipsCard}>
            <Card.Content>
              <View style={styles.aiTipsHeader}>
                <Title style={styles.cardTitle}>🤖 AI Tips for You</Title>
                <Chip icon="robot" mode="flat" compact>Powered by AI</Chip>
              </View>
              {aiTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipText}>{tip.text}</Text>
                    {tip.action && (
                      <Button
                        mode="outlined"
                        compact
                        onPress={tip.onPress}
                        style={styles.tipActionButton}
                      >
                        {tip.action}
                      </Button>
                    )}
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

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

        {/* Continuous Loop Section */}
        <Card style={styles.loopCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>📈 Your Learning Journey</Title>
            <View style={styles.loopSteps}>
              <View style={styles.loopStep}>
                <View style={[styles.loopStepIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={styles.loopStepNumber}>1</Text>
                </View>
                <Text style={styles.loopStepText}>Take Tests</Text>
              </View>
              <Text style={styles.loopArrow}>→</Text>
              <View style={styles.loopStep}>
                <View style={[styles.loopStepIcon, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={styles.loopStepNumber}>2</Text>
                </View>
                <Text style={styles.loopStepText}>Get AI Feedback</Text>
              </View>
              <Text style={styles.loopArrow}>→</Text>
              <View style={styles.loopStep}>
                <View style={[styles.loopStepIcon, { backgroundColor: colors.success + '20' }]}>
                  <Text style={styles.loopStepNumber}>3</Text>
                </View>
                <Text style={styles.loopStepText}>Learn Skills</Text>
              </View>
              <Text style={styles.loopArrow}>→</Text>
              <View style={styles.loopStep}>
                <View style={[styles.loopStepIcon, { backgroundColor: colors.secondary + '20' }]}>
                  <Text style={styles.loopStepNumber}>4</Text>
                </View>
                <Text style={styles.loopStepText}>Improve Score</Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('CareerRoadmap')}
              style={styles.loopButton}
            >
              Start Your Journey →
            </Button>
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
  readinessCard: {
    margin: 16,
    marginVertical: 8,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readinessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  readinessLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  readinessScoreContainer: {
    alignItems: 'flex-end',
  },
  readinessScore: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  readinessProgressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  viewDetailsButton: {
    marginTop: 8,
  },
  componentScoresCard: {
    margin: 16,
    marginVertical: 8,
  },
  componentScoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  componentScoreItem: {
    width: '48%',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  componentScoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  componentScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  aiTipsCard: {
    margin: 16,
    marginVertical: 8,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  aiTipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tipContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  tipActionButton: {
    alignSelf: 'flex-start',
  },
  loopCard: {
    margin: 16,
    marginVertical: 8,
    marginBottom: 32,
  },
  loopSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  loopStep: {
    alignItems: 'center',
    flex: 1,
    minWidth: 70,
  },
  loopStepIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  loopStepNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  loopStepText: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
  },
  loopArrow: {
    fontSize: 20,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  loopButton: {
    marginTop: 8,
  },
  welcomeContent: {
    paddingVertical: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeText: {
    flex: 1,
    marginRight: 16,
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
  profileAvatar: {
    backgroundColor: colors.white,
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
