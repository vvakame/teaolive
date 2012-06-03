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
        writeTestSuiteStart(piece, testCount, failures: failures);
        writeTestSuites(piece);
        writeTestSuiteEnd();
        
      } else {
        int errors = piece.result ? 0 : 1;
        writeTestSuiteStart(piece, 1, errors: errors);
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
        writeTestCaseSuccess(piece);
      } else if(piece.error is AssertionException) {
        writeTestCaseFailure(piece);
      } else {
        writeTestCaseError(piece);
      }
    }
  }
  
  void writeSpec(TestPiece piece){
    assert(piece.isSpec());
    writeTestCaseSuccess(piece);
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
  
  void writeTestSuiteStart(TestPiece suite, int tests, [int errors = 0, int failures = 0]){
    num time = suite.microseconds / 1000 / 1000; // JUnit use "second".
    writeLine('<testsuite name="${escape(suite.description)}" errors="${errors}" failures="${failures}" tests="${tests}" time="${time}">');
  }

  void writeTestSuiteEnd(){
    writeLine("</testsuite>");
  }
  
  void writeTestCaseSuccess(TestPiece spec){
    num time = spec.microseconds / 1000 / 1000; // JUnit use "second".
    var className = "unknown";
    writeLine('<testcase name="${escape(spec.description)}" classname="${escape(className)}" time="${time}" />');
  }

  void writeTestCaseFailure(TestPiece spec){
    var reason = spec.errorMessage;
    if(reason == null){
      reason = "unknown";
    }
    var className = spec.error.toString();
    num time = spec.microseconds / 1000 / 1000; // JUnit use "second".
    writeLine('<testcase name="${escape(spec.description)}" classname="${escape(className)}" time="${time}">');
    write('<failure message="${escape(reason)}" type="AsserionException">');
    write(escape(spec.trace.toString()));
    writeLine('</failure>');
    writeLine('</testcase>');
  }

  void writeTestCaseError(TestPiece spec){
    var reason = spec.errorMessage;
    if(reason == null){
      reason = "unknown";
    }
    var className = spec.error.toString();
    num time = spec.microseconds / 1000 / 1000; // JUnit use "second".
    writeLine('<testcase name="${spec.description}" classname="${escape(className)}" time="${time}">');
    write('<error message="${escape(reason)}" type="Unknown">');
    write(escape(spec.trace.toString()));
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
