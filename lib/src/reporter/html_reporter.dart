library teaolive_html_reporter;

import 'dart:html';

import '../teaolive.dart';
import '../helper/test_util.dart';

/**
 * For implementation of HTML Reporters of [TeaoliveReporter].
 * this class is working with teaolive.html and teaolive.css.
 */
class TeaoliveHtmlReporter implements TeaoliveReporter {

  final Element _parent;
  final String _classPrefix;

  TeaoliveHtmlReporter()
      : _classPrefix = "",
        _parent = querySelector("#teaolive-result");

  TeaoliveHtmlReporter.withParent(this._parent): _classPrefix = "";
  TeaoliveHtmlReporter.withParentAndPrefix(this._parent, this._classPrefix);

  void onRunnerStart() {
    _parent.innerHtml = "test is started...";
  }

  void onSuiteResult(TestPiece suite) {}

  void onSpecResult(TestPiece spec) {}

  void onRunnerResult(TeaoliveRunner runner) {
    _parent.nodes.clear();

    addHeader(_parent, runner);
    addSummary(_parent, runner);

    final el = new Element.div()..classes.add("${_classPrefix}results-frame");

    for (TestPiece piece in runner.tests) {
      addPiece(el, piece);
    }
    _parent.nodes.add(el);
  }

  void addHeader(final Element parent, TestPiece piece) {
    final el = new Element.div()
        ..classes.add("${_classPrefix}header-frame")
        ..innerHtml = "Teaolive test result. Elapsed time is "
                      "${piece.microseconds / 1000 / 1000} seconds.";

    parent.nodes.add(el);
  }

  void addSummary(final Element parent, TestPiece piece) {
    final el = new Element.div();

    el.classes
        ..add("${_classPrefix}summary-frame")
        ..add("${_classPrefix}" + (piece.result ? "success" : "failure"));

    Function construct = (Function counter, String type, String result, [bool force = false]) {
      int count = counter(piece.tests);
      if (count == 0 && force == false) return;

      final node = new Element.span()
          ..innerHtml = "${count} ${type} ${result}"
          ..classes.add("${_classPrefix}summary")
          ..classes.add("${_classPrefix}${type}")
          ..classes.add("${_classPrefix}${result}");

      el.nodes.add(node);
    };

    construct(countSuccessDescribe, "describe", "passed", true);
    construct(countFailureDescribe, "describe", "failed");
    construct(countIgnoreDescribe, "describe", "ignored");

    construct(countSuccessIt, "it", "passed", true);
    construct(countFailureIt, "it", "failed");
    construct(countIgnoreIt, "it", "ignored");

    parent.nodes.add(el);
  }

  void addPiece(final Element parent, final TestPiece piece) {

    final el = new Element.div()
        ..classes.add("${_classPrefix}" + (piece.isSuite() ? "describe" : "it"));

    final description = new Element.div()
        ..classes.add("description")
        ..innerHtml = piece.description;

    el.nodes.add(description);

    if (piece.ignore) {
      el.classes.add("${_classPrefix}skipped");
    } else if (piece.result) {
      el.classes.add("${_classPrefix}success");
    } else if (piece.isSpec()) {
      el.classes.add("${_classPrefix}failure");

      final error = new Element.div()..classes.add("error");
      el.nodes.add(error);

      error.innerHtml = piece.errorMessage != null ?
          "${error.innerHtml} ${piece.errorMessage}" :
          "${error.innerHtml} unknown error ${piece.error}";

      if (piece.error is AssertionException == false) {
        final Element pre = new Element.pre()..text = piece.trace.toString();
        error.nodes.add(pre);
      }
    }

    parent.nodes.add(el);

    for (TestPiece child in piece.tests) {
      addPiece(el, child);
    }
  }
}
