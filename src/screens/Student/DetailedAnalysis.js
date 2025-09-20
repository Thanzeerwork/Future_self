import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Chip,
  Divider,
} from 'react-native-paper';
import { colors } from '../../constants/colors';

const DetailedAnalysis = ({ route }) => {
  const { report } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Performance Overview */}
        <Card style={styles.overviewCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Performance Overview</Title>
            <View style={styles.overviewStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{report.score}%</Text>
                <Text style={styles.statLabel}>Overall Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{report.correctAnswers}</Text>
                <Text style={styles.statLabel}>Correct Answers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{report.totalQuestions}</Text>
                <Text style={styles.statLabel}>Total Questions</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Detailed Analysis */}
        <Card style={styles.analysisCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Comprehensive Analysis</Title>
            <Paragraph style={styles.analysisText}>
              {report.detailedAnalysis}
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Improvement Plan */}
        {report.improvementPlan && (
          <Card style={styles.improvementCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Personalized Improvement Plan</Title>
              <Paragraph style={styles.improvementText}>
                {report.improvementPlan}
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Strengths Analysis */}
        {report.strengths && report.strengths.length > 0 && (
          <Card style={styles.strengthsCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Identified Strengths</Title>
              <Paragraph style={styles.sectionDescription}>
                Based on your performance, you demonstrate strong capabilities in these areas:
              </Paragraph>
              {report.strengths.map((strength, index) => (
                <View key={index} style={styles.strengthItem}>
                  <Chip
                    icon="check-circle"
                    style={styles.strengthChip}
                  >
                    {strength}
                  </Chip>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Weaknesses Analysis */}
        {report.weaknesses && report.weaknesses.length > 0 && (
          <Card style={styles.weaknessesCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Areas Requiring Attention</Title>
              <Paragraph style={styles.sectionDescription}>
                Focus on improving these areas to enhance your overall performance:
              </Paragraph>
              {report.weaknesses.map((weakness, index) => (
                <View key={index} style={styles.weaknessItem}>
                  <Chip
                    icon="alert-circle"
                    style={styles.weaknessChip}
                  >
                    {weakness}
                  </Chip>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <Card style={styles.recommendationsCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Strategic Recommendations</Title>
              <Paragraph style={styles.sectionDescription}>
                Here are specific actions you can take to improve your performance:
              </Paragraph>
              {report.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationNumber}>{index + 1}</Text>
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Next Steps */}
        {report.nextSteps && report.nextSteps.length > 0 && (
          <Card style={styles.nextStepsCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Immediate Next Steps</Title>
              <Paragraph style={styles.sectionDescription}>
                Prioritize these actions to continue your learning journey:
              </Paragraph>
              {report.nextSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Learning Resources */}
        {report.resources && report.resources.length > 0 && (
          <Card style={styles.resourcesCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Recommended Learning Resources</Title>
              <Paragraph style={styles.sectionDescription}>
                Explore these resources to strengthen your knowledge and skills:
              </Paragraph>
              {report.resources.map((resource, index) => (
                <View key={index} style={styles.resourceItem}>
                  <Text style={styles.resourceBullet}>•</Text>
                  <Text style={styles.resourceText}>{resource}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Performance Insights */}
        <Card style={styles.insightsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Performance Insights</Title>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Test Category:</Text>
              <Chip style={styles.categoryChip}>{report.category}</Chip>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Difficulty Level:</Text>
              <Chip style={styles.difficultyChip}>{report.difficulty}</Chip>
            </View>
            {report.isPersonalized && (
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Test Type:</Text>
                <Chip style={styles.personalizedChip}>Personalized</Chip>
              </View>
            )}
            <Divider style={styles.divider} />
            <Text style={styles.insightText}>
              This analysis was generated using advanced AI technology to provide you with 
              personalized insights and actionable recommendations based on your test performance.
            </Text>
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
  overviewCard: {
    margin: 16,
    marginBottom: 8,
  },
  analysisCard: {
    margin: 16,
    marginVertical: 8,
  },
  improvementCard: {
    margin: 16,
    marginVertical: 8,
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
  resourcesCard: {
    margin: 16,
    marginVertical: 8,
  },
  insightsCard: {
    margin: 16,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  improvementText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  strengthItem: {
    marginBottom: 8,
  },
  strengthChip: {
    backgroundColor: colors.success,
    alignSelf: 'flex-start',
  },
  weaknessItem: {
    marginBottom: 8,
  },
  weaknessChip: {
    backgroundColor: colors.warning,
    alignSelf: 'flex-start',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 12,
    minWidth: 24,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  stepText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resourceBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  resourceText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginRight: 8,
  },
  categoryChip: {
    backgroundColor: colors.secondary,
  },
  difficultyChip: {
    backgroundColor: colors.accent,
  },
  personalizedChip: {
    backgroundColor: colors.primary,
  },
  divider: {
    marginVertical: 16,
  },
  insightText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default DetailedAnalysis;

