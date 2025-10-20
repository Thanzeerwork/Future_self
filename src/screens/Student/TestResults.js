import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Chip,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../../firebase.config';
import { collection, addDoc } from 'firebase/firestore';
import llmTestService from '../../services/llmTestService';

const TestResults = ({ route, navigation }) => {
  const { userProfile } = useAuth();
  const { testResults } = route.params;
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      
      console.log('Generating report for test results:', testResults);
      
      // Check if this is raw test data or processed report data
      const isProcessedReport = testResults && testResults.score !== undefined && testResults.totalQuestions !== undefined;
      
      if (isProcessedReport) {
        // This is already a processed report from Firestore
        console.log('Using processed report data');
        setReport(testResults);
        setIsGenerating(false);
        return;
      }
      
      // This is raw test data that needs processing
      if (!testResults || !testResults.questions || !testResults.answers) {
        console.error('Invalid test results data:', testResults);
        throw new Error('Invalid test results data');
      }
      
      // Calculate basic statistics
      const questions = testResults.questions || [];
      const answers = testResults.answers || {};
      
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(answers).length;
      
      console.log('Questions count:', totalQuestions, 'Answers count:', answeredQuestions);
      
      if (totalQuestions === 0) {
        throw new Error('No questions found in test results');
      }
      
      const correctAnswers = Object.keys(answers).filter(
        (index) => {
          const question = questions[parseInt(index)];
          const userAnswer = answers[parseInt(index)];
          return question && question.correctAnswer === userAnswer;
        }
      ).length;

      const basicResults = {
        totalQuestions,
        answeredQuestions,
        correctAnswers,
        score: Math.round((correctAnswers / totalQuestions) * 100),
        category: testResults.category,
        difficulty: testResults.difficulty,
        isPersonalized: testResults.isPersonalized,
        completedAt: testResults.completedAt,
      };

      // Generate AI-powered report
      const userProfile = {
        experienceLevel: testResults.difficulty,
        skills: [testResults.category],
        weakAreas: [],
        careerGoals: 'Professional Development',
        previousPerformance: 'Good',
      };

      const aiReport = await llmTestService.generateTestReport(basicResults, userProfile);
      const finalReport = { ...basicResults, ...aiReport };
      setReport(finalReport);
      
      // Only save if this is raw test data, not an already processed report
      if (!isProcessedReport) {
        await saveTestResults(finalReport);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate detailed report');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTestResults = async (reportData) => {
    try {
      if (!userProfile?.uid) {
        console.warn('No user profile available, skipping save');
        return;
      }

      const testResultData = {
        userId: userProfile.uid,
        category: reportData.category || 'Unknown',
        difficulty: reportData.difficulty || 'Beginner',
        score: reportData.score || 0,
        totalQuestions: reportData.totalQuestions || 0,
        correctAnswers: reportData.correctAnswers || 0,
        answeredQuestions: reportData.answeredQuestions || 0,
        isPersonalized: reportData.isPersonalized || false,
        completedAt: reportData.completedAt || new Date().toISOString(),
        strengths: reportData.strengths || [],
        weaknesses: reportData.weaknesses || [],
        recommendations: reportData.recommendations || [],
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(firestore, 'testResults'), testResultData);
      console.log('Test results saved to Firestore');
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const retakeTest = () => {
    navigation.navigate('TestGenerator');
  };

  const viewDetailedAnalysis = () => {
    navigation.navigate('DetailedAnalysis', { report });
  };

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generating your personalized report...</Text>
        <Text style={styles.loadingSubtext}>This may take a few moments</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={generateReport}>
          Retry
        </Button>
      </View>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>Test Completed!</Title>
            <Paragraph style={styles.headerSubtitle}>
              {testResults.category} Test - {testResults.difficulty} Level
            </Paragraph>
            {testResults.isPersonalized && (
              <Chip style={styles.personalizedChip}>
                Personalized Test
              </Chip>
            )}
          </Card.Content>
        </Card>

        {/* Score Overview */}
        <Card style={styles.scoreCard}>
          <Card.Content>
            <Title style={styles.scoreTitle}>Your Score</Title>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={[styles.scoreText, { color: getScoreColor(report.score) }]}>
                  {report.score}%
                </Text>
                <Text style={styles.scoreLabel}>{getScoreLabel(report.score)}</Text>
              </View>
              <View style={styles.scoreDetails}>
                <Text style={styles.scoreDetailText}>
                  {report.correctAnswers} out of {report.totalQuestions} correct
                </Text>
                <Text style={styles.scoreDetailText}>
                  {report.answeredQuestions} questions answered
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={report.score / 100}
              color={getScoreColor(report.score)}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        {/* Strengths */}
        {report.strengths && report.strengths.length > 0 && (
          <Card style={styles.strengthsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Strengths</Title>
              <View style={styles.chipsContainer}>
                {report.strengths.map((strength, index) => (
                  <Chip
                    key={index}
                    icon="check-circle"
                    style={[styles.strengthChip, { backgroundColor: colors.success }]}
                    textStyle={{ color: colors.white }}
                  >
                    {strength}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Areas for Improvement */}
        {report.weaknesses && report.weaknesses.length > 0 && (
          <Card style={styles.weaknessesCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Areas for Improvement</Title>
              <View style={styles.chipsContainer}>
                {report.weaknesses.map((weakness, index) => (
                  <Chip
                    key={index}
                    icon="alert-circle"
                    style={[styles.weaknessChip, { backgroundColor: colors.warning }]}
                    textStyle={{ color: colors.white }}
                  >
                    {weakness}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <Card style={styles.recommendationsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Recommendations</Title>
              {report.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>
                    • {recommendation}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Next Steps */}
        {report.nextSteps && report.nextSteps.length > 0 && (
          <Card style={styles.nextStepsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Next Steps</Title>
              {report.nextSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Detailed Analysis */}
        {report.detailedAnalysis && (
          <Card style={styles.analysisCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Detailed Analysis</Title>
              <Paragraph style={styles.analysisText}>
                {report.detailedAnalysis}
              </Paragraph>
              <Button
                mode="outlined"
                onPress={viewDetailedAnalysis}
                style={styles.analysisButton}
              >
                View Full Analysis
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Resources */}
        {report.resources && report.resources.length > 0 && (
          <Card style={styles.resourcesCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Recommended Resources</Title>
              {report.resources.map((resource, index) => (
                <View key={index} style={styles.resourceItem}>
                  <Text style={styles.resourceText}>
                    • {resource}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={retakeTest}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
            >
              Take Another Test
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('StudentApp', { screen: 'TestList' })}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
            >
              Back to Test List
            </Button>
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
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
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
  personalizedChip: {
    marginTop: 8,
    backgroundColor: colors.accent,
  },
  scoreCard: {
    margin: 16,
    marginVertical: 8,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    alignItems: 'center',
    marginRight: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreDetailText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  strengthsCard: {
    margin: 16,
    marginVertical: 8,
  },
  weaknessesCard: {
    margin: 16,
    marginVertical: 8,
  },
  recommendationsCard: {
    margin: 16,
    marginVertical: 8,
  },
  nextStepsCard: {
    margin: 16,
    marginVertical: 8,
  },
  analysisCard: {
    margin: 16,
    marginVertical: 8,
  },
  resourcesCard: {
    margin: 16,
    marginVertical: 8,
  },
  actionCard: {
    margin: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  strengthChip: {
    marginBottom: 8,
  },
  weaknessChip: {
    marginBottom: 8,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 12,
    minWidth: 24,
  },
  stepText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
  },
  analysisText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  analysisButton: {
    alignSelf: 'flex-start',
  },
  resourceItem: {
    marginBottom: 8,
  },
  resourceText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default TestResults;

