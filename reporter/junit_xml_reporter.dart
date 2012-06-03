#library('teaolive_junit_xml_reporter');

#import('dart:io');

#import('../teaolive.dart');
#import('../tests/helper/test_util.dart', prefix: "testutil");

/**
 * Generate a JUnit XML format report.
 * this is useful when running on the CI.
 * typically, this class generate 'teaolive_report.xml'.
 */
class TeaoliveJUnitXMLReporter implements TeaoliveReporter {
  
  File _output;
  OutputStream _stream;
  
  TeaoliveJUnitXMLReporter.withFile(this._output) {
    _init();
  }
  
  TeaoliveJUnitXMLReporter(){
    _output = new File('teaolive_report.xml');
    _init();
  }
  
  void _init(){
    if(_output.existsSync()){
      _output.deleteSync();
    }
    _stream = _output.openOutputStream(FileMode.WRITE);
  }
  
  void onRunnerStart(){
  }
  
  void onSuiteResult(TestPiece suite){}

  void onSpecResult(TestPiece spec){}

  void onRunnerResult(TeaoliveRunner runner){
    writeXmlDocType();
    writeTestSuitesStart();
    
    writeTopLevelTestSuites(runner.tests);
    
    writeTestSuitesEnd();
    
    _stream.close();
  }
  
  void writeTopLevelTestSuites(List<TestPiece> tests){

    for(TestPiece piece in tests){
      if(piece.ignore){
        continue;
      }
      if(piece.isSuite()){
        int testCount = testutil.countIt(piece.tests) - testutil.countIgnoreIt(piece.tests);
        int failures = testutil.countFailureIt(piece.tests);
        writeTestSuiteStart(piece.description, testCount, failures: failures);
        writeTestSuites(piece);
        writeTestSuiteEnd();
        
      } else {
        int errors = piece.result ? 0 : 1;
        writeTestSuiteStart(piece.description, 1, errors: errors);
        writeSpec(piece);
        writeTestSuiteEnd();
      }
    }
  }
  
  void writeTestSuites(TestPiece suite){
    for(TestPiece piece in suite.tests){
      if(piece.isSuite()){
        writeTestSuites(piece);
        continue;
      } else if(piece.ignore){
        continue;
      }
      if(piece.result){
        writeTestCaseSuccess(piece.description);
      } else if(piece.error is AssertionException) {
        writeTestCaseFailure(piece.description, piece.errorMessage, piece.trace);
      } else {
        writeTestCaseError(piece.description, piece.errorMessage, piece.trace);
      }
    }
  }
  
  void writeSpec(TestPiece piece){
    assert(piece.isSpec());
    writeTestCaseSuccess(piece.description);
  }
  
  void writeXmlDocType(){
    writeLine("<?xml version='1.0' encoding='utf-8'?>");
  }
  
  void writeTestSuitesStart(){
    writeLine("<testsuites>");
  }
  
  void writeTestSuitesEnd(){
    writeLine("</testsuites>");
  }
  
  void writeTestSuiteStart(String name, int tests, [int errors = 0, int failures = 0, double time = 0.0]){
    writeLine('<testsuite name="${escape(name)}" errors="${errors}" failures="${failures}" tests="${tests}" time="${time}">');
  }

  void writeTestSuiteEnd(){
    writeLine("</testsuite>");
  }
  
  void writeTestCaseSuccess(String name, [String className = "default", time = 0.0]){
    writeLine('<testcase name="${escape(name)}" classname="${escape(className)}" time="${time}" />');
  }

  void writeTestCaseFailure(String name, String reason, Dynamic trace, [String className = "default", time = 0.0]){
    if(reason == null){
      reason = "unknown";
    }
    writeLine('<testcase name="${escape(name)}" classname="${escape(className)}" time="${time}">');
    write('<failure message="${escape(reason)}" type="AsserionException">');
    write(escape(trace.toString()));
    writeLine('</failure>');
    writeLine('</testcase>');
  }

  void writeTestCaseError(String name, String reason, Dynamic trace, [String className = "default", time = 0.0]){
    if(reason == null){
      reason = "unknown";
    }
    writeLine('<testcase name="${escape(name)}" classname="${escape(className)}" time="${time}">');
    write('<error message="${escape(reason)}" type="Unknown">');
    write(escape(trace.toString()));
    writeLine('</error>');
    writeLine('</testcase>');
  }

  String escape(String str){
    return str.replaceAll('"', "\\\"").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  void write(String str){
    _stream.writeString(str);
  }
  
  void writeLine(String str){
    write(str);
    write("\n");
  }
}
