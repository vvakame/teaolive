#library('teaolive_introduction');

#import('packages/teaolive/teaolive.dart');

#import('packages/teaolive/reporter/reporter_combinator.dart', prefix: 'combinator');
#import('packages/teaolive/reporter/tap_reporter.dart', prefix: 'tap');
#import('packages/teaolive/reporter/html_reporter.dart', prefix: 'html');

/*
 entry point of testing.
 */
void main() {
  // report
  addTest(testCase);
  
  // setup Reporter
  setTeaoliveReporter(
    new combinator.TeaoliveReporterCombinator(
      [
        new html.TeaoliveHtmlReporter(),
        new tap.TeaoliveTapReporter()
      ]
    ));

  teaoliveRun();
}

void testCase() {
  describe("sample", (){
    it("sample", (){
      
    });
  });  
}