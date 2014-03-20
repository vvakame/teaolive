library teaolive_tap_reporter;

import '../teaolive.dart';

/**
 * Generate a [TAP](http://en.wikipedia.org/wiki/Test_Anything_Protocol) format report.
 */
class TeaoliveTapReporter implements TeaoliveReporter {

  void onRunnerStart() {}

  void onSuiteResult(TestPiece suite) {}

  void onSpecResult(TestPiece spec) {}

  void onRunnerResult(TeaoliveRunner runner) {
    printHeader(runner);
    printBody(runner);
  }

  void printHeader(TeaoliveRunner runner) {
    int specTotal = countSpec(runner);
    writeLine("1..${specTotal}");
  }

  int countSpec(TeaoliveRunner runner) =>
      runner.tests.fold(0, (s, TestPiece piece) => s + _countSpec(piece));

  int _countSpec(TestPiece piece) => piece.isSpec() ?
      1 :
      piece.tests.fold(0, (s, TestPiece child) => s + _countSpec(child));

  void printBody(TeaoliveRunner runner) {
    for (TestPiece piece in runner.tests) {
      if (piece.isRunner() || piece.isSuite()) {
        processSuite(piece);
      } else {
        processSpec(piece);
      }
    }
  }

  int _seq = 0;

  int getNo() => ++_seq;

  void processSuite(TestPiece suite) {
    if (suite.ignore) {
      writeLine("# describe ${suite.description} # SKIP");
    } else {
      writeLine("# describe ${suite.description}");
    }
    for (TestPiece piece in suite.tests) {
      if (piece.isRunner() || piece.isSuite()) {
        processSuite(piece);
      } else {
        processSpec(piece);
      }
    }
  }

  void processSpec(TestPiece spec) {
    if (spec.ignore) {
      writeLine("ok ${getNo()} it ${spec.description} # SKIP");
    } else if (spec.result) {
      writeLine("ok ${getNo()} it ${spec.description}");
    } else {
      if (spec.errorMessage != null) {
        writeLine("not ok ${getNo()} it ${spec.description}, "
                  "${spec.errorMessage}");
      } else {
        writeLine("not ok ${getNo()} it ${spec.description}");
      }
    }
  }

  void writeLine(String str) {
    print(str);
  }
}
