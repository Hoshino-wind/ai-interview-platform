"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
const connectionString = process.env.DATABASE_URL || '';
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Start seeding...');
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@smartview.com' },
        update: {},
        create: {
            email: 'admin@smartview.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.ADMIN,
            name: 'System Admin',
            avatar: null,
        },
    });
    console.log('Created admin user:', adminUser.email);
    const questions = [
        {
            type: client_1.QuestionType.ALGORITHM,
            difficulty: client_1.Difficulty.L1,
            title: 'Two Sum',
            description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
            starterCode: {
                javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
};`,
                python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        pass`,
            },
            testCases: [
                { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
                { input: 'nums = [3,2,4], target = 6', expected: '[1,2]' },
                { input: 'nums = [3,3], target = 6', expected: '[0,1]' },
            ],
            hiddenTestCases: [
                { input: 'nums = [1,2,3,4,5], target = 9', expected: '[3,4]' },
                { input: 'nums = [-1,-2,-3,-4], target = -6', expected: '[1,3]' },
            ],
            evaluationRubric: {
                correctness: 60,
                timeComplexity: 20,
                spaceComplexity: 10,
                codeQuality: 10,
            },
            timeLimit: 1800,
            tags: ['array', 'hash-table', 'easy'],
            languageSupport: ['javascript', 'python', 'java', 'cpp'],
            aiScoringConfig: {
                optimalTimeComplexity: 'O(n)',
                optimalSpaceComplexity: 'O(n)',
                hints: ['Consider using a hash map to store visited numbers'],
            },
        },
        {
            type: client_1.QuestionType.ALGORITHM,
            difficulty: client_1.Difficulty.L2,
            title: 'Merge Intervals',
            description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

Example 1:
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].

Example 2:
Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]
Explanation: Intervals [1,4] and [4,5] are considered overlapping.

Constraints:
- 1 <= intervals.length <= 10^4
- intervals[i].length == 2
- 0 <= starti <= endi <= 10^4`,
            starterCode: {
                javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function(intervals) {
    // Write your code here
};`,
                python: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        # Write your code here
        pass`,
            },
            testCases: [
                { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', expected: '[[1,6],[8,10],[15,18]]' },
                { input: 'intervals = [[1,4],[4,5]]', expected: '[[1,5]]' },
            ],
            hiddenTestCases: [
                { input: 'intervals = [[1,4],[0,4]]', expected: '[[0,4]]' },
                { input: 'intervals = [[1,4],[2,3]]', expected: '[[1,4]]' },
            ],
            evaluationRubric: {
                correctness: 50,
                timeComplexity: 25,
                spaceComplexity: 15,
                codeQuality: 10,
            },
            timeLimit: 2400,
            tags: ['array', 'sorting', 'medium'],
            languageSupport: ['javascript', 'python', 'java', 'cpp'],
            aiScoringConfig: {
                optimalTimeComplexity: 'O(n log n)',
                optimalSpaceComplexity: 'O(n)',
                hints: ['Sort the intervals by start time first'],
            },
        },
        {
            type: client_1.QuestionType.SYSTEM_DESIGN,
            difficulty: client_1.Difficulty.L3,
            title: 'Design a URL Shortener',
            description: `Design a URL shortening service like TinyURL. This service will provide short aliases redirecting to long URLs.

Functional Requirements:
1. Given a URL, our service should generate a shorter and unique alias of it.
2. When users access a short link, our service should redirect them to the original link.
3. Links will expire after a standard default timespan. Users should be able to specify expiration time.

Non-Functional Requirements:
1. The system should be highly available.
2. URL redirection should happen with minimal latency.
3. Shortened links should not be guessable.

Extended Requirements:
1. Analytics; e.g., how many times a redirection happened?
2. REST API for third-party integration.

Please provide:
1. API design
2. Database schema
3. Basic system architecture
4. URL shortening algorithm
5. Scaling considerations`,
            starterCode: {
                javascript: `// Design your URL shortener service
// You can write pseudo-code or actual implementation

class URLShortener {
  constructor() {
    // Initialize your data structures
  }

  encode(longUrl) {
    // Implement URL encoding logic
  }

  decode(shortUrl) {
    // Implement URL decoding logic
  }
}`,
                python: `# Design your URL shortener service
# You can write pseudo-code or actual implementation

class URLShortener:
    def __init__(self):
        # Initialize your data structures
        pass

    def encode(self, longUrl: str) -> str:
        # Implement URL encoding logic
        pass

    def decode(self, shortUrl: str) -> str:
        # Implement URL decoding logic
        pass`,
            },
            testCases: [
                { input: 'Design discussion: How to handle 1M URLs per day?', expected: 'Discuss database sharding, caching strategy' },
                { input: 'What is the minimum length of short URL for 1 billion URLs?', expected: 'Base62 encoding needs at least 6 characters' },
            ],
            hiddenTestCases: [
                { input: 'How to prevent collision in distributed system?', expected: 'Discuss distributed ID generation, database unique constraints' },
            ],
            evaluationRubric: {
                systemDesign: 40,
                scalability: 25,
                dataModeling: 20,
                tradeoffs: 15,
            },
            timeLimit: 3600,
            tags: ['system-design', 'distributed-systems', 'database'],
            languageSupport: ['javascript', 'python', 'java'],
            aiScoringConfig: {
                keyComponents: ['API Design', 'Database Schema', 'Hashing/Encoding', 'Caching', 'Scaling'],
                hints: ['Consider using base62 encoding for short URLs'],
            },
        },
        {
            type: client_1.QuestionType.REFACTOR,
            difficulty: client_1.Difficulty.L2,
            title: 'Refactor Callback Hell',
            description: `Refactor the following code that suffers from "callback hell" and improve its error handling:

