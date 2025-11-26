import { GEMINI_API_KEY } from '../../config/openai.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

class AIFeedbackService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
  }

  /**
   * Generate comprehensive career insights based on user profile and test results
   */
  async generateCareerInsights(userProfile, testResults = []) {
    try {
      const prompt = `Analyze this student's profile and test results to provide comprehensive career insights:

      Student Profile:
      ${JSON.stringify(userProfile, null, 2)}

      Test Results Summary:
      ${JSON.stringify(testResults, null, 2)}

      Provide a detailed analysis in JSON format:
      {
        "careerPotential": number (0-100),
        "strengths": ["strength1", "strength2", "strength3"],
        "weaknesses": ["weakness1", "weakness2"],
        "recommendedCareerPaths": [
          {
            "title": "Career Path Name",
            "matchScore": number (0-100),
            "description": "Why this path matches",
            "requiredSkills": ["skill1", "skill2"],
            "growthPotential": "High/Medium/Low",
            "salaryRange": "Entry-level salary range",
            "nextSteps": ["step1", "step2"]
          }
        ],
        "skillGaps": [
          {
            "skill": "Skill Name",
            "currentLevel": number (0-100),
            "targetLevel": number (0-100),
            "priority": "High/Medium/Low",
            "resources": ["resource1", "resource2"]
          }
        ],
        "improvementAreas": ["area1", "area2"],
        "recommendations": [
          {
            "category": "Skill Development/Learning/Career",
            "action": "Specific actionable recommendation",
            "priority": "High/Medium/Low",
            "timeline": "Short-term/Long-term"
          }
        ],
        "readinessScore": number (0-100),
        "detailedAnalysis": "Comprehensive text analysis of student's potential"
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
            maxOutputTokens: 3000,
            topP: 0.8,
            topK: 10
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        throw new Error(`Career insights generation failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from markdown code blocks if present
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Error generating career insights:', error);
      throw error;
    }
  }

  /**
   * Analyze resume and provide ATS optimization feedback
   */
  async analyzeResume(resumeText, jobDescription = null) {
    try {
      const prompt = `Analyze this resume for ATS (Applicant Tracking System) optimization:

      Resume Text:
      ${resumeText}

      ${jobDescription ? `Target Job Description:\n${jobDescription}` : ''}

      Provide detailed analysis in JSON format:
      {
        "atsScore": number (0-100),
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "missingKeywords": ["keyword1", "keyword2"],
        "suggestions": [
          {
            "section": "Header/Summary/Experience/Education/Skills",
            "issue": "What's wrong",
            "recommendation": "How to fix it",
            "priority": "High/Medium/Low"
          }
        ],
        "keywordOptimization": {
          "currentKeywords": ["keyword1", "keyword2"],
          "suggestedKeywords": ["keyword3", "keyword4"],
          "keywordDensity": number
        },
        "formatScore": number (0-100),
        "contentScore": number (0-100),
        "overallFeedback": "Comprehensive feedback text",
        "improvedSections": {
          "summary": "Improved summary text",
          "keySkills": ["skill1", "skill2"]
        }
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
            temperature: 0.5,
            maxOutputTokens: 2500,
            topP: 0.8,
            topK: 10
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        throw new Error(`Resume analysis failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from markdown code blocks if present
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw error;
    }
  }

  /**
   * Generate personalized learning recommendations
   */
  async generateLearningRecommendations(userProfile, skillGaps, careerGoals) {
    try {
      const prompt = `Generate personalized learning recommendations:

      User Profile:
      ${JSON.stringify(userProfile, null, 2)}

      Skill Gaps:
      ${JSON.stringify(skillGaps, null, 2)}

      Career Goals:
      ${JSON.stringify(careerGoals, null, 2)}

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
            "rating": number (0-5),
            "relevance": "Why this course is relevant",
            "priority": "High/Medium/Low"
          }
        ],
        "recommendedProjects": [
          {
            "title": "Project Title",
            "description": "Project description",
            "skills": ["skill1", "skill2"],
            "difficulty": "Beginner/Intermediate/Advanced",
            "timeline": "Estimated weeks",
            "resources": ["resource1", "resource2"]
          }
        ],
        "learningPath": [
          {
            "phase": "Phase Name",
            "duration": "Weeks",
            "courses": ["course1", "course2"],
            "projects": ["project1"],
            "milestones": ["milestone1", "milestone2"]
          }
        ],
        "timeline": {
          "shortTerm": ["goal1", "goal2"], // Next 1-3 months
          "mediumTerm": ["goal1", "goal2"], // 3-6 months
          "longTerm": ["goal1", "goal2"] // 6+ months
        }
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
            maxOutputTokens: 3000,
            topP: 0.8,
            topK: 10
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        throw new Error(`Learning recommendations generation failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from markdown code blocks if present
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Error generating learning recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate job matching analysis
   */
  async matchJobsToProfile(userProfile, jobListings = []) {
    try {
      const prompt = `Match job listings to this user profile:

      User Profile:
      ${JSON.stringify(userProfile, null, 2)}

      Job Listings:
      ${JSON.stringify(jobListings, null, 2)}

      Provide matching analysis in JSON format:
      {
        "matchedJobs": [
          {
            "jobId": "job-id",
            "matchScore": number (0-100),
            "matchReasons": ["reason1", "reason2"],
            "missingRequirements": ["req1", "req2"],
            "skillMatch": number (0-100),
            "experienceMatch": number (0-100),
            "recommendation": "Strong Match/Moderate Match/Weak Match",
            "improvementSuggestions": ["suggestion1", "suggestion2"]
          }
        ],
        "overallReadiness": number (0-100),
        "topCareerFields": ["field1", "field2"],
        "skillDevelopmentPriorities": ["skill1", "skill2"]
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
            temperature: 0.6,
            maxOutputTokens: 2000,
            topP: 0.8,
            topK: 10
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        throw new Error(`Job matching failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from markdown code blocks if present
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Error matching jobs:', error);
      throw error;
    }
  }
}

export default new AIFeedbackService();

