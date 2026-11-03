import { Question, CodingChallenge } from '@/lib/types/interview';

export const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'two-sum',
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    timeComplexityOptimal: 'O(n) using a Hash Map',
    spaceComplexityOptimal: 'O(n)',
    hints: [
      'A brute force approach checks every pair using nested loops (O(n²)). Can you do better?',
      'Think about storing numbers you have already visited in a Map or dictionary.',
      'For each number x, you are looking for target - x in your hash map.'
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your solution here
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`
    },
    testCases: [
      { id: 'tc1', input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]' },
      { id: 'tc2', input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]' },
      { id: 'tc3', input: 'nums = [3, 3], target = 6', expectedOutput: '[0, 1]' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
Open brackets must be closed by the same type of brackets in the correct order.`,
    timeComplexityOptimal: 'O(n) using a Stack',
    spaceComplexityOptimal: 'O(n)',
    hints: [
      'Which data structure follows Last-In-First-Out (LIFO)?',
      'When you see an opening bracket, push it to the stack. When you see a closing bracket, check if it matches the top of the stack.'
    ],
    starterCode: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
      typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
      python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return len(stack) == 0`
    },
    testCases: [
      { id: 'tc1', input: 's = "()"', expectedOutput: 'true' },
      { id: 'tc2', input: 's = "()[]{}"', expectedOutput: 'true' },
      { id: 'tc3', input: 's = "(]"', expectedOutput: 'false' },
      { id: 'tc4', input: 's = "([)]"', expectedOutput: 'false' }
    ]
  },
  {
    id: 'custom-debounce',
    title: 'Implement Custom Debounce Function',
    difficulty: 'Medium',
    description: `Create a function \`debounce(fn, delay)\` that returns a debounced version of the passed function. The execution should be delayed until \`delay\` milliseconds have passed since the last time it was called.`,
    timeComplexityOptimal: 'O(1) execution setup',
    spaceComplexityOptimal: 'O(1) closure state',
    hints: [
      'Use setTimeout and clearTimeout stored in a closure.',
      'Remember to pass arguments and context (this) correctly to the target function.'
    ],
    starterCode: {
      javascript: `function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`,
      typescript: `function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`,
      python: `import time
from functools import wraps

def debounce(wait_time):
    def decorator(fn):
        last_call = 0
        @wraps(fn)
        def wrapper(*args, **kwargs):
            nonlocal last_call
            now = time.time()
            if now - last_call >= wait_time:
                last_call = now
                return fn(*args, **kwargs)
        return wrapper
    return decorator`
    },
    testCases: [
      { id: 'tc1', input: 'Immediate calls within 50ms', expectedOutput: 'Executes once at end' }
    ]
  }
];

