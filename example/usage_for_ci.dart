library teaolive_usage;

// #import('package:teaolive/teaolive.dart');
// #import('package:teaolive/libs/teaolive_junit_xml_reporter.dart');
import '../teaolive.dart';
// #import('../reporter/teaolive_tap_reporter.dart');
import '../reporter/junit_xml_reporter.dart';

import 'tests/sample_test.dart' as sample;
import 'tests/hoge_test.dart' as hoge;
import 'tests/foobar_test.dart' as foobar;
import 'tests/server_side_async.dart' as async;

void main(){

  addTest(sample.testCase);
  addTest(hoge.testCase);
  addTest(foobar.testCase);
  addTest(async.testCase);

  // setTeaoliveReporter(new TeaoliveTapReporter());
  setTeaoliveReporter(new TeaoliveJUnitXMLReporter());
  teaoliveRun();
}
