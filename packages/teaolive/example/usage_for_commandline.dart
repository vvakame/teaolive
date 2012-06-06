#library('teaolive-usage');

// #import('package:teaolive/teaolive.dart');
#import('../teaolive.dart');

#import('tests/sample_test.dart', prefix: "sample");
#import('tests/hoge_test.dart', prefix: "hoge");
#import('tests/foobar_test.dart', prefix: "foobar");
#import('tests/server_side_async.dart', prefix: "async");

void main(){
  
  addTest(sample.testCase);
  addTest(hoge.testCase);
  addTest(foobar.testCase);
  addTest(async.testCase);

  teaoliveRun();
}
