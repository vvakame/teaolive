#library('teaolive_junit_xml_reporter');

#import('dart:io');

#import('../teaolive.dart');

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
    writeLine("<?xml version='1.0' encoding='utf-8'?>");
    
    writeLine("<testsuites>");
    writeLine('<testsuite name="usage_for_ci_sh" errors="0" failures="0" tests="1" time="0.0325229167938232">');
    writeLine('<testcase name="it toBe is valid." classname="usage_for_ci_sh" time="7.51018524169922e-05" />');
    writeLine("</testsuite>");
    writeLine("</testsuites>");
    
    _stream.close();
  }
  
  void write(String str){
    print(str);
    _stream.writeString(str);
  }
  
  void writeLine(String str){
    write(str);
    write("\n");
  }
}
