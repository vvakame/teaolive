#library('teaolive_junit_xml_reporter');

#import('dart:io');

#import('../teaolive.dart');
#import('../tests/helper/test_util.dart', prefix: "testutil");

class TeaoliveJUnitXMLReporter implements TeaoliveReporter {
  
  File _output;
  OutputStream _stream;
  
  TeaoliveJUnitXMLReporter.withFile(this._output) {
    _init();
  }
  
  TeaoliveJUnitXMLReporter(){
    _output = new File('junit_output.xml');
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
        int testCount = testutil.countIt(tests) - testutil.countIgnoreIt(tests);
        int failures = testutil.countFailureIt(tests);
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
      } else {
        writeTestCaseFailure(piece.description, piece.errorMessage);
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

  void writeTestCaseFailure(String name, String reason, [String className = "default", time = 0.0]){
    if(reason == null){
      reason = "unknown";
    }
    writeLine('<testcase name="${escape(name)}" classname="${escape(className)}" time="${time}">');
    writeLine('<failure message="${escape(reason)}" type="Teaolive"></failure>');
    writeLine('</testcase>');
  }
  
  String escape(String str){
    return str.replaceAll('"', "\\\"");
  }

  void write(String str){
    _stream.writeString(str);
  }
  
  void writeLine(String str){
    write(str);
    write("\n");
  }
}
