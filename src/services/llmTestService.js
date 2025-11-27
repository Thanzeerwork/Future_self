import { GEMINI_API_KEY } from '../../config/openai.js';
import geminiService from './geminiService.js';

class LLMTestService {
  constructor() {
    this.geminiKey = GEMINI_API_KEY;
  }

  async generateTestQuestions(category, difficulty, count = 10, topic = null) {
    // Use Gemini Pro (free for students)
    if (this.geminiKey && this.geminiKey !== 'your-gemini-api-key-here') {
      try {
        console.log('Using Gemini Pro for test generation...');
        const result = await geminiService.generateTestQuestions(category, difficulty, count, topic);
        // Ensure we return an array
        return result.questions || result;
      } catch (error) {
        console.log('Gemini failed, using fallback questions...', error.message);
        return this.generateFallbackQuestions(category, difficulty, count);
      }
    }

    // No API key, use fallback
    console.log('No Gemini API key, using fallback questions');
    return this.generateFallbackQuestions(category, difficulty, count);
  }


  async generatePersonalizedQuestions(userProfile, category, count = 10) {
    // Use Gemini Pro (free for students)
    if (this.geminiKey && this.geminiKey !== 'your-gemini-api-key-here') {
      try {
        console.log('Using Gemini Pro for personalized test generation...');
        const result = await geminiService.generatePersonalizedQuestions(userProfile, category, count);
        // Ensure we return an array
        return result.questions || result;
      } catch (error) {
        console.log('Gemini failed, using fallback questions...', error.message);
        return this.generateFallbackQuestions(category, userProfile.experienceLevel, count);
      }
    }

    // No API key, use fallback
    console.log('No Gemini API key, using fallback questions');
    return this.generateFallbackQuestions(category, userProfile.experienceLevel, count);
  }

  async evaluateAnswer(question, userAnswer, userExplanation = null) {
    // Use Gemini Pro (free for students)
    if (this.geminiKey && this.geminiKey !== 'your-gemini-api-key-here') {
      try {
        console.log('Using Gemini Pro for answer evaluation...');
        return await geminiService.evaluateAnswer(question, userAnswer, userExplanation);
      } catch (error) {
        console.log('Gemini failed, using basic evaluation...', error.message);
        return this.basicAnswerEvaluation(question, userAnswer, userExplanation);
      }
    }

    // No API key, use basic evaluation
    console.log('No Gemini API key, using basic evaluation');
    return this.basicAnswerEvaluation(question, userAnswer, userExplanation);
  }

  async generateTestReport(testResults, userProfile) {
    // Use Gemini Pro (free for students)
    if (this.geminiKey && this.geminiKey !== 'your-gemini-api-key-here') {
      try {
        console.log('Using Gemini Pro for test report generation...');
        return await geminiService.generateTestReport(testResults, userProfile);
      } catch (error) {
        console.log('Gemini failed, using basic report...', error.message);
        return this.basicTestReport(testResults, userProfile);
      }
    }

    // No API key, use basic report
    console.log('No Gemini API key, using basic report');
    return this.basicTestReport(testResults, userProfile);
  }

