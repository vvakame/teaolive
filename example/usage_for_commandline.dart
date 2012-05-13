#library('teaolive-usage');

#import('../libs/teaolive.dart');

#import('./sample_test.dart', prefix: "sample");
#import('./hoge_test.dart', prefix: "hoge");
#import('./foobar_test.dart', prefix: "foobar");

void main(){
  
  addTest(sample.testCase);
  addTest(hoge.testCase);
  addTest(foobar.testCase);

  teaoliveRun();
}
