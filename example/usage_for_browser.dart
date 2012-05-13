#library('teaolive-usage');

#import('dart:html');

#import('../libs/teaolive.dart');
#import('../libs/teaolive_html_reporter.dart'); // if you want to run from command-line. remove this line.

#import('./sample_test.dart', prefix: "sample");
#import('./hoge_test.dart', prefix: "hoge");
#import('./foobar_test.dart', prefix: "foobar");

void main(){
  
  addTest(sample.testCase);
  addTest(hoge.testCase);
  addTest(foobar.testCase);

  setTeaoliveReporter(new TeaoliveHtmlReporter.withParent(document.query("#result"))); // if you want to run from command-line. remove this line.
  teaoliveRun();
}
