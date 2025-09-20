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
import { collection, getDocs } from 'firebase/firestore';

const CareerRoadmap = ({ navigation }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      // For now, we'll create a sample roadmap
      // In a real app, this would be fetched from Firestore
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
    } catch (error) {
      console.error('Error loading roadmap:', error);
    } finally {
      setLoading(false);
    }
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

  if (!roadmap) {
    return (
      <View style={styles.container}>
        <Text>Loading roadmap...</Text>
      </View>
    );
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
                      onPress={() => navigation.navigate('MilestoneDetails', { milestoneId: milestone.id })}
                      style={styles.milestoneButton}
                    >
                      Continue Learning
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
        icon="robot"
        onPress={() => navigation.navigate('AIChat')}
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent,
  },
});

export default CareerRoadmap;
