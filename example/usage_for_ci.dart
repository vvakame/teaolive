#library('teaolive-usage');

// #import('package:teaolive/teaolive.dart');
// #import('package:teaolive/libs/teaolive_junit_xml_reporter.dart');
#import('../teaolive.dart');
// #import('../reporter/teaolive_tap_reporter.dart');
#import('../reporter/teaolive_junit_xml_reporter.dart');

#import('tests/sample_test.dart', prefix: "sample");
#import('tests/hoge_test.dart', prefix: "hoge");
#import('tests/foobar_test.dart', prefix: "foobar");

void main(){
  
  addTest(sample.testCase);
  addTest(hoge.testCase);
  addTest(foobar.testCase);

  // setTeaoliveReporter(new TeaoliveTapReporter());
  setTeaoliveReporter(new TeaoliveJUnitXMLReporter());
  teaoliveRun();
}
