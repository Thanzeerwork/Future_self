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
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import AnimatedChart from '../../components/AnimatedChart';
import Loader from '../../components/Loader';

const { width } = Dimensions.get('window');

const ReadinessDashboard = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { colors: themeColors } = useThemeMode();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readinessData, setReadinessData] = useState(null);

  useEffect(() => {
    loadReadinessData();
  }, []);

  const loadReadinessData = async () => {
    try {
      setLoading(true);
      
      // Fetch all test results
      const testResultsQuery = query(
        collection(firestore, 'testResults'),
        where('userId', '==', userProfile?.uid)
      );
      const testResultsSnapshot = await getDocs(testResultsQuery);
      const testResults = testResultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch resume data
      const resumeDocRef = doc(firestore, 'resumes', userProfile?.uid);
      const resumeDoc = await getDoc(resumeDocRef);

      // Calculate component scores
      const scores = calculateScores(testResults, resumeDoc, userProfile);

      // Calculate overall readiness
      const overallScore = calculateOverallReadiness(scores);

      // Get trend data
      const trends = calculateTrends(testResults);

      setReadinessData({
        overallScore,
        componentScores: scores,
        trends,
        recommendations: generateRecommendations(scores, overallScore),
        lastUpdated: new Date(),
      });

    } catch (error) {
      console.error('Error loading readiness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = (testResults, resumeDoc, profile) => {
    // Calculate aptitude score
    const aptitudeTests = testResults.filter(r => r.category === 'Aptitude');
    const aptitudeScore = aptitudeTests.length > 0
      ? aptitudeTests.reduce((sum, test) => sum + (test.score || 0), 0) / aptitudeTests.length
      : 0;

    // Calculate coding score
    const codingTests = testResults.filter(r => r.category === 'Coding');
    const codingScore = codingTests.length > 0
      ? codingTests.reduce((sum, test) => sum + (test.score || 0), 0) / codingTests.length
      : 0;

    // Calculate technical score
    const technicalTests = testResults.filter(r => r.category === 'Technical');
    const technicalScore = technicalTests.length > 0
      ? technicalTests.reduce((sum, test) => sum + (test.score || 0), 0) / technicalTests.length
      : 0;

    // Calculate soft skills score
    const softSkillsTests = testResults.filter(r => r.category === 'Soft Skills');
    const softSkillsScore = softSkillsTests.length > 0
      ? softSkillsTests.reduce((sum, test) => sum + (test.score || 0), 0) / softSkillsTests.length
      : 0;

    // Calculate resume score
    const resumeScore = resumeDoc.exists() 
      ? (resumeDoc.data().atsScore || 70) 
      : 0;

    return {
      aptitude: Math.round(aptitudeScore),
      coding: Math.round(codingScore),
      technical: Math.round(technicalScore),
      softSkills: Math.round(softSkillsScore),
      resume: Math.round(resumeScore),
    };
  };

  const calculateOverallReadiness = (scores) => {
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

  const calculateTrends = (testResults) => {
    // Group by month
    const monthlyData = {};
    testResults.forEach(result => {
      const date = result.completedAt?.toDate?.() || new Date(result.completedAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[month]) {
        monthlyData[month] = { scores: [], count: 0 };
      }
      monthlyData[month].scores.push(result.score || 0);
      monthlyData[month].count++;
    });

    // Calculate average per month
    const trends = Object.entries(monthlyData)
      .sort()
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month,
        averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
        testCount: data.count,
      }));

    return trends;
  };

  const generateRecommendations = (scores, overallScore) => {
    const recommendations = [];

    if (scores.aptitude < 70) {
      recommendations.push({
        priority: 'High',
        category: 'Aptitude',
        message: 'Focus on improving aptitude skills through practice tests',
        action: 'Take more aptitude tests',
      });
    }

    if (scores.coding < 70) {
      recommendations.push({
        priority: 'High',
        category: 'Coding',
        message: 'Strengthen programming fundamentals and practice coding challenges',
        action: 'Practice coding problems',
      });
    }

    if (scores.resume < 70) {
      recommendations.push({
        priority: 'High',
        category: 'Resume',
        message: 'Optimize your resume for better ATS compatibility',
        action: 'Update resume',
      });
    }

    if (overallScore < 60) {
      recommendations.push({
        priority: 'High',
        category: 'Overall',
        message: 'Focus on comprehensive skill development',
        action: 'Follow career roadmap',
      });
    }

    return recommendations;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReadinessData();
    setRefreshing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getReadinessLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: colors.success, icon: 'star' };
    if (score >= 80) return { level: 'Good', color: colors.primary, icon: 'check-circle' };
    if (score >= 70) return { level: 'Fair', color: colors.warning, icon: 'alert' };
    if (score >= 60) return { level: 'Needs Improvement', color: colors.error, icon: 'alert-circle' };
    return { level: 'Critical', color: colors.error, icon: 'alert-circle-outline' };
  };

  if (loading) {
    return <Loader visible={true} message="Loading readiness data..." />;
  }

  if (!readinessData) {
    return (
      <View style={styles.container}>
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Title>No Data Available</Title>
            <Paragraph>Complete some tests to see your readiness score</Paragraph>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('TestList')}
              style={styles.button}
            >
              Take a Test
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const readinessLevel = getReadinessLevel(readinessData.overallScore);

  // Prepare chart data
  const chartData = {
    labels: readinessData.trends.map(t => {
      const date = new Date(t.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [{
      data: readinessData.trends.map(t => Math.round(t.averageScore)),
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const componentChartData = {
    labels: ['Aptitude', 'Coding', 'Technical', 'Soft Skills', 'Resume'],
    datasets: [{
      data: [
        readinessData.componentScores.aptitude,
        readinessData.componentScores.coding,
        readinessData.componentScores.technical,
        readinessData.componentScores.softSkills,
        readinessData.componentScores.resume,
      ],
    }],
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overall Readiness Score */}
        <Card style={styles.overallCard}>
          <Card.Content>
            <View style={styles.overallHeader}>
              <View>
                <Text style={styles.overallLabel}>Overall Readiness</Text>
                <Title style={[styles.overallScore, { color: readinessLevel.color }]}>
                  {readinessData.overallScore}%
                </Title>
                <Chip
                  icon={readinessLevel.icon}
                  style={[styles.levelChip, { backgroundColor: readinessLevel.color + '20' }]}
                  textStyle={{ color: readinessLevel.color }}
                >
                  {readinessLevel.level}
                </Chip>
              </View>
            </View>
            <ProgressBar
              progress={readinessData.overallScore / 100}
              color={readinessLevel.color}
              style={styles.overallProgressBar}
            />
            <Text style={styles.overallSubtext}>
              {readinessData.overallScore >= 80
                ? 'You\'re well-prepared for placements!'
                : readinessData.overallScore >= 60
                ? 'Keep practicing to improve your readiness'
                : 'Focus on skill development to increase your readiness'}
            </Text>
          </Card.Content>
        </Card>

        {/* Component Scores */}
        <Card style={styles.componentCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Component Scores</Title>
            
            {Object.entries(readinessData.componentScores).map(([key, score]) => (
              <View key={key} style={styles.componentRow}>
                <View style={styles.componentInfo}>
                  <Text style={styles.componentLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <Text style={[styles.componentScore, { color: getScoreColor(score) }]}>
                    {score}%
                  </Text>
                </View>
                <ProgressBar
                  progress={score / 100}
                  color={getScoreColor(score)}
                  style={styles.componentProgressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Component Chart */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Score Breakdown</Title>
            <AnimatedChart
              type="bar"
              data={componentChartData}
              width={width - 64}
              height={220}
            />
          </Card.Content>
        </Card>

        {/* Progress Trends */}
        {readinessData.trends.length > 0 && (
          <Card style={styles.trendCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Progress Trend (Last 6 Months)</Title>
              <AnimatedChart
                type="line"
                data={chartData}
                width={width - 64}
                height={220}
              />
            </Card.Content>
          </Card>
        )}

        {/* Recommendations */}
        {readinessData.recommendations.length > 0 && (
          <Card style={styles.recommendationsCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Recommendations</Title>
              {readinessData.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={styles.recommendationHeader}>
                    <Chip
                      style={[
                        styles.priorityChip,
                        {
                          backgroundColor:
                            rec.priority === 'High'
                              ? colors.error + '20'
                              : colors.warning + '20',
                        },
                      ]}
                      textStyle={{
                        color: rec.priority === 'High' ? colors.error : colors.warning,
                      }}
                    >
                      {rec.priority} Priority
                    </Chip>
                    <Text style={styles.recommendationCategory}>{rec.category}</Text>
                  </View>
                  <Text style={styles.recommendationMessage}>{rec.message}</Text>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => {
                      if (rec.action === 'Take more aptitude tests') {
                        navigation.navigate('TestList');
                      } else if (rec.action === 'Update resume') {
                        navigation.navigate('ResumeBuilder');
                      } else if (rec.action === 'Follow career roadmap') {
                        navigation.navigate('CareerRoadmap');
                      }
                    }}
                    style={styles.recommendationButton}
                  >
                    {rec.action}
                  </Button>
                  {index < readinessData.recommendations.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Improve Your Readiness</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="school"
                onPress={() => navigation.navigate('TestList')}
                style={styles.actionButton}
              >
                Take Tests
              </Button>
              <Button
                mode="contained"
                icon="file-document"
                onPress={() => navigation.navigate('ResumeBuilder')}
                style={styles.actionButton}
              >
                Build Resume
              </Button>
              <Button
                mode="contained"
                icon="book-open"
                onPress={() => navigation.navigate('LearningResources')}
                style={styles.actionButton}
              >
                Learn Skills
              </Button>
              <Button
                mode="contained"
                icon="map"
                onPress={() => navigation.navigate('CareerRoadmap')}
                style={styles.actionButton}
              >
                View Roadmap
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
  },
  scrollView: {
    flex: 1,
  },
  overallCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.primary,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  overallLabel: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  levelChip: {
    alignSelf: 'flex-start',
  },
  overallProgressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  overallSubtext: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.9,
  },
  componentCard: {
    margin: 16,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  componentRow: {
    marginBottom: 16,
  },
  componentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  componentLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  componentScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  componentProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  chartCard: {
    margin: 16,
    marginVertical: 8,
  },
  trendCard: {
    margin: 16,
    marginVertical: 8,
  },
  recommendationsCard: {
    margin: 16,
    marginVertical: 8,
  },
  recommendationItem: {
    marginBottom: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  priorityChip: {
    height: 24,
  },
  recommendationCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  recommendationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  recommendationButton: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginTop: 16,
  },
  actionsCard: {
    margin: 16,
    marginVertical: 8,
    marginBottom: 32,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  emptyCard: {
    margin: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default ReadinessDashboard;

