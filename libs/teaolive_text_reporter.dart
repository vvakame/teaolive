#library('teaolive_text_reporter');

#import('./teaolive.dart');

class TeaoliveTextReporter implements TeaoliveReporter {
  
  TeaoliveReporter(){}
  
  void onRunnerStart(){
    print("test is started...");
    print("");
  }
  
  void onSuiteResult(TestPiece suite){}

  void onSpecResult(TestPiece spec){}

  void onRunnerResult(TeaoliveRunner runner){
    for(TestPiece piece in runner.tests){
      printPiece(piece, 0);
    }
  }
  
  void printPiece(TestPiece piece, int depth){
    if(piece.isSuite()){
      printSuite(piece, depth);
    } else {
      printSpec(piece, depth);
    }
  }
  
  void printSuite(TestPiece suite, int depth){
    if(suite.ignore){
      put("describe ${suite.description} is skipped", depth);
    } else if(suite.result){
      put("describe ${suite.description} is success!", depth);
    } else {
      put("describe ${suite.description} is failure...", depth);
      
      for(TestPiece piece in suite.tests){
        printPiece(piece, depth + 1);
      }
    }
  }
  
  void printSpec(TestPiece spec, int depth){
    if(spec.ignore){
      put("it ${spec.description} is skipped", depth);
    } else if(spec.result){
      put("it ${spec.description} is success!", depth);
    } else {
      put("it ${spec.description} is failure...", depth);
      if(spec.errorMessage != null){
        put("${spec.errorMessage}", depth + 1);
      } else {
        put("unknown error ${spec.error}", depth + 1);
      }
    }
  }
  
  void put(String msg, int depth){
    StringBuffer buffer = new StringBuffer();
    for(int i = 0; i < depth; i++){
      buffer.add("  ");
    }
    buffer.add(msg);
    print(buffer.toString());
  }
}