export const SAMPLE_QUESTIONS: Question[] = [
  // Level 2: Behavioral / HR
  {
    id: 'q-beh-1',
    stage: 'level_2_behavioral',
    targetRole: 'fullstack_developer',
    difficulty: 'beginner',
    category: 'HR',
    title: 'Elevator Pitch & Self Introduction',
    questionText: 'Can you tell me about yourself, your background, and what motivated you to pursue a software development career?',
    expectedKeywords: ['passion for coding', 'projects', 'problem solving', 'continuous learning'],
    evaluationRubric: {
      poor: 'Vague, reads like a raw resume list, lacks structure or enthusiasm.',
      average: 'Mentions college/bootcamp and skills, but lacks a compelling narrative.',
      excellent: 'Concise (under 2 minutes), highlights passion, key projects, and clear value proposition for the role.'
    }
  },
  {
    id: 'q-beh-2',
    stage: 'level_2_behavioral',
    targetRole: 'fullstack_developer',
    difficulty: 'intermediate',
    category: 'Behavioral',
    title: 'Conflict Resolution & Deadlines (STAR Method)',
    questionText: 'Tell me about a time when you had a technical disagreement with a teammate or had to handle a tight project deadline. How did you resolve it?',
    expectedKeywords: ['Situation', 'Task', 'Action', 'Result', 'communication', 'compromise', 'user focus'],
    evaluationRubric: {
      poor: 'Blames colleagues or gives a hypothetical answer without real context.',
      average: 'Describes the situation and outcome, but skips the specific actions taken.',
      excellent: 'Clear STAR format, empathetic approach, data-backed reasoning, and positive collaborative outcome.'
    }
  },

  // Level 3: Tech Screen
  {
    id: 'q-tech-1',
    stage: 'level_3_tech_screen',
    targetRole: 'frontend_developer',
    difficulty: 'beginner',
    category: 'Technical',
    title: 'React Rendering & Virtual DOM',
    questionText: 'How does React determine when to re-render a component, and how does the Virtual DOM help optimize performance?',
    expectedKeywords: ['state changes', 'props changes', 'reconciliation', 'diffing algorithm', 'batching'],
    evaluationRubric: {
      poor: 'Simply says "Virtual DOM is fast" without understanding reconciliation or diffing.',
      average: 'Explains state/props updates and mentions comparing tree representations.',
      excellent: 'Explains state triggers, the diffing algorithm (keys heuristic), batching, and lightweight in-memory tree comparison.'
    }
  },
  {
    id: 'q-tech-2',
    stage: 'level_3_tech_screen',
    targetRole: 'backend_developer',
    difficulty: 'intermediate',
    category: 'Technical',
    title: 'Database Indexing & Query Optimization',
    questionText: 'Explain how B-Tree indexes work in relational databases like PostgreSQL. When would you avoid adding an index on a column?',
    expectedKeywords: ['B-Tree', 'lookup complexity O(log N)', 'write overhead', 'low cardinality', 'table bloat'],
    evaluationRubric: {
      poor: 'Thinks indexes are just search filters, unaware of write performance impact.',
      average: 'Knows indexes speed up SELECTs but slow down INSERTs/UPDATEs.',
      excellent: 'Explains balanced tree traversal, write amplification, low cardinality columns (like booleans), and memory footprint.'
    }
  },

  // Level 4: Live Coding
  {
    id: 'q-code-1',
    stage: 'level_4_coding',
    targetRole: 'fullstack_developer',
    difficulty: 'beginner',
    category: 'Coding',
    title: 'Two Sum Problem',
    questionText: 'Please examine the code editor on your screen. Solve the Two Sum problem efficiently and walk me through your thought process.',
    expectedKeywords: ['hash map', 'time complexity O(n)', 'space complexity O(n)', 'complement check'],
    evaluationRubric: {
      poor: 'Jumps directly to brute force without explaining Big-O notation.',
      average: 'Solves the problem using a map but needs hints for edge cases.',
      excellent: 'Explains trade-off between O(n²) time / O(1) space vs O(n) time / O(n) space before coding.'
    },
    codingChallenge: CODING_CHALLENGES[0]
  },
  {
    id: 'q-code-2',
    stage: 'level_4_coding',
    targetRole: 'fullstack_developer',
    difficulty: 'beginner',
    category: 'Coding',
    title: 'Valid Parentheses Problem',
    questionText: 'Implement a function to check if an expression with parentheses, braces, and brackets is balanced. Explain the data structure you are using.',
    expectedKeywords: ['stack', 'LIFO', 'opening brackets', 'matching pairs', 'O(n)'],
    evaluationRubric: {
      poor: 'Attempts counting without considering nesting order.',
      average: 'Uses a stack, but misses empty string or unmatched closing bracket edge cases.',
      excellent: 'Proper stack implementation with clean early returns and explains why LIFO is required.'
    },
    codingChallenge: CODING_CHALLENGES[1]
  },

  // Level 5: System Design
  {
    id: 'q-sys-1',
    stage: 'level_5_system_design',
    targetRole: 'fullstack_developer',
    difficulty: 'pro',
    category: 'SystemDesign',
    title: 'Design a Scalable URL Shortener (Bitly)',
    questionText: 'Design a distributed URL shortener service that handles 100 million new URLs per month and 10 billion redirects. What are your core considerations?',
    expectedKeywords: ['Base62 encoding', 'hashing vs counter', 'caching (Redis)', 'database choice', 'read-heavy ratio', 'rate limiting'],
    evaluationRubric: {
      poor: 'Designs a simple monolithic server with a single SQL table without capacity estimates.',
      average: 'Mentions hashing and Redis caching, but skips unique ID generation or collision handling.',
      excellent: 'Calculates read/write QPS and storage needs, uses distributed counter/Snowflake or Base62, designs Redis cache with LRU eviction, and discusses CDN.'
    }
  }
];
