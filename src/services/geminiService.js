import { GEMINI_API_KEY } from '../../config/openai.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
  }

  async generateTestQuestions(category, difficulty, count = 10, topic = null) {
    try {
      const prompt = this.buildPrompt(category, difficulty, count, topic);
      
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
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        throw new Error(`Gemini API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from markdown code blocks if present
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      // Parse the JSON response
      const questions = JSON.parse(jsonContent);
      return questions;
    } catch (error) {
      console.error('Error generating test questions with Gemini:', error);
      throw error;
    }
  }

  buildPrompt(category, difficulty, count, topic) {
    const basePrompt = `Generate ${count} ${difficulty} level ${category} test questions`;
    const topicSpecifier = topic ? ` focused on ${topic}` : '';
    
    const categoryPrompts = {
      'Aptitude': `
        Generate aptitude test questions that assess:
        - Logical reasoning
        - Numerical ability
        - Verbal reasoning
        - Spatial reasoning
        - Problem-solving skills
        
        Each question should have:
        - Question text
        - 4 multiple choice options (A, B, C, D)
        - Correct answer
        - Explanation
        - Time limit in seconds
        - Difficulty level
      `,
      
      'Coding': `
        Generate coding test questions that assess:
        - Programming concepts
        - Algorithm design
        - Data structures
        - Code debugging
        - Problem-solving with code
        
        Each question should have:
        - Problem statement
        - Code snippet (if applicable) - include actual code examples for most questions
        - 4 multiple choice options or code completion options
        - Correct answer
        - Explanation
        - Time limit in seconds
        - Difficulty level
        - Programming language (JavaScript, Python, Java, or C++)
        
        IMPORTANT: For coding questions, include a "codeSnippet" field with the actual code when the question involves analyzing or understanding code. The code should be properly formatted and relevant to the question.
      `,
      
      'Technical': `
        Generate technical test questions that assess:
        - System design concepts
        - Database knowledge
        - Network protocols
        - Security principles
        - Software engineering practices
        
        Each question should have:
        - Technical scenario or concept
        - 4 multiple choice options
        - Correct answer
        - Detailed explanation
        - Time limit in seconds
        - Difficulty level
        - Related technology/topic
      `,
      
      'Soft Skills': `
        Generate soft skills test questions that assess:
        - Communication skills
        - Leadership qualities
        - Teamwork abilities
        - Problem-solving approach
        - Emotional intelligence
        
        Each question should have:
        - Scenario-based question
        - 4 behavioral response options
        - Best answer
        - Explanation of why it's the best approach
        - Time limit in seconds
        - Difficulty level
        - Skill category
      `
    };

    return `${basePrompt}${topicSpecifier}. ${categoryPrompts[category]}

    Return the response as a JSON array with this exact structure:
    [
      {
        "id": "unique_id",
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Detailed explanation here",
        "timeLimit": 60,
        "difficulty": "${difficulty}",
        "category": "${category}",
        "topic": "${topic || 'General'}",
        "points": 10
      }
    ]`;
  }

  async generatePersonalizedQuestions(userProfile, category, count = 10) {
    try {
      const prompt = `Based on this user profile, generate ${count} personalized ${category} test questions:

      User Profile:
      - Experience Level: ${userProfile.experienceLevel}
      - Skills: ${userProfile.skills.join(', ')}
      - Weak Areas: ${userProfile.weakAreas.join(', ')}
      - Career Goals: ${userProfile.careerGoals}
      - Previous Test Performance: ${userProfile.previousPerformance}

      Generate questions that:
      1. Match their experience level
      2. Focus on their weak areas for improvement
      3. Align with their career goals
      4. Build on their existing skills

      ${this.buildPrompt(category, userProfile.experienceLevel, count, null)}`;

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
            temperature: 0.8,
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
        throw new Error(`Gemini API request failed: ${response.status}`);
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
      console.error('Error generating personalized questions with Gemini:', error);
      throw error;
    }
  }

  async evaluateAnswer(question, userAnswer, userExplanation = null) {
    try {
      const prompt = `Evaluate this test answer:

      Question: ${question.question}
      Correct Answer: ${question.options[question.correctAnswer]}
      User Answer: ${userAnswer}
      ${userExplanation ? `User Explanation: ${userExplanation}` : ''}

      Provide evaluation in JSON format:
      {
        "isCorrect": boolean,
        "score": number (0-10),
        "feedback": "Detailed feedback on the answer",
        "suggestions": "Suggestions for improvement",
        "conceptExplanation": "Explanation of the underlying concept"
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
            temperature: 0.3,
            maxOutputTokens: 1000,
            topP: 0.8,
            topK: 10
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        throw new Error(`Gemini API request failed: ${response.status}`);
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
      console.error('Error evaluating answer with Gemini:', error);
      throw error;
    }
  }

  async generateTestReport(testResults, userProfile) {
    try {
      const prompt = `Generate a comprehensive test report based on these results:

      Test Results:
      ${JSON.stringify(testResults, null, 2)}

      User Profile:
      ${JSON.stringify(userProfile, null, 2)}

      Provide a detailed report in JSON format:
      {
        "overallScore": number,
        "percentage": number,
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "recommendations": ["recommendation1", "recommendation2"],
        "nextSteps": ["step1", "step2"],
        "detailedAnalysis": "Comprehensive analysis of performance",
        "improvementPlan": "Specific plan for improvement",
        "resources": ["resource1", "resource2"]
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
            maxOutputTokens: 1500,
            topP: 0.8,
            topK: 10
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        throw new Error(`Gemini API request failed: ${response.status}`);
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
      console.error('Error generating test report with Gemini:', error);
      throw error;
    }
  }
}

export default new GeminiService();
