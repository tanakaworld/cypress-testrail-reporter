const axios = require('axios');
const chalk = require('chalk');
import { TestRailOptions, TestRailResult } from './testrail.interface';

export class TestRail {
  private base: String;
  private runId: Number;
  private includeAll: Boolean = true;
  private caseIds: Number[] = [];

  constructor(private options: TestRailOptions, runId: Number = null) {
    this.base = `https://${options.domain}/index.php?/api/v2`;
    this.runId = runId;
  }

  public getCases () {
    return axios({
      method:'get',
      url: `${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}&section_id=${this.options.groupId}&filter=${this.options.filter}`,
      headers: { 'Content-Type': 'application/json' }, 
      auth: {
          username: this.options.username,
          password: this.options.password
      } 
    })
      .then(response => response.data.map(item =>item.id))
      .catch(error => console.error(error));
  }

  public async createRun (name: string, description: string) {
    if (this.options.includeAllInTestRun === false){
      this.includeAll = false;
      this.caseIds =  await this.getCases();
    }

    return new Promise<Number>((resolve ,reject) => {
      axios({
        method: 'post',
        url: `${this.base}/add_run/${this.options.projectId}`,
        headers: { 'Content-Type': 'application/json' },
        auth: {
          username: this.options.username,
          password: this.options.password,
        },
        data: JSON.stringify({
          suite_id: this.options.suiteId,
          name,
          description,
          include_all: this.includeAll,
          case_ids: this.caseIds
        }),
      })
          .then(response => {
            this.runId = response.data.id;
            resolve(this.runId);
          })
          .catch(error => {
            console.error(error)
            reject(error);
          });
    });
  }

  public deleteRun() {
    axios({
      method: 'post',
      url: `${this.base}/delete_run/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    }).catch(error => console.error(error));
  }

  public publishResults(results: TestRailResult[]) {
    return axios({
      method: 'post',
      url: `${this.base}/add_results_for_cases/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
      data: JSON.stringify({ results }),
    })
      .then(response => {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.log(
          '\n',
          ` - Results are published to ${chalk.magenta(
            `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
          )}`,
          '\n'
        );
      })
      .catch(error => console.error(error));
  }

  public closeRun() {
    axios({
      method: 'post',
      url: `${this.base}/close_run/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    })
      .then(() => console.log('- Test run closed successfully'))
      .catch(error => console.error(error));
  }

  public hasTestRun() {
    return this.runId !== null;
  }
}
