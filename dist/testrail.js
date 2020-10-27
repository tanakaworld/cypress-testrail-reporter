"use strict";
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
var axios = require('axios');
var chalk = require('chalk');
var TestRail = /** @class */ (function () {
    function TestRail(options, runId) {
        if (runId === void 0) { runId = null; }
        this.options = options;
        this.includeAll = true;
        this.caseIds = [];
        this.base = "https://" + options.domain + "/index.php?/api/v2";
        this.runId = runId;
    }
    TestRail.prototype.getCases = function () {
        return axios({
            method: 'get',
            url: this.base + "/get_cases/" + this.options.projectId + "&suite_id=" + this.options.suiteId + "&section_id=" + this.options.groupId + "&filter=" + this.options.filter,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password
            }
        })
            .then(function (response) { return response.data.map(function (item) { return item.id; }); })
            .catch(function (error) { return console.error(error); });
    };
    TestRail.prototype.createRun = function (name, description) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.options.includeAllInTestRun === false)) return [3 /*break*/, 2];
                        this.includeAll = false;
                        _a = this;
                        return [4 /*yield*/, this.getCases()];
                    case 1:
                        _a.caseIds = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                            axios({
                                method: 'post',
                                url: _this.base + "/add_run/" + _this.options.projectId,
                                headers: { 'Content-Type': 'application/json' },
                                auth: {
                                    username: _this.options.username,
                                    password: _this.options.password,
                                },
                                data: JSON.stringify({
                                    suite_id: _this.options.suiteId,
                                    name: name,
                                    description: description,
                                    include_all: _this.includeAll,
                                    case_ids: _this.caseIds
                                }),
                            })
                                .then(function (response) {
                                _this.runId = response.data.id;
                                resolve(_this.runId);
                            })
                                .catch(function (error) {
                                console.error(error);
                                reject(error);
                            });
                        })];
                }
            });
        });
    };
    TestRail.prototype.deleteRun = function () {
        axios({
            method: 'post',
            url: this.base + "/delete_run/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).catch(function (error) { return console.error(error); });
    };
    TestRail.prototype.publishResults = function (results) {
        var _this = this;
        return axios({
            method: 'post',
            url: this.base + "/add_results_for_cases/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({ results: results }),
        })
            .then(function (response) {
            console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
            console.log('\n', " - Results are published to " + chalk.magenta("https://" + _this.options.domain + "/index.php?/runs/view/" + _this.runId), '\n');
        })
            .catch(function (error) { return console.error(error); });
    };
    TestRail.prototype.closeRun = function () {
        axios({
            method: 'post',
            url: this.base + "/close_run/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        })
            .then(function () { return console.log('- Test run closed successfully'); })
            .catch(function (error) { return console.error(error); });
    };
    TestRail.prototype.hasTestRun = function () {
        return this.runId !== null;
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map