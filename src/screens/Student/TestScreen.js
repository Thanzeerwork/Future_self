import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  RadioButton,
  Text,
  ProgressBar,
  Chip,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import llmTestService from '../../services/llmTestService';

const TestScreen = ({ route, navigation }) => {
  const { questions, category, difficulty, isGenerated, isPersonalized } = route.params;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userExplanation, setUserExplanation] = useState('');
  const [questionFeedback, setQuestionFeedback] = useState(null);
  
  const timerRef = useRef(null);
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestion) {
      setTimeRemaining(currentQuestion.timeLimit || 60);
      setShowExplanation(false);
      setQuestionFeedback(null);
      setUserExplanation('');
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    Alert.alert(
      'Exit Test',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
    return true;
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Time Up!',
      'Time limit for this question has been reached. Moving to next question.',
      [{ text: 'OK', onPress: nextQuestion }]
    );
  };

  const handleAnswerSelect = (answerIndex) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answerIndex,
    });
  };

  const handleSubmitAnswer = async () => {
    if (answers[currentQuestionIndex] === undefined) {
      Alert.alert('No Answer', 'Please select an answer before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userAnswer = currentQuestion.options[answers[currentQuestionIndex]];
      const evaluation = await llmTestService.evaluateAnswer(
        currentQuestion,
        userAnswer,
        userExplanation
      );
      
      setQuestionFeedback(evaluation);
      setShowExplanation(true);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      Alert.alert('Error', 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleTestComplete();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleTestComplete = () => {
    const testResults = {
      questions,
      answers,
      category,
      difficulty,
      isPersonalized,
      completedAt: new Date().toISOString(),
    };

    navigation.navigate('TestResults', { testResults });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return (currentQuestionIndex + 1) / questions.length;
  };

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.questionNumber}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <Chip
                icon="clock"
                style={styles.timerChip}
                textStyle={{ color: timeRemaining < 10 ? colors.error : colors.white }}
              >
                {formatTime(timeRemaining)}
              </Chip>
            </View>
            <View style={styles.headerRight}>
              <Chip style={styles.categoryChip}>
                {category}
              </Chip>
              <Chip style={styles.difficultyChip}>
                {difficulty}
              </Chip>
            </View>
          </View>
          <ProgressBar
            progress={getProgress()}
            color={colors.primary}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>

      <ScrollView style={styles.scrollView}>
        {/* Question */}
        <Card style={styles.questionCard}>
          <Card.Content>
            <Title style={styles.questionTitle}>Question</Title>
            <Paragraph style={styles.questionText}>
              {currentQuestion.question}
            </Paragraph>
            
            {/* Code Snippet Display */}
            {currentQuestion.codeSnippet && (
              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Code:</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{currentQuestion.codeSnippet}</Text>
                </View>
              </View>
            )}
            
            {currentQuestion.topic && (
              <Chip style={styles.topicChip}>
                Topic: {currentQuestion.topic}
              </Chip>
            )}
          </Card.Content>
        </Card>

        {/* Answer Options */}
        <Card style={styles.optionsCard}>
          <Card.Content>
            <Title style={styles.optionsTitle}>Select Your Answer</Title>
            {currentQuestion.options.map((option, index) => (
              <View key={index} style={styles.optionContainer}>
                <RadioButton
                  value={index}
                  status={answers[currentQuestionIndex] === index ? 'checked' : 'unchecked'}
                  onPress={() => handleAnswerSelect(index)}
                />
                <Text style={styles.optionText}>{option}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* User Explanation (Optional) */}
        <Card style={styles.explanationCard}>
          <Card.Content>
            <Title style={styles.explanationTitle}>Your Explanation (Optional)</Title>
            <TextInput
              placeholder="Explain your reasoning for this answer..."
              value={userExplanation}
              onChangeText={setUserExplanation}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.explanationInput}
            />
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Card style={styles.submitCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleSubmitAnswer}
              disabled={isSubmitting || answers[currentQuestionIndex] === undefined}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
            </Button>
          </Card.Content>
        </Card>

        {/* Feedback and Explanation */}
        {showExplanation && questionFeedback && (
          <Card style={styles.feedbackCard}>
            <Card.Content>
              <Title style={styles.feedbackTitle}>Answer Feedback</Title>
              
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>
                  Score: {questionFeedback.score}/10
                </Text>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: questionFeedback.isCorrect ? colors.success : colors.error }
                  ]}
                  textStyle={{ color: colors.white }}
                >
                  {questionFeedback.isCorrect ? 'Correct' : 'Incorrect'}
                </Chip>
              </View>

              <Paragraph style={styles.feedbackText}>
                {questionFeedback.feedback}
              </Paragraph>

              {questionFeedback.suggestions && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                  <Text style={styles.suggestionsText}>
                    {questionFeedback.suggestions}
                  </Text>
                </View>
              )}

              <View style={styles.conceptContainer}>
                <Text style={styles.conceptTitle}>Concept Explanation:</Text>
                <Text style={styles.conceptText}>
                  {questionFeedback.conceptExplanation}
                </Text>
              </View>

              <View style={styles.navigationButtons}>
                <Button
                  mode="outlined"
                  onPress={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  style={styles.navButton}
                >
                  Previous
                </Button>
                <Button
                  mode="contained"
                  onPress={nextQuestion}
                  style={styles.navButton}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
                </Button>
              </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  timerChip: {
    backgroundColor: colors.primary,
  },
  categoryChip: {
    backgroundColor: colors.secondary,
  },
  difficultyChip: {
    backgroundColor: colors.accent,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  questionCard: {
    margin: 16,
    marginVertical: 8,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 12,
  },
  topicChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
  },
  codeContainer: {
    marginVertical: 12,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  optionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginLeft: 8,
  },
  explanationCard: {
    margin: 16,
    marginVertical: 8,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
  },
  explanationInput: {
    marginBottom: 8,
  },
  submitCard: {
    margin: 16,
    marginVertical: 8,
  },
  submitButton: {
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  feedbackCard: {
    margin: 16,
    marginVertical: 8,
    backgroundColor: colors.surface,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusChip: {
    marginLeft: 8,
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 16,
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  suggestionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  conceptContainer: {
    marginBottom: 16,
  },
  conceptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  conceptText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
});

export default TestScreen;

