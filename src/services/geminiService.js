import { GEMINI_API_KEY } from '../../config/openai.js';

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.modelName = null; // Will be set after listing available models
  }

  async listAvailableModels() {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${this.apiKey}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error listing models:', errorData);
        return [];
      }
      const data = await response.json();
      console.log('Available Gemini models:', data.models?.map(m => m.name) || []);
      return data.models || [];
    } catch (error) {
      console.error('Error fetching available models:', error);
      return [];
    }
  }

  async getAvailableModel() {
    // Priority list of models to use
    const preferredModels = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-1.0-pro',
    ];

    // First, try to list models
    const availableModels = await this.listAvailableModels();

    if (availableModels.length > 0) {
      // Try to find one of the preferred models in order
      for (const preferred of preferredModels) {
        const found = availableModels.find(m =>
          m.name.includes(preferred) &&
          m.supportedGenerationMethods?.includes('generateContent')
        );
        if (found) {
          const modelName = found.name.replace('models/', '');
          console.log(`Using preferred model: ${modelName}`);
          return modelName;
        }
      }

      // Fallback: Find any model that supports generateContent
      const supportedModel = availableModels.find(model =>
        model.supportedGenerationMethods?.includes('generateContent')
      );

      if (supportedModel) {
        const modelName = supportedModel.name.replace('models/', '');
        console.log(`Using fallback available model: ${modelName}`);
        return modelName;
      }
    }

    // Fallback if listing fails: try common models
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
    ];

    for (const model of modelsToTry) {
      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.apiKey}`;
        const testResponse = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] }),
        });

        if (testResponse.status !== 404) {
          console.log(`Found working model: ${model}`);
          return model;
        }
      } catch (e) {
        continue;
      }
    }

    // Default fallback
    return 'gemini-1.5-flash';
  }

  extractContentFromResponse(data) {
    // Check if response has expected structure
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('Invalid API response: missing candidates');
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
      throw new Error('Invalid API response: missing content parts');
    }

    const content = candidate.content.parts[0].text;

    if (!content) {
      throw new Error('Invalid API response: empty content text');
    }

    return content;
  }

  extractAndParseJSON(content) {
    // Extract JSON from markdown code blocks if present
    let jsonContent = content.trim();

    // Try multiple patterns to extract JSON from markdown
    // Pattern 1: ```json\n...\n```
    let jsonMatch = jsonContent.match(/```json\s*\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      // Pattern 2: ```json\n...``` (without closing newline)
      jsonMatch = jsonContent.match(/```json\s*\n([\s\S]*?)```/);
    }
    if (!jsonMatch) {
      // Pattern 3: ```json...``` (all on one line or multiline without proper closing)
      jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)(?:```|$)/);
    }
    if (!jsonMatch) {
      // Pattern 4: Just look for JSON array or object starting after ```json
      jsonMatch = jsonContent.match(/```json\s*([\[{][\s\S]*)/);
    }

    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
      // Remove trailing ``` if present
      jsonContent = jsonContent.replace(/```\s*$/, '').trim();
    }

    // Try to parse the JSON response
    try {
      return JSON.parse(jsonContent);
    } catch (parseError) {
      // If parsing fails, try to fix common issues
      console.error('JSON Parse Error. Attempting to fix...');
      console.error('Parse Error:', parseError.message);
      console.error('Content length:', jsonContent.length);
      console.error('Content preview (first 500 chars):', jsonContent.substring(0, 500));

      // Try to fix incomplete JSON by finding the last complete object/array
      try {
        // Find the last complete JSON object/array
        let fixedJson = jsonContent;

        // If it looks truncated, try to find where valid JSON ends
        if (parseError.message.includes('Unexpected') || parseError.message.includes('end of')) {
          // Try to find the last complete object by counting braces/brackets
          let braceCount = 0;
          let bracketCount = 0;
          let lastValidIndex = -1;
          let inString = false;
          let escapeNext = false;

          for (let i = 0; i < jsonContent.length; i++) {
            const char = jsonContent[i];

            if (escapeNext) {
              escapeNext = false;
              continue;
            }

            if (char === '\\') {
              escapeNext = true;
              continue;
            }

            if (char === '"' && !escapeNext) {
              inString = !inString;
              continue;
            }

            if (!inString) {
              if (char === '{') braceCount++;
              if (char === '}') braceCount--;
              if (char === '[') bracketCount++;
              if (char === ']') bracketCount--;

              if (braceCount === 0 && bracketCount === 0 && i > 0) {
                lastValidIndex = i;
              }
            }
          }

          if (lastValidIndex > 0) {
            fixedJson = jsonContent.substring(0, lastValidIndex + 1);
            console.log('Extracted valid JSON up to index:', lastValidIndex);
          }
        }

        const result = JSON.parse(fixedJson);
        console.log('Successfully parsed after fixing');
        return result;
      } catch (fixError) {
        console.error('Failed to fix JSON. Full content:', jsonContent);
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
    }
  }

  async fetchWithRetry(url, options, retries = 3, backoff = 1000) {
    try {
      const response = await fetch(url, options);

      // Retry on 503 (Service Unavailable) or 500 (Internal Server Error)
      if ((response.status === 503 || response.status === 500) && retries > 0) {
        console.log(`Gemini API ${response.status} error. Retrying in ${backoff}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
      }

      return response;
    } catch (error) {
      if (retries > 0) {
        console.log(`Network error: ${error.message}. Retrying in ${backoff}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Gemini API Error Response:', errorData);
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      // Log the response structure for debugging (only for first call)
      if (!this.modelName) {
        console.log('Gemini API Response:', JSON.stringify(data, null, 2));
      }

      const content = this.extractContentFromResponse(data);
      return this.extractAndParseJSON(content);
    } catch (error) {
      lastError = error;
      // If it's a JSON parse error, retry
      if (error.message.includes('JSON') || error.message.includes('Unexpected end')) {
        console.warn(`Attempt ${attempt + 1} failed with JSON error: ${error.message}. Retrying...`);
        // Clear model name to force re-check if we want to try a different model (optional, but keeping it simple for now)
        continue;
      }
      // For other errors, throw immediately
      console.warn('Error generating test questions with Gemini:', error.message);
      throw error;
    }
  }
    
    throw lastError;
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

    // Get available model name (cache it after first call)
    if (!this.modelName) {
      this.modelName = await this.getAvailableModel();
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${this.modelName}:generateContent`;
    const response = await this.fetchWithRetry(`${apiUrl}?key=${this.apiKey}`, {
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
          maxOutputTokens: 8192,
          topP: 0.8,
          topK: 10
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Gemini API Error Response:', errorData);
      if (response.status === 429) {
        throw new Error('Gemini API quota exceeded. Please try again later.');
      }
      throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = this.extractContentFromResponse(data);
    return this.extractAndParseJSON(content);
  } catch (error) {
    console.warn('Error generating personalized questions with Gemini:', error.message);
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

    // Get available model name (cache it after first call)
    if (!this.modelName) {
      this.modelName = await this.getAvailableModel();
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${this.modelName}:generateContent`;
    const response = await this.fetchWithRetry(`${apiUrl}?key=${this.apiKey}`, {
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
          maxOutputTokens: 4000,
          topP: 0.8,
          topK: 10
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Gemini API Error Response:', errorData);
      if (response.status === 429) {
        throw new Error('Gemini API quota exceeded. Please try again later.');
      }
      throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = this.extractContentFromResponse(data);
    return this.extractAndParseJSON(content);
  } catch (error) {
    console.warn('Error evaluating answer with Gemini:', error.message);
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

    // Get available model name (cache it after first call)
    if (!this.modelName) {
      this.modelName = await this.getAvailableModel();
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${this.modelName}:generateContent`;
    const response = await this.fetchWithRetry(`${apiUrl}?key=${this.apiKey}`, {
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
          maxOutputTokens: 8192,
          topP: 0.8,
          topK: 10
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Gemini API Error Response:', errorData);
      if (response.status === 429) {
        throw new Error('Gemini API quota exceeded. Please try again later.');
      }
      throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = this.extractContentFromResponse(data);
    return this.extractAndParseJSON(content);
  } catch (error) {
    console.warn('Error generating test report with Gemini:', error.message);
    throw error;
  }
}
}

export default new GeminiService();
