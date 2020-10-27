"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var moment = require("moment");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var chalk = require('chalk');
var Mocha = require('mocha');
var _a = Mocha.Runner.constants, EVENT_RUN_BEGIN = _a.EVENT_RUN_BEGIN, EVENT_RUN_END = _a.EVENT_RUN_END, EVENT_TEST_FAIL = _a.EVENT_TEST_FAIL, EVENT_TEST_PASS = _a.EVENT_TEST_PASS;
/**
 * NOTE: This variable make it able to reuse a test run across test files.
 * Cypress would initialize a reporter instance every test files and a test run would be created.
 */
var cacheTestRunId = null;
var CypressTestRailReporter = /** @class */ (function (_super) {
    __extends(CypressTestRailReporter, _super);
    function CypressTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        var reporterOptions = options.reporterOptions;
        // Overwrite password with token in env.
        // It is required to hard code a password or token in cypress.json by default.
        if (process.env.CYPRESS_TESTRAIL_API_KEY) {
            console.log('  Using token in process.env.CYPRESS_TESTRAIL_API_KEY');
            reporterOptions['password'] = process.env.CYPRESS_TESTRAIL_API_KEY;
        }
        _this.testRail = new testrail_1.TestRail(reporterOptions, cacheTestRunId);
        _this.validate(reporterOptions, 'domain');
        _this.validate(reporterOptions, 'username');
        _this.validate(reporterOptions, 'password');
        _this.validate(reporterOptions, 'projectId');
        _this.validate(reporterOptions, 'suiteId');
        runner.on(EVENT_RUN_BEGIN, function () { return __awaiter(_this, void 0, void 0, function () {
            var executionDateTime, name, description;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
                        name = (reporterOptions.runName || 'Automated test run') + " " + executionDateTime;
                        description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
                        if (!this.testRail.hasTestRun()) return [3 /*break*/, 1];
                        console.log("  Using Test Run already exist (runId:" + cacheTestRunId + ")");
                        return [3 /*break*/, 3];
                    case 1:
                        console.log('  Creating a new Test Run ...');
                        return [4 /*yield*/, this.testRail.createRun(name, description)];
                    case 2:
                        cacheTestRunId = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        runner.on(EVENT_TEST_PASS, function (test) {
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Passed,
                        comment: "Execution time: " + test.duration + "ms",
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });
        runner.on(EVENT_TEST_FAIL, function (test) {
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Failed,
                        comment: "" + test.err.message,
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });
        runner.on(EVENT_RUN_END, function () {
            if (_this.results.length == 0) {
                console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                console.warn('\n', 'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx', '\n');
                _this.testRail.deleteRun();
                return;
            }
            // publish test cases results & close the run
            _this.testRail.publishResults(_this.results);
            // TODO close a test run in the end if needed
            // .then(() => this.testRail.closeRun());
        });
        return _this;
    }
    CypressTestRailReporter.prototype.validate = function (options, name) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error("Missing " + name + " value. Please update reporterOptions in cypress.json");
        }
    };
    return CypressTestRailReporter;
}(mocha_1.reporters.Spec));
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map