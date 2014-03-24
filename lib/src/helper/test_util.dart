library teaolive_test_util;

import '../teaolive.dart';

class InjectableReporter implements TeaoliveReporter {

  final _onRunnerStartListener = <Function>[];
  final _onSuiteResultListener = <Function>[];
  final _onSpecResultListener = <Function>[];
  final _onRunnerResultListener = <Function>[];

  void addOnRunnerStart(void listener()) {
    _onRunnerStartListener.add(listener);
  }

  void addOnSuiteResult(void listener(TestPiece suite)) {
    _onSuiteResultListener.add(listener);
  }

  void addOnSpecResult(void listener(TestPiece spec)) {
    _onSpecResultListener.add(listener);
  }

  void addOnRunnerResult(void listener(TeaoliveRunner runner)) {
    _onRunnerResultListener.add(listener);
  }

  void onRunnerStart() {
    _onRunnerStartListener.forEach((Function func) => func());
  }

  void onSuiteResult(TestPiece suite) {
    _onSuiteResultListener.forEach((Function func) => func(suite));
  }

  void onSpecResult(TestPiece spec) {
    _onSpecResultListener.forEach((Function func) => func(spec));
  }

  void onRunnerResult(TeaoliveRunner runner) {
    _onRunnerResultListener.forEach((Function func) => func(runner));
  }
}

class Sniffer implements TeaoliveReporter {

  TeaoliveRunner _runner;

  Sniffer();

  void onRunnerStart() {}

  void onSuiteResult(TestPiece suite) {}

  void onSpecResult(TestPiece spec) {}

  void onRunnerResult(TeaoliveRunner runner) {
    _runner = runner;
  }

  TeaoliveRunner get runner => _runner;

  TestResult get describe {
    int success = countSuccessDescribe(_runner.tests);
    int failure = countFailureDescribe(_runner.tests);
    int ignore = countIgnoreDescribe(_runner.tests);

    return new TestResult(success, failure, ignore);
  }

  TestResult get it {
    int success = countSuccessIt(_runner.tests);
    int failure = countFailureIt(_runner.tests);
    int ignore = countIgnoreIt(_runner.tests);

    return new TestResult(success, failure, ignore);
  }
}

int countSuccessDescribe(List<TestPiece> tests) =>
    _countResult(tests, (TestPiece piece) => piece.isSuite() && piece.result);

int countIgnoreDescribe(List<TestPiece> tests, [bool recursive = false]) =>
    _countResult(tests, (TestPiece piece) => piece.isSuite() && piece.ignore);

int countFailureDescribe(List<TestPiece> tests) {
  return _countResult(tests, (TestPiece piece) =>
      piece.isSuite() && !piece.ignore && !piece.result);
}

int countDescribe(List<TestPiece> tests) {
  return _countResult(tests, (TestPiece piece) => piece.isSuite());
}

int countSuccessIt(List<TestPiece> tests, [bool recursive = false]) {
  return _countResult(tests, (TestPiece piece) =>
      piece.isSpec() && piece.result);
}

int countIgnoreIt(List<TestPiece> tests) {
  return _countResult(tests, (TestPiece piece) =>
      piece.isSpec() && piece.ignore);
}

int countFailureIt(List<TestPiece> tests) {
  return _countResult(tests, (TestPiece piece) =>
      piece.isSpec() && !piece.ignore && !piece.result);
}

int countIt(List<TestPiece> tests) {
  return _countResult(tests, (TestPiece piece) => piece.isSpec());
}

int _countResult(List<TestPiece> pieces, bool counter(TestPiece)) {
  int result = 0;
  for (TestPiece piece in pieces) {
    if (counter(piece)){
      result++;
    }
    result += _countResult(piece.tests, counter);
  }
  return result;
}

class TestResult {
  int _success = 0;
  int _failure = 0;
  int _ignore = 0;

  TestResult(this._success, this._failure, this._ignore);

  int get success => _success;
  int get failure => _failure;
  int get ignore => _ignore;
}
