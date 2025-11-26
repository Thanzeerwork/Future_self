/**
 * Centralized API Service
 * Combines all API services for easier management
 */

import GeminiService from './geminiService';
import LLMTestService from './llmTestService';
import Judge0Service from './judge0Service';
import AIFeedbackService from './aiFeedbackService';
import LearningResourcesService from './learningResourcesService';

class APIService {
  constructor() {
    this.gemini = GeminiService;
    this.testService = LLMTestService;
    this.judge0 = Judge0Service;
    this.feedback = AIFeedbackService;
    this.learning = LearningResourcesService;
  }

  // ==================== Test Services ====================

  /**
   * Generate test questions
   */
  async generateTest(category, difficulty, count = 10, topic = null) {
    try {
      return await this.gemini.generateTestQuestions(category, difficulty, count, topic);
    } catch (error) {
      console.error('Error generating test:', error);
      // Fallback to LLMTestService
      return await this.testService.generateTestQuestions(category, difficulty, count, topic);
    }
  }

  /**
   * Evaluate test answers
   */
  async evaluateAnswers(questions, userAnswers) {
    try {
      return await this.gemini.evaluateAnswers(questions, userAnswers);
    } catch (error) {
      console.error('Error evaluating answers:', error);
      return await this.testService.evaluateAnswers(questions, userAnswers);
    }
  }

  // ==================== Code Execution Services ====================

  /**
   * Execute code
   */
  async executeCode(sourceCode, languageId, testCases = []) {
    try {
      return await this.judge0.executeCode(sourceCode, languageId, testCases);
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  }

  /**
   * Validate code syntax
   */
  async validateSyntax(sourceCode, languageId) {
    try {
      return await this.judge0.validateSyntax(sourceCode, languageId);
    } catch (error) {
      console.error('Error validating syntax:', error);
      throw error;
    }
  }

  /**
   * Get supported programming languages
   */
  async getLanguages() {
    try {
      return await this.judge0.getLanguages();
    } catch (error) {
      console.error('Error getting languages:', error);
      return {};
    }
  }

  // ==================== AI Feedback Services ====================

  /**
   * Generate career insights
   */
  async getCareerInsights(userProfile, testResults = []) {
    try {
      return await this.feedback.generateCareerInsights(userProfile, testResults);
    } catch (error) {
      console.error('Error getting career insights:', error);
      throw error;
    }
  }

  /**
   * Analyze resume
   */
  async analyzeResume(resumeText, jobDescription = null) {
    try {
      return await this.feedback.analyzeResume(resumeText, jobDescription);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw error;
    }
  }

  /**
   * Get learning recommendations
   */
  async getLearningRecommendations(userProfile, skillGaps, careerGoals) {
    try {
      return await this.feedback.generateLearningRecommendations(userProfile, skillGaps, careerGoals);
    } catch (error) {
      console.error('Error getting learning recommendations:', error);
      throw error;
    }
  }

  /**
   * Match jobs to profile
   */
  async matchJobs(userProfile, jobListings = []) {
    try {
      return await this.feedback.matchJobsToProfile(userProfile, jobListings);
    } catch (error) {
      console.error('Error matching jobs:', error);
      throw error;
    }
  }

  // ==================== Learning Resources Services ====================

  /**
   * Get courses
   */
  async getCourses(category = 'all', difficulty = 'all', limit = 20) {
    try {
      return await this.learning.getCourses(category, difficulty, limit);
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  }

  /**
   * Get personalized course recommendations
   */
  async getPersonalizedCourses(userProfile, limit = 10) {
    try {
      return await this.learning.getPersonalizedRecommendations(userProfile, limit);
    } catch (error) {
      console.error('Error getting personalized courses:', error);
      return [];
    }
  }

  /**
   * Search courses
   */
  async searchCourses(query, filters = {}) {
    try {
      return await this.learning.searchCourses(query, filters);
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  }

  /**
   * Get course categories
   */
  async getCourseCategories() {
    try {
      return await this.learning.getCategories();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  /**
   * Track course progress
   */
  async trackCourseProgress(courseId, userId, progress) {
    try {
      return await this.learning.trackProgress(courseId, userId, progress);
    } catch (error) {
      console.error('Error tracking progress:', error);
      throw error;
    }
  }

  // ==================== Mock Services (for development) ====================

  /**
   * Mock job search (in production, integrate with actual job APIs)
   */
  async searchJobs(query = '', filters = {}) {
    // Mock implementation
    return [
      {
        id: 'job1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Remote',
        type: 'Full-time',
        salary: '$80k - $120k',
        description: 'We are looking for a skilled software engineer...',
        requirements: ['JavaScript', 'React', 'Node.js'],
        matchScore: 85,
      },
      {
        id: 'job2',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$90k - $130k',
        description: 'Join our fast-growing team...',
        requirements: ['Python', 'Django', 'React'],
        matchScore: 75,
      },
    ];
  }

  /**
   * Mock analytics data
   */
  async getAnalytics(userId) {
    // Mock implementation
    return {
      totalTests: 15,
      averageScore: 72,
      improvementRate: 5.2,
      topSkills: ['JavaScript', 'Python', 'React'],
      weakAreas: ['Data Structures', 'System Design'],
      trend: 'up',
    };
  }
}

export default new APIService();

