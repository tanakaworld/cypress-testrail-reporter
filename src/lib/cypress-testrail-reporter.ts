import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status, TestRailResult } from './testrail.interface';
const chalk = require('chalk');

const Mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
} = Mocha.Runner.constants;

/**
 * NOTE: This variable make it able to reuse a test run across test files.
 * Cypress would initialize a reporter instance every test files and a test run would be created.
 */
let cacheTestRunId: Number = null;

export class CypressTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private testRail: TestRail;

  constructor(runner: any, options: any) {
    super(runner);

    let reporterOptions = options.reporterOptions;

    // Overwrite password with token in env.
    // It is required to hard code a password or token in cypress.json by default.
    if (process.env.CYPRESS_TESTRAIL_API_KEY) {
      console.log('  Using token in process.env.CYPRESS_TESTRAIL_API_KEY');
      reporterOptions['password'] = process.env.CYPRESS_TESTRAIL_API_KEY;
    }

    this.testRail = new TestRail(reporterOptions, cacheTestRunId);
    this.validate(reporterOptions, 'domain');
    this.validate(reporterOptions, 'username');
    this.validate(reporterOptions, 'password');
    this.validate(reporterOptions, 'projectId');
    this.validate(reporterOptions, 'suiteId');

    runner.on(EVENT_RUN_BEGIN, async () => {
      const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
      const name = `${reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
      const description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';

      if (this.testRail.hasTestRun()) {
        console.log(`  Using Test Run already exist (runId:${cacheTestRunId})`);
      } else {
        console.log('  Creating a new Test Run ...');
        cacheTestRunId = await this.testRail.createRun(name, description);
      }
    });

    runner.on(EVENT_TEST_PASS, test => {
      const caseIds = titleToCaseIds(test.title);
      if (caseIds.length > 0) {
        const results = caseIds.map(caseId => {
          return {
            case_id: caseId,
            status_id: Status.Passed,
            comment: `Execution time: ${test.duration}ms`,
          };
        });
        this.results.push(...results);
      }
    });

    runner.on(EVENT_TEST_FAIL, test => {
      const caseIds = titleToCaseIds(test.title);
      if (caseIds.length > 0) {
        const results = caseIds.map(caseId => {
          return {
            case_id: caseId,
            status_id: Status.Failed,
            comment: `${test.err.message}`,
          };
        });
        this.results.push(...results);
      }
    });

    runner.on(EVENT_RUN_END, () => {
      if (this.results.length == 0) {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.warn(
          '\n',
          'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx',
          '\n'
        );
        this.testRail.deleteRun();

        return;
      }

      // publish test cases results & close the run
      this.testRail.publishResults(this.results)
        // TODO close a test run in the end if needed
        // .then(() => this.testRail.closeRun());
    });
  }

  private validate(options, name: string) {
    if (options == null) {
      throw new Error('Missing reporterOptions in cypress.json');
    }
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
    }
  }
}