\`\`\`javascript
getData(function(a) {
    getMoreData(a, function(b) {
        getMoreData(b, function(c) {
            getMoreData(c, function(d) {
                getMoreData(d, function(e) {
                    console.log(e);
                }, errorHandler);
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
}, errorHandler);
\`\`\`

Requirements:
1. Eliminate callback nesting
2. Improve error handling
3. Make the code more readable and maintainable
4. Handle edge cases appropriately

Bonus: Show multiple approaches (Promises, async/await, etc.)`,
            starterCode: {
                javascript: `// Original callback hell code to refactor:
function getData(callback, errorHandler) {
  // Simulated async operation
}

function getMoreData(data, callback, errorHandler) {
  // Simulated async operation
}

// Refactor the following:
getData(function(a) {
    getMoreData(a, function(b) {
        getMoreData(b, function(c) {
            getMoreData(c, function(d) {
                getMoreData(d, function(e) {
                    console.log(e);
                }, errorHandler);
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
}, errorHandler);

// Your refactored code here:`,
                python: `# Similar refactoring exercise in Python
import asyncio

async def get_data():
    # Simulated async operation
    pass

async def get_more_data(data):
    # Simulated async operation
    pass

# Refactor nested callbacks to use async/await
# Your refactored code here:`,
            },
            testCases: [
                { input: 'Code should use async/await or Promises', expected: 'No nested callbacks' },
                { input: 'Error handling should be centralized', expected: 'Single try-catch or .catch()' },
            ],
            hiddenTestCases: [
                { input: 'Edge case: What if getData returns null?', expected: 'Proper null/undefined handling' },
            ],
            evaluationRubric: {
                codeQuality: 40,
                errorHandling: 30,
                readability: 20,
                bestPractices: 10,
            },
            timeLimit: 1800,
            tags: ['refactoring', 'async', 'javascript', 'promises'],
            languageSupport: ['javascript', 'python'],
            aiScoringConfig: {
                expectedPatterns: ['async/await', 'Promise chaining', 'try-catch'],
                antiPatterns: ['callback nesting', 'pyramid of doom'],
            },
        },
        {
            type: client_1.QuestionType.DEBUG,
            difficulty: client_1.Difficulty.L3,
            title: 'Fix Memory Leak in Event Handler',
            description: `The following React component has a memory leak. Identify and fix the issue:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function DataFetcher({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(userId);
  }, [userId]);

  const fetchData = async (id) => {
    setLoading(true);
    const response = await fetch(\`/api/users/\${id}\`);
    const result = await response.json();
    setData(result);
    setLoading(false);
  };

  return (
    <div>
      {loading ? <p>Loading...</p> : <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
\`\`\`

Issues to address:
1. Memory leak when component unmounts during fetch
2. Race condition when userId changes quickly
3. Missing error handling
4. State update on unmounted component

Provide the corrected code with explanations.`,
            starterCode: {
                javascript: `import React, { useState, useEffect } from 'react';

function DataFetcher({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(userId);
  }, [userId]);

  const fetchData = async (id) => {
    setLoading(true);
    const response = await fetch(\`/api/users/\${id}\`);
    const result = await response.json();
    setData(result);
    setLoading(false);
  };

  return (
    <div>
      {loading ? <p>Loading...</p> : <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

// Fix the memory leak and race conditions in the code above`,
            },
            testCases: [
                { input: 'Component unmounts during fetch', expected: 'No memory leak, no state update on unmounted component' },
                { input: 'userId changes rapidly', expected: 'Only latest request result is displayed' },
            ],
            hiddenTestCases: [
                { input: 'API returns error', expected: 'Error is handled gracefully' },
            ],
            evaluationRubric: {
                bugFix: 50,
                raceCondition: 25,
                errorHandling: 15,
                codeQuality: 10,
            },
            timeLimit: 2400,
            tags: ['react', 'debugging', 'memory-leak', 'useEffect'],
            languageSupport: ['javascript'],
            aiScoringConfig: {
                keyFixes: ['Cleanup function', 'AbortController', 'isMounted flag or useRef'],
                commonMistakes: ['Forgetting cleanup', 'Not handling race conditions'],
            },
        },
    ];
    for (const questionData of questions) {
        const question = await prisma.question.upsert({
            where: {
                id: '',
            },
            update: {},
            create: questionData,
        });
        console.log(`Created question: ${question.title} (${question.type}, ${question.difficulty})`);
    }
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map