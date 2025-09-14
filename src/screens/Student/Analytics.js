import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  Chip,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const Analytics = ({ navigation }) => {
  const [analytics, setAnalytics] = useState({
    testScores: [],
    timeSpent: 0,
    badgesEarned: 0,
    resumeViews: 0,
    improvementAreas: [],
    strengths: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // For now, we'll create sample analytics data
      // In a real app, this would be fetched from Firestore
      const sampleAnalytics = {
        testScores: [
          { test: 'Aptitude Test 1', score: 85, date: '2024-01-15' },
          { test: 'Coding Test 1', score: 72, date: '2024-01-20' },
          { test: 'Technical Test 1', score: 90, date: '2024-01-25' },
          { test: 'Aptitude Test 2', score: 88, date: '2024-02-01' },
        ],
        timeSpent: 24, // hours
        badgesEarned: 5,
        resumeViews: 12,
        improvementAreas: [
          'Data Structures',
          'Algorithm Design',
          'System Design',
        ],
        strengths: [
          'Problem Solving',
          'Communication',
          'Teamwork',
        ],
      };
      
      setAnalytics(sampleAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overview Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Performance Overview</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{analytics.testScores.length}</Text>
                <Text style={styles.statLabel}>Tests Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{analytics.timeSpent}h</Text>
                <Text style={styles.statLabel}>Time Spent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{analytics.badgesEarned}</Text>
                <Text style={styles.statLabel}>Badges Earned</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{analytics.resumeViews}</Text>
                <Text style={styles.statLabel}>Resume Views</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Test Scores */}
        <Card style={styles.scoresCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Test Scores</Title>
            {analytics.testScores.map((test, index) => (
              <View key={index} style={styles.scoreItem}>
                <View style={styles.scoreHeader}>
                  <Text style={styles.testName}>{test.test}</Text>
                  <Chip
                    style={[styles.scoreChip, { backgroundColor: getScoreColor(test.score) }]}
                    textStyle={{ color: colors.white }}
                  >
                    {test.score}%
                  </Chip>
                </View>
                <Text style={styles.testDate}>{test.date}</Text>
                <Text style={styles.scoreLabel}>{getScoreLabel(test.score)}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Strengths */}
        <Card style={styles.strengthsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Your Strengths</Title>
            <View style={styles.skillsContainer}>
              {analytics.strengths.map((strength, index) => (
                <Chip
                  key={index}
                  icon="check-circle"
                  style={[styles.skillChip, { backgroundColor: colors.success }]}
                  textStyle={{ color: colors.white }}
                >
                  {strength}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Improvement Areas */}
        <Card style={styles.improvementCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Areas for Improvement</Title>
            <View style={styles.skillsContainer}>
              {analytics.improvementAreas.map((area, index) => (
                <Chip
                  key={index}
                  icon="alert-circle"
                  style={[styles.skillChip, { backgroundColor: colors.warning }]}
                  textStyle={{ color: colors.white }}
                >
                  {area}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Recommendations */}
        <Card style={styles.recommendationsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recommendations</Title>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>
                • Focus on data structures and algorithms practice
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>
                • Complete more coding challenges
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>
                • Update your resume with recent achievements
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>
                • Practice system design concepts
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Take Action</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('TestList')}
                style={styles.actionButton}
              >
                Take Practice Test
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('ResumeBuilder')}
                style={styles.actionButton}
              >
                Update Resume
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
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
  statsCard: {
    margin: 16,
    marginBottom: 8,
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
  scoresCard: {
    margin: 16,
    marginVertical: 8,
  },
  scoreItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: colors.text,
  },
  scoreChip: {
    marginLeft: 8,
  },
  testDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  strengthsCard: {
    margin: 16,
    marginVertical: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginBottom: 8,
  },
  improvementCard: {
    margin: 16,
    marginVertical: 8,
  },
  recommendationsCard: {
    margin: 16,
    marginVertical: 8,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default Analytics;
