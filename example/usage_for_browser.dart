library teaolive_usage;

import 'dart:html';

// #import('package:teaolive/teaolive.dart');
// #import('package:teaolive/libs/teaolive_html_reporter.dart');
import '../lib/teaolive.dart';

import 'tests/sample_test.dart' as sample;
import 'tests/hoge_test.dart' as hoge;
import 'tests/foobar_test.dart' as foobar;

void main(){

  addTest(sample.testCase);
  addTest(hoge.testCase);
  addTest(foobar.testCase);

  setTeaoliveReporter(new TeaoliveHtmlReporter.withParent(document.querySelector("#result"))); // if you want to run from command-line. remove this line.
  teaoliveRun();
}
