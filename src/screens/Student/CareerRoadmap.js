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
  ProgressBar,
  FAB,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import AIFeedbackService from '../../services/aiFeedbackService';
import LearningResourcesService from '../../services/learningResourcesService';
import Loader from '../../components/Loader';

const CareerRoadmap = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [learningResources, setLearningResources] = useState([]);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      setLoading(true);

      // Fetch user's test results
      let testResults = [];
      if (userProfile?.uid) {
        const testResultsQuery = query(
          collection(firestore, 'testResults'),
          where('userId', '==', userProfile.uid)
        );
        const testResultsSnapshot = await getDocs(testResultsQuery);
        testResults = testResultsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      // Try to generate AI-powered roadmap
      let aiRoadmap = null;
      try {
        const insights = await AIFeedbackService.generateCareerInsights(userProfile, testResults);
        aiRoadmap = insights;
      } catch (error) {
        console.error('Error generating AI roadmap:', error);
      }

      // Get learning resources
      let resources = [];
      try {
        const recommendations = await LearningResourcesService.getPersonalizedRecommendations(userProfile || {}, 5);
        resources = recommendations.recommendedCourses || [];
      } catch (error) {
        console.error('Error getting learning resources:', error);
      }

      // If AI roadmap is available, use it; otherwise fallback to sample
      if (aiRoadmap && aiRoadmap.recommendedCareerPaths && aiRoadmap.recommendedCareerPaths.length > 0) {
        const topPath = aiRoadmap.recommendedCareerPaths[0];
        const roadmapData = {
          careerPath: topPath.title || 'Software Developer',
          currentLevel: 'Beginner', // Can be enhanced based on test scores
          progress: 25,
          matchScore: topPath.matchScore || 0,
          description: topPath.description || '',
          milestones: aiRoadmap.learningPath || generateDefaultMilestones(topPath.title),
          recommendations: aiRoadmap.recommendations || [],
          skillGaps: aiRoadmap.skillGaps || [],
          resources: resources,
        };
        setRoadmap(roadmapData);
        setLearningResources(resources);
      } else {
        // Fallback to sample roadmap
        const sampleRoadmap = {
        careerPath: 'Software Developer',
        currentLevel: 'Beginner',
        progress: 25,
        milestones: [
          {
            id: 1,
            title: 'Learn Programming Fundamentals',
            description: 'Master basic programming concepts and syntax',
            status: 'completed',
            skills: ['Variables', 'Loops', 'Functions', 'Data Structures'],
          },
          {
            id: 2,
            title: 'Choose a Programming Language',
            description: 'Select and master a primary programming language',
            status: 'in-progress',
            skills: ['JavaScript', 'Python', 'Java', 'C++'],
          },
          {
            id: 3,
            title: 'Learn Web Development',
            description: 'Build responsive web applications',
            status: 'pending',
            skills: ['HTML', 'CSS', 'React', 'Node.js'],
          },
          {
            id: 4,
            title: 'Build Projects',
            description: 'Create portfolio projects to showcase skills',
            status: 'pending',
            skills: ['Git', 'Deployment', 'Testing', 'Documentation'],
          },
          {
            id: 5,
            title: 'Prepare for Interviews',
            description: 'Practice coding interviews and system design',
            status: 'pending',
            skills: ['Algorithms', 'Data Structures', 'System Design', 'Behavioral Questions'],
          },
        ],
        recommendations: [
          'Complete at least 3 projects in your chosen language',
          'Contribute to open source projects',
          'Build a strong LinkedIn profile',
          'Practice coding challenges daily',
        ],
      };
      
        setRoadmap(sampleRoadmap);
        setLearningResources(resources);
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
      // Fallback to sample roadmap on error
      const sampleRoadmap = {
        careerPath: 'Software Developer',
        currentLevel: 'Beginner',
        progress: 25,
        milestones: generateDefaultMilestones('Software Developer'),
        recommendations: [
          'Complete at least 3 projects in your chosen language',
          'Contribute to open source projects',
          'Build a strong LinkedIn profile',
          'Practice coding challenges daily',
        ],
        resources: [],
      };
      setRoadmap(sampleRoadmap);
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultMilestones = (careerPath) => {
    return [
      {
        id: 1,
        title: 'Learn Programming Fundamentals',
        description: 'Master basic programming concepts and syntax',
        status: 'completed',
        skills: ['Variables', 'Loops', 'Functions', 'Data Structures'],
      },
      {
        id: 2,
        title: 'Choose a Programming Language',
        description: 'Select and master a primary programming language',
        status: 'in-progress',
        skills: ['JavaScript', 'Python', 'Java', 'C++'],
      },
      {
        id: 3,
        title: 'Learn Web Development',
        description: 'Build responsive web applications',
        status: 'pending',
        skills: ['HTML', 'CSS', 'React', 'Node.js'],
      },
      {
        id: 4,
        title: 'Build Projects',
        description: 'Create portfolio projects to showcase skills',
        status: 'pending',
        skills: ['Git', 'Deployment', 'Testing', 'Documentation'],
      },
      {
        id: 5,
        title: 'Prepare for Interviews',
        description: 'Practice coding interviews and system design',
        status: 'pending',
        skills: ['Algorithms', 'Data Structures', 'System Design', 'Behavioral Questions'],
      },
    ];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoadmap();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in-progress':
        return colors.warning;
      case 'pending':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in-progress':
        return 'clock';
      case 'pending':
        return 'circle-outline';
      default:
        return 'circle-outline';
    }
  };

  if (loading || !roadmap) {
    return <Loader visible={true} message="Generating your personalized career roadmap..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Career Path Overview */}
        <Card style={styles.overviewCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Career Path: {roadmap.careerPath}</Title>
            {roadmap.matchScore > 0 && (
              <Chip
                icon="star"
                style={styles.matchChip}
                textStyle={{ color: colors.white }}
              >
                {roadmap.matchScore}% Match
              </Chip>
            )}
            {roadmap.description && (
              <Paragraph style={styles.description}>
                {roadmap.description}
              </Paragraph>
            )}
            <Paragraph style={styles.currentLevel}>
              Current Level: {roadmap.currentLevel}
            </Paragraph>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Progress: {roadmap.progress}%
              </Text>
              <ProgressBar
                progress={roadmap.progress / 100}
                color={colors.primary}
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Skill Gaps */}
        {roadmap.skillGaps && roadmap.skillGaps.length > 0 && (
          <Card style={styles.skillGapsCard}>
            <Card.Content>
              <Title style={styles.cardTitle2}>Skill Gaps to Address</Title>
              {roadmap.skillGaps.slice(0, 5).map((gap, index) => (
                <View key={index} style={styles.skillGapItem}>
                  <View style={styles.skillGapHeader}>
                    <Text style={styles.skillGapName}>{gap.skill}</Text>
                    <Text style={styles.skillGapPriority}>
                      {gap.priority || 'Medium'} Priority
                    </Text>
                  </View>
                  <View style={styles.skillGapProgress}>
                    <Text style={styles.skillGapLabel}>
                      Current: {gap.currentLevel}% → Target: {gap.targetLevel}%
                    </Text>
                    <ProgressBar
                      progress={gap.currentLevel / gap.targetLevel}
                      color={colors.warning}
                      style={styles.skillGapProgressBar}
                    />
                  </View>
                  {gap.resources && gap.resources.length > 0 && (
                    <Button
                      mode="text"
                      compact
                      onPress={() => navigation.navigate('LearningResources', { skill: gap.skill })}
                    >
                      View Resources →
                    </Button>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Recommended Learning Resources */}
        {learningResources.length > 0 && (
          <Card style={styles.resourcesCard}>
            <Card.Content>
              <Title style={styles.cardTitle2}>📚 Recommended Courses</Title>
              {learningResources.slice(0, 3).map((resource, index) => (
                <Card key={index} style={styles.resourceCard} onPress={() => {
                  // In production, open course URL
                  navigation.navigate('LearningResources');
                }}>
                  <Card.Content>
                    <Title style={styles.resourceTitle}>{resource.title || 'Course'}</Title>
                    <Paragraph style={styles.resourceProvider}>
                      {resource.provider || 'Provider'}
                    </Paragraph>
                    <View style={styles.resourceInfo}>
                      <Chip mode="outlined" compact>{resource.difficulty || 'Beginner'}</Chip>
                      <Chip mode="outlined" compact>{resource.duration || 'N/A'}</Chip>
                      {resource.rating && (
                        <Chip mode="outlined" compact icon="star">
                          {resource.rating}
                        </Chip>
                      )}
                    </View>
                    {resource.relevance && (
                      <Paragraph style={styles.resourceRelevance}>
                        {resource.relevance}
                      </Paragraph>
                    )}
                  </Card.Content>
                </Card>
              ))}
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('LearningResources')}
                style={styles.viewAllButton}
              >
                View All Courses →
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Milestones */}
        <Card style={styles.milestonesCard}>
          <Card.Content>
            <Title style={styles.cardTitle2}>Learning Milestones</Title>
            {roadmap.milestones.map((milestone) => (
              <Card key={milestone.id} style={styles.milestoneCard}>
                <Card.Content>
                  <View style={styles.milestoneHeader}>
                    <Title style={styles.milestoneTitle}>{milestone.title}</Title>
                    <Chip
                      icon={getStatusIcon(milestone.status)}
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(milestone.status) }
                      ]}
                      textStyle={{ color: colors.white }}
                    >
                      {milestone.status.replace('-', ' ').toUpperCase()}
                    </Chip>
                  </View>
                  <Paragraph style={styles.milestoneDescription}>
                    {milestone.description}
                  </Paragraph>
                  <View style={styles.skillsContainer}>
                    {milestone.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        mode="outlined"
                        style={styles.skillChip}
                      >
                        {skill}
                      </Chip>
                    ))}
                  </View>
                  {milestone.status === 'in-progress' && (
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('LearningResources')}
                      style={styles.milestoneButton}
                    >
                      Continue Learning
                    </Button>
                  )}
                  {milestone.status === 'pending' && (
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('TestList')}
                      style={styles.milestoneButton}
                    >
                      Start Learning
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))}
          </Card.Content>
        </Card>

        {/* Recommendations */}
        <Card style={styles.recommendationsCard}>
          <Card.Content>
            <Title style={styles.cardTitle2}>Recommendations</Title>
            {roadmap.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • {recommendation}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* AI Suggestions */}
        <Card style={styles.suggestionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle2}>AI-Powered Suggestions</Title>
            <Paragraph style={styles.suggestionText}>
              Based on your progress and goals, we recommend focusing on:
            </Paragraph>
            <View style={styles.suggestionsContainer}>
              <Chip
                icon="lightbulb"
                style={styles.suggestionChip}
              >
                Complete JavaScript fundamentals
              </Chip>
              <Chip
                icon="lightbulb"
                style={styles.suggestionChip}
              >
                Start building a portfolio project
              </Chip>
              <Chip
                icon="lightbulb"
                style={styles.suggestionChip}
              >
                Practice coding challenges
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={onRefresh}
        label="Refresh"
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
  overviewCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.primary,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  matchChip: {
    backgroundColor: colors.success,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
    lineHeight: 20,
  },
  cardTitle2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  currentLevel: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  milestonesCard: {
    margin: 16,
    marginVertical: 8,
  },
  milestoneCard: {
    marginBottom: 12,
    elevation: 2,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: colors.text,
  },
  statusChip: {
    marginLeft: 8,
  },
  milestoneDescription: {
    marginBottom: 12,
    color: colors.textSecondary,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillChip: {
    marginBottom: 4,
  },
  milestoneButton: {
    marginTop: 8,
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
  suggestionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  suggestionText: {
    marginBottom: 16,
    color: colors.textSecondary,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    marginBottom: 8,
    backgroundColor: colors.secondary,
  },
  skillGapsCard: {
    margin: 16,
    marginVertical: 8,
  },
  skillGapItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  skillGapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillGapName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  skillGapPriority: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  skillGapProgress: {
    marginBottom: 8,
  },
  skillGapLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  skillGapProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  resourcesCard: {
    margin: 16,
    marginVertical: 8,
  },
  resourceCard: {
    marginBottom: 12,
    elevation: 2,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  resourceProvider: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resourceInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  resourceRelevance: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  viewAllButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent,
  },
});

export default CareerRoadmap;