  // Fallback method for when API is not available
  generateFallbackQuestions(category, difficulty, count = 10) {
    const fallbackQuestions = {
      'Aptitude': [
        {
          id: 'apt_1',
          question: 'What is the next number in the sequence: 2, 4, 8, 16, ?',
          options: ['24', '32', '28', '20'],
          correctAnswer: 1,
          explanation: 'Each number is multiplied by 2 to get the next number.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'Number Sequences',
          points: 10
        },
        {
          id: 'apt_2',
          question: 'If all roses are flowers and some flowers are red, which statement is true?',
          options: ['All roses are red', 'Some roses are red', 'No roses are red', 'Cannot be determined'],
          correctAnswer: 3,
          explanation: 'We cannot determine the color of roses from the given information.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'Logical Reasoning',
          points: 10
        }
      ],
      'Coding': [
        {
          id: 'code_1',
          question: 'What is the time complexity of binary search?',
          options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
          correctAnswer: 1,
          explanation: 'Binary search eliminates half of the search space in each iteration.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'Algorithms',
          points: 10
        },
        {
          id: 'code_2',
          question: 'Which data structure uses LIFO principle?',
          options: ['Queue', 'Stack', 'Array', 'Linked List'],
          correctAnswer: 1,
          explanation: 'Stack follows Last In First Out (LIFO) principle.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'Data Structures',
          points: 10
        },
        {
          id: 'code_3',
          question: 'What is the value of "result" after executing the following code?',
          codeSnippet: `let x = 5;
let y = 3;
let result = x > y ? x + y : x - y;`,
          options: ['8', '2', '15', 'undefined'],
          correctAnswer: 0,
          explanation: 'Since x (5) > y (3), the ternary operator returns x + y = 5 + 3 = 8.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'JavaScript',
          points: 10
        },
        {
          id: 'code_4',
          question: 'What will be the output of this JavaScript code?',
          codeSnippet: `function test() {
  console.log(a);
  var a = 10;
}
test();`,
          options: ['10', 'undefined', 'ReferenceError', 'null'],
          correctAnswer: 1,
          explanation: 'Due to hoisting, var declarations are moved to the top, but assignments stay in place. So "a" is undefined when logged.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'JavaScript',
          points: 10
        }
      ],
      'Realtime Coding': [
        {
          id: 'rt_code_1',
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          functionSignature: 'function twoSum(nums, target) {\n  // Your code here\n}',
          testCases: [
            { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
            { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
            { input: '[3,3], 6', expectedOutput: '[0,1]' }
          ],
          constraints: 'Time: 1s, Memory: 256MB',
          difficulty: difficulty,
          topic: 'Algorithms',
          timeLimit: 1800
        },
        {
          id: 'rt_code_2',
          title: 'Reverse String',
          description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
          functionSignature: 'function reverseString(s) {\n  // Your code here\n}',
          testCases: [
            { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
            { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' }
          ],
          constraints: 'Time: 1s, Memory: 256MB',
          difficulty: difficulty,
          topic: 'Strings',
          timeLimit: 1800
        }
      ],
      'Technical': [
        {
          id: 'tech_1',
          question: 'What does HTTP stand for?',
          options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Home Tool Transfer Protocol', 'Hyperlink Transfer Protocol'],
          correctAnswer: 0,
          explanation: 'HTTP stands for HyperText Transfer Protocol.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'Web Technologies',
          points: 10
        },
        {
          id: 'tech_2',
          question: 'Which database is known for being NoSQL?',
          options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
          correctAnswer: 2,
          explanation: 'MongoDB is a popular NoSQL document database.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'Databases',
          points: 10
        }
      ],
      'Soft Skills': [
        {
          id: 'soft_1',
          question: 'How would you handle a team member who is consistently late to meetings?',
          options: ['Publicly call them out', 'Ignore the issue', 'Have a private conversation', 'Report to management immediately'],
          correctAnswer: 2,
          explanation: 'Private conversation shows respect and allows for understanding the root cause.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'Team Management',
          points: 10
        },
        {
          id: 'soft_2',
          question: 'What is the most important aspect of effective communication?',
          options: ['Speaking clearly', 'Active listening', 'Using technical jargon', 'Being brief'],
          correctAnswer: 1,
          explanation: 'Active listening ensures understanding and builds better relationships.',
          timeLimit: 60,
          difficulty: difficulty,
          category: category,
          topic: 'Communication',
          points: 10
        }
      ]
    };

    const questions = fallbackQuestions[category] || fallbackQuestions['Aptitude'];
    return questions.slice(0, count);
  }

  // Basic answer evaluation when AI is not available
  basicAnswerEvaluation(question, userAnswer, userExplanation = null) {
    const isCorrect = question.correctAnswer === userAnswer;
    const score = isCorrect ? 10 : 0;

    return {
      isCorrect,
      score,
      feedback: isCorrect
        ? "Correct! Well done."
        : `Incorrect. The correct answer is: ${question.options[question.correctAnswer]}`,
      suggestions: isCorrect
        ? "Keep up the great work!"
        : "Review the concept and try similar questions.",
      conceptExplanation: question.explanation || "Please review the topic for better understanding."
    };
  }

  // Basic test report when AI is not available
  basicTestReport(testResults, userProfile) {
    const percentage = Math.round((testResults.correctAnswers / testResults.totalQuestions) * 100);

    return {
      overallScore: testResults.correctAnswers,
      percentage,
      strengths: percentage >= 70 ? ["Good understanding of concepts"] : [],
      weaknesses: percentage < 70 ? ["Need more practice"] : [],
      recommendations: percentage >= 80
        ? ["Continue practicing to maintain skills"]
        : ["Focus on weak areas and practice more"],
      nextSteps: percentage >= 70
        ? ["Take more advanced tests"]
        : ["Review basic concepts and retake test"],
      detailedAnalysis: `You scored ${percentage}% (${testResults.correctAnswers}/${testResults.totalQuestions} correct). ${percentage >= 70 ? 'Good job!' : 'Keep practicing!'}`,
      improvementPlan: percentage >= 70
        ? "Continue with advanced topics"
        : "Focus on fundamental concepts",
      resources: ["Practice tests", "Study materials", "Online tutorials"]
    };
  }
}

export default new LLMTestService();
