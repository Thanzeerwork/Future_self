import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Chip,
  ProgressBar,
  SegmentedButtons,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const TestAnalytics = ({ navigation }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedCategory]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // This would typically fetch from a real analytics collection
      // For now, we'll create mock data
      const mockAnalytics = {
        totalTests: 45,
        totalAttempts: 234,
        averageScore: 78.5,
        completionRate: 85.2,
        categoryBreakdown: [
          { category: 'Aptitude', tests: 12, attempts: 67, avgScore: 82.3 },
          { category: 'Coding', tests: 15, attempts: 89, avgScore: 75.8 },
          { category: 'Technical', tests: 10, attempts: 45, avgScore: 79.1 },
          { category: 'Soft Skills', tests: 8, attempts: 33, avgScore: 81.2 },
        ],
        difficultyBreakdown: [
          { difficulty: 'Beginner', tests: 20, attempts: 120, avgScore: 85.4 },
          { difficulty: 'Intermediate', tests: 18, attempts: 78, avgScore: 76.2 },
          { difficulty: 'Advanced', tests: 7, attempts: 36, avgScore: 68.9 },
        ],
        recentActivity: [
          { date: '2024-01-15', tests: 5, attempts: 23, avgScore: 79.2 },
          { date: '2024-01-14', tests: 3, attempts: 18, avgScore: 81.5 },
          { date: '2024-01-13', tests: 7, attempts: 31, avgScore: 77.8 },
          { date: '2024-01-12', tests: 4, attempts: 19, avgScore: 83.1 },
          { date: '2024-01-11', tests: 6, attempts: 27, avgScore: 76.9 },
        ],
        topPerformers: [
          { name: 'John Doe', score: 95.2, tests: 12 },
          { name: 'Jane Smith', score: 92.8, tests: 10 },
          { name: 'Mike Johnson', score: 89.5, tests: 8 },
          { name: 'Sarah Wilson', score: 87.3, tests: 9 },
        ],
        popularTests: [
          { title: 'JavaScript Fundamentals', attempts: 45, avgScore: 78.2 },
          { title: 'React Development', attempts: 38, avgScore: 81.5 },
          { title: 'Data Structures', attempts: 32, avgScore: 74.8 },
          { title: 'System Design', attempts: 28, avgScore: 69.3 },
        ],
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load analytics</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>Test Analytics</Title>
            <Paragraph style={styles.headerSubtitle}>
              Comprehensive insights into test performance and usage
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Time Range Selector */}
        <Card style={styles.selectorCard}>
          <Card.Content>
            <Title style={styles.selectorTitle}>Time Range</Title>
            <SegmentedButtons
              value={timeRange}
              onValueChange={setTimeRange}
              buttons={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'quarter', label: 'Quarter' },
                { value: 'year', label: 'Year' },
              ]}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Overview Stats */}
        <Card style={styles.overviewCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Overview</Title>
            <View style={styles.overviewStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analytics.totalTests}</Text>
                <Text style={styles.statLabel}>Total Tests</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analytics.totalAttempts}</Text>
                <Text style={styles.statLabel}>Total Attempts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: getScoreColor(analytics.averageScore) }]}>
                  {analytics.averageScore}%
                </Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analytics.completionRate}%</Text>
                <Text style={styles.statLabel}>Completion Rate</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Category Breakdown */}
        <Card style={styles.breakdownCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Performance by Category</Title>
            {analytics.categoryBreakdown.map((category, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownLabel}>{category.category}</Text>
                  <View style={styles.breakdownStats}>
                    <Text style={styles.breakdownStat}>{category.attempts} attempts</Text>
                    <Text style={[styles.breakdownScore, { color: getScoreColor(category.avgScore) }]}>
                      {category.avgScore}%
                    </Text>
                  </View>
                </View>
                <ProgressBar
                  progress={category.avgScore / 100}
                  color={getScoreColor(category.avgScore)}
                  style={styles.progressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Difficulty Breakdown */}
        <Card style={styles.breakdownCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Performance by Difficulty</Title>
            {analytics.difficultyBreakdown.map((difficulty, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Chip
                    style={[
                      styles.difficultyChip,
                      { backgroundColor: getDifficultyColor(difficulty.difficulty) }
                    ]}
                    textStyle={{ color: colors.white }}
                  >
                    {difficulty.difficulty}
                  </Chip>
                  <View style={styles.breakdownStats}>
                    <Text style={styles.breakdownStat}>{difficulty.attempts} attempts</Text>
                    <Text style={[styles.breakdownScore, { color: getScoreColor(difficulty.avgScore) }]}>
                      {difficulty.avgScore}%
                    </Text>
                  </View>
                </View>
                <ProgressBar
                  progress={difficulty.avgScore / 100}
                  color={getScoreColor(difficulty.avgScore)}
                  style={styles.progressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Activity</Title>
            {analytics.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityDate}>
                  <Text style={styles.activityDateText}>
                    {new Date(activity.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.activityStats}>
                  <Text style={styles.activityStat}>{activity.tests} tests</Text>
                  <Text style={styles.activityStat}>{activity.attempts} attempts</Text>
                  <Text style={[styles.activityScore, { color: getScoreColor(activity.avgScore) }]}>
                    {activity.avgScore}% avg
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Top Performers */}
        <Card style={styles.performersCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Top Performers</Title>
            {analytics.topPerformers.map((performer, index) => (
              <View key={index} style={styles.performerItem}>
                <View style={styles.performerRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.performerInfo}>
                  <Text style={styles.performerName}>{performer.name}</Text>
                  <Text style={styles.performerTests}>{performer.tests} tests completed</Text>
                </View>
                <View style={styles.performerScore}>
                  <Text style={[styles.scoreText, { color: getScoreColor(performer.score) }]}>
                    {performer.score}%
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Popular Tests */}
        <Card style={styles.popularCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Most Popular Tests</Title>
            {analytics.popularTests.map((test, index) => (
              <View key={index} style={styles.popularItem}>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularTitle}>{test.title}</Text>
                  <Text style={styles.popularAttempts}>{test.attempts} attempts</Text>
                </View>
                <View style={styles.popularScore}>
                  <Text style={[styles.popularScoreText, { color: getScoreColor(test.avgScore) }]}>
                    {test.avgScore}%
                  </Text>
                </View>
              </View>
            ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
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
  selectorCard: {
    margin: 16,
    marginVertical: 8,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  overviewCard: {
    margin: 16,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  overviewStats: {
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
  breakdownCard: {
    margin: 16,
    marginVertical: 8,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  breakdownStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownStat: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  breakdownScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  difficultyChip: {
    marginBottom: 4,
  },
  activityCard: {
    margin: 16,
    marginVertical: 8,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityDate: {
    flex: 1,
  },
  activityDateText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  activityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  performersCard: {
    margin: 16,
    marginVertical: 8,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  performerTests: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  performerScore: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  popularCard: {
    margin: 16,
    marginVertical: 8,
  },
  popularItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  popularInfo: {
    flex: 1,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  popularAttempts: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  popularScore: {
    alignItems: 'flex-end',
  },
  popularScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestAnalytics;

