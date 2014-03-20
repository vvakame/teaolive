library teaolive_test;

import 'dart:async';

import '../lib/src/teaolive.dart';
import '../lib/src/helper/test_util.dart';

import '../lib/teaolive_browser.dart';

part './teaolive_test.dart';

void main(){

  addTest(testCase);

  setTeaoliveReporter(
      new TeaoliveReporterCombinator(
          [new TeaoliveHtmlReporter(), new TeaoliveTapReporter()]));

  teaoliveRun();
}
