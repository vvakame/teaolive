library teaolive_reporter_combinator;

import '../teaolive.dart';

/**
 * If you want to use more than one reporter, please use this class.
 */
class TeaoliveReporterCombinator implements TeaoliveReporter {

  List<TeaoliveReporter> _reporters;

  TeaoliveReporterCombinator(this._reporters) {
    assert(_reporters != null);
  }

  void onRunnerStart() {
    _reporters.forEach((TeaoliveReporter reporter) => reporter.onRunnerStart());
  }

  void onSuiteResult(TestPiece suite) {
    _reporters.forEach((TeaoliveReporter reporter) =>
        reporter.onSuiteResult(suite));
  }

  void onSpecResult(TestPiece spec) {
    _reporters.forEach((TeaoliveReporter reporter) =>
        reporter.onSpecResult(spec));
  }

  void onRunnerResult(TeaoliveRunner runner) {
    _reporters.forEach((TeaoliveReporter reporter) =>
        reporter.onRunnerResult(runner));
  }
}
