import { JUDGE0_API_KEY } from '../../config/openai.js';

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';

class Judge0Service {
  constructor() {
    this.apiKey = JUDGE0_API_KEY;
    this.headers = {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Submit code for execution
   */
  async submitCode(sourceCode, languageId, stdin = '', expectedOutput = null) {
    try {
      const response = await fetch(`${JUDGE0_API_URL}/submissions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageId,
          stdin: stdin,
          expected_output: expectedOutput,
          cpu_time_limit: 5,
          memory_limit: 128000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Judge0 API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.token; // Token to check submission status
    } catch (error) {
      console.error('Error submitting code to Judge0:', error);
      throw error;
    }
  }

  /**
   * Get submission result
   */
  async getSubmissionResult(token) {
    try {
      const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Judge0 API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting submission result:', error);
      throw error;
    }
  }

  /**
   * Wait for submission to complete (polling)
   */
  async waitForResult(token, maxAttempts = 10, delay = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getSubmissionResult(token);
      
      // Status 1 = In Queue, 2 = Processing
      if (result.status.id === 1 || result.status.id === 2) {
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Status 3 = Accepted, others are various error states
      return result;
    }

    throw new Error('Submission timeout: Code execution took too long');
  }

  /**
   * Execute code with test cases
   */
  async executeCode(sourceCode, languageId, testCases = []) {
    try {
      const results = [];

      for (const testCase of testCases) {
        const token = await this.submitCode(
          sourceCode,
          languageId,
          testCase.stdin || '',
          testCase.expectedOutput || null
        );

        const result = await this.waitForResult(token);
        results.push({
          testCase,
          result: {
            status: this.getStatusDescription(result.status.id),
            passed: result.status.id === 3,
            output: result.stdout || result.stderr || result.compile_output,
            error: result.stderr || result.message,
            time: result.time,
            memory: result.memory,
          },
        });
      }

      return results;
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
      const token = await this.submitCode(sourceCode, languageId);
      const result = await this.waitForResult(token);

      return {
        valid: result.status.id === 3 || (result.status.id === 4 && !result.compile_output),
        error: result.compile_output || result.stderr || null,
        status: this.getStatusDescription(result.status.id),
      };
    } catch (error) {
      console.error('Error validating syntax:', error);
      throw error;
    }
  }

  /**
   * Get status description from status ID
   */
  getStatusDescription(statusId) {
    const statusMap = {
      1: 'In Queue',
      2: 'Processing',
      3: 'Accepted',
      4: 'Wrong Answer',
      5: 'Time Limit Exceeded',
      6: 'Compilation Error',
      7: 'Runtime Error (SIGSEGV)',
      8: 'Runtime Error (SIGXFSZ)',
      9: 'Runtime Error (SIGFPE)',
      10: 'Runtime Error (SIGABRT)',
      11: 'Runtime Error (NZEC)',
      12: 'Runtime Error (Other)',
      13: 'Internal Error',
      14: 'Exec Format Error',
    };

    return statusMap[statusId] || 'Unknown Status';
  }

  /**
   * Get supported languages
   */
  async getLanguages() {
    try {
      // If API supports it, fetch from API
      // For now, return common languages
      return {
        javascript: {
          id: 63,
          name: 'JavaScript (Node.js 12.14.0)',
        },
        python: {
          id: 71,
          name: 'Python (3.8.1)',
        },
        java: {
          id: 62,
          name: 'Java (OpenJDK 13.0.1)',
        },
        cpp: {
          id: 54,
          name: 'C++ (GCC 9.2.0)',
        },
        c: {
          id: 50,
          name: 'C (GCC 9.2.0)',
        },
        csharp: {
          id: 51,
          name: 'C# (Mono 6.6.0.161)',
        },
      };
    } catch (error) {
      console.error('Error getting languages:', error);
      throw error;
    }
  }

  /**
   * Get language ID from language name
   */
  getLanguageId(languageName) {
    const languageMap = {
      javascript: 63,
      js: 63,
      'javascript (node.js)': 63,
      python: 71,
      py: 71,
      'python 3': 71,
      java: 62,
      cpp: 54,
      cplusplus: 54,
      'c++': 54,
      c: 50,
      csharp: 51,
      'c#': 51,
    };

    return languageMap[languageName.toLowerCase()] || 71; // Default to Python
  }
}

export default new Judge0Service();

