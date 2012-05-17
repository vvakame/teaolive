#library('teaolive_tap_reporter');

#import('./teaolive.dart');

class TeaoliveTapReporter implements TeaoliveReporter {
    
  TeaoliveReporter(){}

  void onRunnerStart(){}
  
  void onSuiteResult(TeaoliveSuite suite){}

  void onSpecResult(TeaoliveSpec spec){}

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
    for(TeaoliveTestHolder holder in runner.tests){
      sum += _countSpec(holder);
    }
    return sum;
  }
  
  int _countSpec(TeaoliveTestHolder holder){
    if(holder.isSpec()){
      return 1;
    } else {
      int sum = 0;
      for(TeaoliveTestHolder child in holder.suite.tests){
        sum += _countSpec(child);
      }
      return sum;
    }
  }
  
  void printBody(TeaoliveRunner runner){
    for(TeaoliveTestHolder holder in runner.tests){
      if(holder.isSuite()){
        processSuite(holder.suite);
      } else {
        processSpec(holder.spec);
      }
    }
  }

  int _seq = 0;
  
  int getNo(){
    _seq++;
    return _seq;
  }
  
  void processSuite(TeaoliveSuite suite){
    if(suite.ignore){
      print("# describe ${suite.description} # SKIP");
    } else {
      print("# describe ${suite.description}");
    }
    for(TeaoliveTestHolder holder in suite.tests){
      if(holder.isSuite()){
        processSuite(holder.suite);
      } else {
        processSpec(holder.spec);
      }
    }
  }

  void processSpec(TeaoliveSpec spec){
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
