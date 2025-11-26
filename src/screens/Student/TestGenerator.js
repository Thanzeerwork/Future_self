import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  RadioButton,
  Text,
  ActivityIndicator,
  Chip,
  Divider,
  ProgressBar,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import llmTestService from '../../services/llmTestService';

const TestGenerator = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  const progressInterval = useRef(null);

  const categories = [
    { id: 'Aptitude', name: 'Aptitude', icon: 'calculator', color: colors.primary },
    { id: 'Coding', name: 'Coding', icon: 'code-tags', color: colors.secondary },
    { id: 'Technical', name: 'Technical', icon: 'cog', color: colors.accent },
    { id: 'Soft Skills', name: 'Soft Skills', icon: 'account-group', color: colors.success },
  ];

  const difficulties = [
    { id: 'Beginner', name: 'Beginner', description: 'Basic concepts and fundamentals' },
    { id: 'Intermediate', name: 'Intermediate', description: 'Moderate complexity and application' },
    { id: 'Advanced', name: 'Advanced', description: 'Complex scenarios and expert-level knowledge' },
  ];

  const questionCounts = ['5', '10', '15', '20', '25'];

  const loadingMessages = [
    "Connecting to AI services...",
    "Analyzing requirements...",
    "Drafting questions...",
    "Reviewing difficulty levels...",
    "Formatting content...",
    "Finalizing your test..."
  ];

  const startProgressSimulation = () => {
    setProgress(0);
    setLoadingMessage(loadingMessages[0]);
    let currentProgress = 0;
    let messageIndex = 0;

    progressInterval.current = setInterval(() => {
      currentProgress += 0.05;

      // Update message periodically
      if (Math.floor(currentProgress * 10) % 2 === 0) {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }

      // Cap at 90% until actual completion
      if (currentProgress >= 0.9) {
        currentProgress = 0.9;
      }

      setProgress(currentProgress);
    }, 500);
  };

  const stopProgressSimulation = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setProgress(1);
    setLoadingMessage("Complete!");
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleGenerateTest = async () => {
    if (!selectedCategory || !selectedDifficulty) {
      Alert.alert('Error', 'Please select both category and difficulty level');
      return;
    }

    setIsGenerating(true);
    startProgressSimulation();

    try {
      const questions = await llmTestService.generateTestQuestions(
        selectedCategory,
        selectedDifficulty,
        parseInt(questionCount),
        customTopic || null
      );

      stopProgressSimulation();
      // Small delay to show completion
      setTimeout(() => {
        navigation.navigate('TestScreen', {
          questions,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          isGenerated: true,
        });
      }, 500);
    } catch (error) {
      console.error('Error generating test:', error);
      stopProgressSimulation();
      Alert.alert('Error', 'Failed to generate test. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePersonalizedTest = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setIsGenerating(true);
    startProgressSimulation();

    try {
      // Get user profile from context or storage
      const userProfile = {
        experienceLevel: 'Intermediate', // This should come from user context
        skills: ['JavaScript', 'React', 'Node.js'],
        weakAreas: ['Algorithms', 'System Design'],
        careerGoals: 'Full Stack Developer',
        previousPerformance: 'Good',
      };

      const questions = await llmTestService.generatePersonalizedQuestions(
        userProfile,
        selectedCategory,
        parseInt(questionCount)
      );

      stopProgressSimulation();
      // Small delay to show completion
      setTimeout(() => {
        navigation.navigate('TestScreen', {
          questions,
          category: selectedCategory,
          difficulty: 'Personalized',
          isGenerated: true,
          isPersonalized: true,
        });
      }, 500);
    } catch (error) {
      console.error('Error generating personalized test:', error);
      stopProgressSimulation();
      Alert.alert('Error', 'Failed to generate personalized test. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>AI Test Generator</Title>
            <Paragraph style={styles.headerSubtitle}>
              Generate personalized tests using advanced AI technology
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Category Selection */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Select Test Category</Title>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  icon={category.icon}
                  selected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && { backgroundColor: category.color }
                  ]}
                  textStyle={selectedCategory === category.id ? { color: colors.white } : {}}
                >
                  {category.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Difficulty Selection */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Select Difficulty Level</Title>
            {difficulties.map((difficulty) => (
              <View key={difficulty.id} style={styles.radioContainer}>
                <RadioButton
                  value={difficulty.id}
                  status={selectedDifficulty === difficulty.id ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedDifficulty(difficulty.id)}
                />
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{difficulty.name}</Text>
                  <Text style={styles.radioDescription}>{difficulty.description}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Question Count */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Number of Questions</Title>
            <View style={styles.questionCountContainer}>
              {questionCounts.map((count) => (
                <Chip
                  key={count}
                  selected={questionCount === count}
                  onPress={() => setQuestionCount(count)}
                  style={styles.countChip}
                >
                  {count}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Custom Topic */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Custom Topic (Optional)</Title>
            <TextInput
              label="Enter specific topic or skill to focus on"
              value={customTopic}
              onChangeText={setCustomTopic}
              mode="outlined"
              style={styles.textInput}
            />
            <Paragraph style={styles.helpText}>
              Leave empty for general questions in the selected category
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Generate Buttons */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleGenerateTest}
              disabled={isGenerating || !selectedCategory || !selectedDifficulty}
              style={styles.generateButton}
              contentStyle={styles.buttonContent}
            >
              {isGenerating ? 'Generating...' : 'Generate Test'}
            </Button>

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleGeneratePersonalizedTest}
              disabled={isGenerating || !selectedCategory}
              style={styles.personalizedButton}
              contentStyle={styles.buttonContent}
            >
              {isGenerating ? 'Generating...' : 'Generate Personalized Test'}
            </Button>

            <Paragraph style={styles.personalizedDescription}>
              Personalized tests are tailored to your skill level and learning goals
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Loading Indicator */}
        {isGenerating && (
          <Card style={styles.loadingCard}>
            <Card.Content style={styles.loadingContent}>
              <ProgressBar progress={progress} color={colors.primary} style={styles.progressBar} />
              <Text style={styles.loadingText}>{loadingMessage}</Text>
              <Text style={styles.loadingSubtext}>{(progress * 100).toFixed(0)}% Complete</Text>
            </Card.Content>
          </Card>
        )}
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
  sectionCard: {
    margin: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioContent: {
    flex: 1,
    marginLeft: 8,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  radioDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  questionCountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countChip: {
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionCard: {
    margin: 16,
    marginVertical: 8,
  },
  generateButton: {
    marginBottom: 16,
  },
  personalizedButton: {
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  personalizedDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingCard: {
    margin: 16,
    marginVertical: 8,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default TestGenerator;

