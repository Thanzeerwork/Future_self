import { GEMINI_API_KEY } from '../../config/openai.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

class LearningResourcesService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    // Mock course catalog - in production, integrate with actual APIs
    this.courseCatalog = this.initializeCourseCatalog();
  }

  /**
   * Initialize course catalog with curated resources
   */
  initializeCourseCatalog() {
    return {
      programming: [
        {
          id: 'coursera-python',
          title: 'Python for Everybody',
          provider: 'Coursera',
          providerName: 'University of Michigan',
          url: 'https://www.coursera.org/specializations/python',
          difficulty: 'Beginner',
          duration: '40 hours',
          rating: 4.8,
          skills: ['Python', 'Programming', 'Data Structures'],
          category: 'programming',
          free: true,
          certificate: true,
        },
        {
          id: 'udemy-web-dev',
          title: 'The Complete Web Developer Bootcamp',
          provider: 'Udemy',
          providerName: 'Colt Steele',
          url: 'https://www.udemy.com/the-web-developer-bootcamp',
          difficulty: 'Beginner',
          duration: '60 hours',
          rating: 4.7,
          skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
          category: 'web-development',
          free: false,
          certificate: true,
        },
      ],
      dataScience: [
        {
          id: 'coursera-data-science',
          title: 'Data Science Specialization',
          provider: 'Coursera',
          providerName: 'Johns Hopkins University',
          url: 'https://www.coursera.org/specializations/jhu-data-science',
          difficulty: 'Intermediate',
          duration: '80 hours',
          rating: 4.6,
          skills: ['R', 'Data Analysis', 'Machine Learning'],
          category: 'data-science',
          free: false,
          certificate: true,
        },
      ],
      cloud: [
        {
          id: 'google-cloud',
          title: 'Google Cloud Professional Certificates',
          provider: 'Google',
          url: 'https://www.coursera.org/googlecloud',
          difficulty: 'Advanced',
          duration: '120 hours',
          rating: 4.9,
          skills: ['Cloud Computing', 'GCP', 'DevOps'],
          category: 'cloud',
          free: false,
          certificate: true,
        },
      ],
    };
  }

  /**
   * Get courses by category
   */
  async getCourses(category = 'all', difficulty = 'all', limit = 20) {
    try {
      // In production, this would fetch from actual APIs
      // For now, return curated courses
      let courses = [];

      if (category === 'all') {
        Object.values(this.courseCatalog).forEach(categoryCourses => {
          courses = courses.concat(categoryCourses);
        });
      } else {
        courses = this.courseCatalog[category] || [];
      }

      // Filter by difficulty
      if (difficulty !== 'all') {
        courses = courses.filter(course => course.difficulty.toLowerCase() === difficulty.toLowerCase());
      }

      // Limit results
      return courses.slice(0, limit);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Get personalized course recommendations using AI
   */
  async getPersonalizedRecommendations(userProfile, limit = 10) {
    try {
      if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
        // Fallback to curated recommendations
        return this.getFallbackRecommendations(userProfile, limit);
      }

      const prompt = `Based on this student profile, recommend the best online courses:

      Student Profile:
      - Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
      - Career Goals: ${userProfile.careerGoals || 'Not specified'}
      - Experience Level: ${userProfile.experienceLevel || 'Beginner'}
      - Test Scores: ${JSON.stringify(userProfile.testScores || {})}

      Provide recommendations in JSON format:
      {
        "recommendedCourses": [
          {
            "title": "Course Title",
            "provider": "Coursera/Udemy/LinkedIn Learning/Google/Meta",
            "url": "Course URL",
            "difficulty": "Beginner/Intermediate/Advanced",
            "duration": "Estimated hours",
            "skills": ["skill1", "skill2"],
            "whyRecommended": "Why this course is relevant",
            "priority": "High/Medium/Low"
          }
        ],
        "learningPath": "Suggested learning sequence",
        "timeline": "Estimated completion time"
      }`;

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            topP: 0.8,
            topK: 10
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`AI recommendation failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from markdown code blocks if present
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      const recommendations = JSON.parse(jsonContent);
      
      // Merge with actual course catalog data
      return this.enhanceWithCatalogData(recommendations.recommendedCourses, limit);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return this.getFallbackRecommendations(userProfile, limit);
    }
  }

  /**
   * Get fallback recommendations when AI is unavailable
   */
  getFallbackRecommendations(userProfile, limit) {
    const skills = userProfile.skills || [];
    const recommendations = [];

    // Recommend based on skills
    if (skills.some(s => s.toLowerCase().includes('python'))) {
      recommendations.push({
        title: 'Python for Data Science',
        provider: 'Coursera',
        difficulty: 'Beginner',
        priority: 'High',
      });
    }

    if (skills.some(s => s.toLowerCase().includes('web') || s.toLowerCase().includes('javascript'))) {
      recommendations.push({
        title: 'Full Stack Web Development',
        provider: 'Udemy',
        difficulty: 'Intermediate',
        priority: 'High',
      });
    }

    return recommendations.slice(0, limit);
  }

  /**
   * Enhance AI recommendations with catalog data
   */
  enhanceWithCatalogData(aiRecommendations, limit) {
    // In production, match AI recommendations with actual course catalog
    // For now, return AI recommendations as-is
    return aiRecommendations.slice(0, limit);
  }

  /**
   * Get course details
   */
  async getCourseDetails(courseId) {
    try {
      // In production, fetch from actual API
      // For now, search in catalog
      for (const category of Object.values(this.courseCatalog)) {
        const course = category.find(c => c.id === courseId);
        if (course) {
          return course;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  }

  /**
   * Search courses
   */
  async searchCourses(query, filters = {}) {
    try {
      let courses = [];
      
      // Get all courses
      Object.values(this.courseCatalog).forEach(categoryCourses => {
        courses = courses.concat(categoryCourses);
      });

      // Filter by query
      if (query) {
        const lowerQuery = query.toLowerCase();
        courses = courses.filter(course =>
          course.title.toLowerCase().includes(lowerQuery) ||
          course.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
        );
      }

      // Apply filters
      if (filters.difficulty && filters.difficulty !== 'all') {
        courses = courses.filter(c => c.difficulty.toLowerCase() === filters.difficulty.toLowerCase());
      }

      if (filters.provider && filters.provider !== 'all') {
        courses = courses.filter(c => c.provider.toLowerCase() === filters.provider.toLowerCase());
      }

      if (filters.free !== undefined) {
        courses = courses.filter(c => c.free === filters.free);
      }

      return courses;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  /**
   * Get course categories
   */
  async getCategories() {
    return [
      { id: 'programming', name: 'Programming', icon: 'code' },
      { id: 'web-development', name: 'Web Development', icon: 'web' },
      { id: 'data-science', name: 'Data Science', icon: 'chart-line' },
      { id: 'cloud', name: 'Cloud Computing', icon: 'cloud' },
      { id: 'mobile', name: 'Mobile Development', icon: 'cellphone' },
      { id: 'ai-ml', name: 'AI & Machine Learning', icon: 'robot' },
    ];
  }

  /**
   * Get course providers
   */
  async getProviders() {
    return [
      { id: 'coursera', name: 'Coursera', icon: 'school' },
      { id: 'udemy', name: 'Udemy', icon: 'video' },
      { id: 'linkedin', name: 'LinkedIn Learning', icon: 'linkedin' },
      { id: 'google', name: 'Google', icon: 'google' },
      { id: 'meta', name: 'Meta', icon: 'facebook' },
    ];
  }

  /**
   * Track course progress
   */
  async trackProgress(courseId, userId, progress) {
    try {
      // In production, save to Firestore
      // For now, just return success
      return { success: true, progress };
    } catch (error) {
      console.error('Error tracking progress:', error);
      throw error;
    }
  }

  /**
   * Get user's course progress
   */
  async getUserProgress(userId) {
    try {
      // In production, fetch from Firestore
      // For now, return empty progress
      return [];
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }
}

export default new LearningResourcesService();

