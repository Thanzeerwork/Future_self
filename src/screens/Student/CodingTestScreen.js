import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TextInput as NativeTextInput,
} from 'react-native';
import {
    Card,
    Title,
    Paragraph,
    Button,
    Text,
    ActivityIndicator,
    Chip,
    ProgressBar,
    Divider,
    Portal,
    Modal,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import judge0Service from '../../services/judge0Service';

const CodingTestScreen = ({ route, navigation }) => {
    const { questions, category, difficulty } = route.params;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTestActive, setIsTestActive] = useState(true);

    const currentQuestion = questions && questions.length > 0 ? questions[currentQuestionIndex] : null;
    const timerRef = useRef(null);

    useEffect(() => {
        if (!questions || questions.length === 0) {
            Alert.alert('Error', 'No questions available.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    }, [questions]);

    if (!currentQuestion) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            </View>
        );
    }

    useEffect(() => {
        if (currentQuestion) {
            setCode(currentQuestion.functionSignature || '// Write your code here');
            setTimeRemaining(currentQuestion.timeLimit || 1800); // Default 30 mins
            setOutput(null);
            setTestResults([]);
        }
    }, [currentQuestionIndex]);

    useEffect(() => {
        if (timeRemaining > 0 && isTestActive) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeRemaining, isTestActive]);

    const handleTimeUp = () => {
        setIsTestActive(false);
        Alert.alert('Time Up', 'The time limit for this problem has been reached.');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRunCode = async () => {
        if (!code.trim()) return;

        setIsRunning(true);
        setOutput(null);
        setTestResults([]);

        try {
            // For now, defaulting to JavaScript (Node.js)
            const languageId = 63;

            // Execute against test cases
            const results = await judge0Service.executeCode(
                code,
                languageId,
                currentQuestion.testCases || []
            );

            setTestResults(results);

            // Check if all passed
            const allPassed = results.every(r => r.result.passed);
            if (allPassed) {
                Alert.alert('Success!', 'All test cases passed.');
            }

        } catch (error) {
            console.error('Execution error:', error);
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = () => {
        // Logic to save result and move to next or finish
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            Alert.alert('Test Completed', 'You have finished all problems.', [
                {
                    text: 'OK', onPress: () => navigation.navigate('TestResults', {
                        testResults: {
                            score: 100, // Placeholder
                            totalQuestions: questions.length,
                            questions: questions,
                            category,
                            difficulty
                        }
                    })
                }
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                <ProgressBar progress={(currentQuestionIndex + 1) / questions.length} color={colors.primary} style={styles.progressBar} />
            </View>

            <ScrollView style={styles.content}>
                <Card style={styles.problemCard}>
                    <Card.Content>
                        <Title>{currentQuestion.title}</Title>
                        <Paragraph>{currentQuestion.description}</Paragraph>
                        <View style={styles.constraints}>
                            <Text style={styles.label}>Constraints:</Text>
                            <Text style={styles.value}>{currentQuestion.constraints}</Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.editorCard}>
                    <Card.Content>
                        <Title>Code Editor (JavaScript)</Title>
                        <View style={styles.editorContainer}>
                            <NativeTextInput
                                style={styles.editor}
                                multiline
                                value={code}
                                onChangeText={setCode}
                                autoCapitalize="none"
                                autoCorrect={false}
                                spellCheck={false}
                                textAlignVertical="top"
                            />
                        </View>
                    </Card.Content>
                    <Card.Actions>
                        <Button
                            mode="contained"
                            onPress={handleRunCode}
                            loading={isRunning}
                            disabled={isRunning}
                            icon="play"
                        >
                            Run Code
                        </Button>
                    </Card.Actions>
                </Card>

                {testResults.length > 0 && (
                    <Card style={styles.outputCard}>
                        <Card.Content>
                            <Title>Test Results</Title>
                            {testResults.map((item, index) => (
                                <View key={index} style={styles.testCaseResult}>
                                    <View style={styles.testCaseHeader}>
                                        <Text style={styles.testCaseLabel}>Test Case {index + 1}</Text>
                                        <Chip
                                            icon={item.result.passed ? 'check' : 'close'}
                                            style={{ backgroundColor: item.result.passed ? colors.success : colors.error }}
                                            textStyle={{ color: 'white' }}
                                        >
                                            {item.result.passed ? 'Passed' : 'Failed'}
                                        </Chip>
                                    </View>
                                    {!item.result.passed && (
                                        <View style={styles.errorDetails}>
                                            <Text style={styles.errorText}>Input: {JSON.stringify(item.testCase.input)}</Text>
                                            <Text style={styles.errorText}>Expected: {item.testCase.expectedOutput}</Text>
                                            <Text style={styles.errorText}>Actual: {item.result.output?.trim()}</Text>
                                            {item.result.error && <Text style={styles.errorText}>Error: {item.result.error}</Text>}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </Card.Content>
                    </Card>
                )}

                {output && (
                    <Card style={styles.outputCard}>
                        <Card.Content>
                            <Title>Output</Title>
                            <Text style={styles.consoleOutput}>{output}</Text>
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.footerButton}>
                    Exit
                </Button>
                <Button mode="contained" onPress={handleSubmit} style={styles.footerButton}>
                    {currentQuestionIndex < questions.length - 1 ? 'Next Problem' : 'Finish Test'}
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 16,
        backgroundColor: colors.surface,
        elevation: 2,
    },
    timerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: colors.primary,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    problemCard: {
        marginBottom: 16,
    },
    constraints: {
        marginTop: 12,
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#666',
    },
    value: {
        fontSize: 14,
        color: '#333',
    },
    editorCard: {
        marginBottom: 16,
    },
    editorContainer: {
        height: 300,
        backgroundColor: '#1e1e1e',
        borderRadius: 8,
        marginTop: 8,
        padding: 8,
    },
    editor: {
        flex: 1,
        color: '#d4d4d4',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
    },
    outputCard: {
        marginBottom: 16,
        backgroundColor: '#f8f9fa',
    },
    testCaseResult: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    testCaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    testCaseLabel: {
        fontWeight: 'bold',
    },
    errorDetails: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#fff0f0',
        borderRadius: 4,
    },
    errorText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        color: colors.error,
        marginBottom: 4,
    },
    consoleOutput: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        backgroundColor: '#eee',
        padding: 8,
        borderRadius: 4,
    },
    footer: {
        padding: 16,
        backgroundColor: colors.surface,
        elevation: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerButton: {
        flex: 1,
        marginHorizontal: 8,
    },
});

export default CodingTestScreen;
