#library('teaolive_reporter_combinator');

#import('../teaolive.dart');
#import('../tests/helper/test_util.dart', prefix: "testutil");

class TeaoliveReporterCombinator implements TeaoliveReporter {
  
  List<TeaoliveReporter> reporters;
  
  TeaoliveReporterCombinator(this.reporters){
    assert(reporters != null);
  }
  
  void onRunnerStart() {
    reporters.forEach((TeaoliveReporter reporter) => reporter.onRunnerStart());
  }
  
  void onSuiteResult(TestPiece suite) {
    reporters.forEach((TeaoliveReporter reporter) => reporter.onSuiteResult(suite));
  }

  void onSpecResult(TestPiece spec) {
    reporters.forEach((TeaoliveReporter reporter) => reporter.onSpecResult(spec));
  }
  
  void onRunnerResult(TeaoliveRunner runner) {
    reporters.forEach((TeaoliveReporter reporter) => reporter.onRunnerResult(runner));
  }
}
