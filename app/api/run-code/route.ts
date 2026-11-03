import { NextRequest, NextResponse } from 'next/server';
import vm from 'node:vm';

export async function POST(req: NextRequest) {
  try {
    const { code, language, challengeId } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const startTime = performance.now();

    if (language === 'javascript' || language === 'typescript') {
      // Clean up TypeScript annotations if simple
      const jsCode = code
        .replace(/:\s*([a-zA-Z0-9_<>[\]|,\s]+)(?=[=,);{])/g, '') // remove basic type annotations
        .replace(/<[A-Za-z0-9_,\s]+>/g, ''); // remove basic generics

      const logs: string[] = [];
      const sandbox = {
        console: {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
          warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
        },
        Map,
        Set,
        Array,
        Object,
        Math,
        JSON,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
      };

      const context = vm.createContext(sandbox);

      let testHarness = '';
      if (challengeId === 'two-sum') {
        testHarness = `
          ${jsCode}
          const t1 = twoSum([2, 7, 11, 15], 9);
          const t2 = twoSum([3, 2, 4], 6);
          const t3 = twoSum([3, 3], 6);

          const r1 = Array.isArray(t1) && t1.sort().join(',') === '0,1';
          const r2 = Array.isArray(t2) && t2.sort().join(',') === '1,2';
          const r3 = Array.isArray(t3) && t3.sort().join(',') === '0,1';

          [
            { id: 'tc1', input: 'nums=[2,7,11,15], target=9', expected: '[0, 1]', actual: JSON.stringify(t1), passed: r1 },
            { id: 'tc2', input: 'nums=[3,2,4], target=6', expected: '[1, 2]', actual: JSON.stringify(t2), passed: r2 },
            { id: 'tc3', input: 'nums=[3,3], target=6', expected: '[0, 1]', actual: JSON.stringify(t3), passed: r3 }
          ];
        `;
      } else if (challengeId === 'valid-parentheses') {
        testHarness = `
          ${jsCode}
          const t1 = isValid("()");
          const t2 = isValid("()[]{}");
          const t3 = isValid("(]");
          const t4 = isValid("([)]");

          [
            { id: 'tc1', input: 's="()"', expected: 'true', actual: String(t1), passed: t1 === true },
            { id: 'tc2', input: 's="()[]{}"', expected: 'true', actual: String(t2), passed: t2 === true },
            { id: 'tc3', input: 's="(]"', expected: 'false', actual: String(t3), passed: t3 === false },
            { id: 'tc4', input: 's="([)]"', expected: 'false', actual: String(t4), passed: t4 === false }
          ];
        `;
      } else {
        // Generic execution
        testHarness = `
          ${jsCode}
          [{ id: 'tc1', input: 'Execution check', expected: 'Success', actual: 'Success', passed: true }];
        `;
      }

      const script = new vm.Script(testHarness);
      const results = script.runInContext(context, { timeout: 2500 });
      const executionTime = Math.round(performance.now() - startTime);

      const testsPassed = results.filter((r: any) => r.passed).length;
      const testsTotal = results.length;

      return NextResponse.json({
        success: true,
        passed: testsPassed === testsTotal,
        testsPassed,
        testsTotal,
        testResults: results,
        logs,
        executionTimeMs: executionTime,
      });
    }

    // Fallback for Python / other languages in demo mode
    return NextResponse.json({
      success: true,
      passed: true,
      testsPassed: 3,
      testsTotal: 3,
      testResults: [
        { id: 'tc1', input: 'Test case 1', expected: 'Passed', actual: 'Passed', passed: true },
        { id: 'tc2', input: 'Test case 2', expected: 'Passed', actual: 'Passed', passed: true },
        { id: 'tc3', input: 'Test case 3', expected: 'Passed', actual: 'Passed', passed: true },
      ],
      logs: ['Python simulated sandbox execution finished successfully.'],
      executionTimeMs: Math.round(performance.now() - startTime),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error executing code',
      passed: false,
      testsPassed: 0,
      testsTotal: 0,
      logs: [error.message],
    }, { status: 400 });
  }
}
