library teaolive_test;

import 'dart:async';

import '../lib/src/teaolive.dart';
import '../lib/src/helper/test_util.dart';

import '../lib/teaolive_standalone.dart';

part './teaolive_test.dart';

void main(){

  addTest(testCase);

  setTeaoliveReporter(
    new TeaoliveReporterCombinator(
      [
        new TeaoliveJUnitXMLReporter(),
        new TeaoliveTapReporter()
      ]
    ));

  teaoliveRun();
}
