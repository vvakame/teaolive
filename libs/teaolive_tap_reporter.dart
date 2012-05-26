#library('teaolive_tap_reporter');

#import('./teaolive.dart');

class TeaoliveTapReporter implements TeaoliveReporter {
    
  TeaoliveReporter(){}

  void onRunnerStart(){}
  
  void onSuiteResult(TestPiece suite){}

  void onSpecResult(TestPiece spec){}

  void onRunnerResult(TeaoliveRunner runner){
    printHeader(runner);
    printBody(runner);
  }
  
  void printHeader(TeaoliveRunner runner){
    int specTotal = countSpec(runner);
    print("1..${specTotal}");
  }
  
  int countSpec(TeaoliveRunner runner){
    int sum = 0;
    for(TestPiece piece in runner.tests){
      sum += _countSpec(piece);
    }
    return sum;
  }
  
  int _countSpec(TestPiece piece){
    if(piece.isSpec()){
      return 1;
    } else {
      int sum = 0;
      for(TestPiece child in piece.tests){
        sum += _countSpec(child);
      }
      return sum;
    }
  }
  
  void printBody(TeaoliveRunner runner){
    for(TestPiece piece in runner.tests){
      if(piece.isSuite()){
        processSuite(piece);
      } else {
        processSpec(piece);
      }
    }
  }

  int _seq = 0;
  
  int getNo(){
    _seq++;
    return _seq;
  }
  
  void processSuite(TestPiece suite){
    if(suite.ignore){
      print("# describe ${suite.description} # SKIP");
    } else {
      print("# describe ${suite.description}");
    }
    for(TestPiece piece in suite.tests){
      if(piece.isSuite()){
        processSuite(piece);
      } else {
        processSpec(piece);
      }
    }
  }

  void processSpec(TestPiece spec){
    if(spec.ignore){
      print("ok ${getNo()} it ${spec.description} # SKIP");
    } else if(spec.result){
      print("ok ${getNo()} it ${spec.description}");
    } else {
      if(spec.errorMessage != null){
        print("not ok ${getNo()} it ${spec.description}, ${spec.errorMessage}");
      } else {
        print("not ok ${getNo()} it ${spec.description}");
      }
    }
  }
}
