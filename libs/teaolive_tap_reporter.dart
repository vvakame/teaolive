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

  void processSuite(TeaoliveSuite suite){
    for(TeaoliveTestHolder holder in suite.tests){
      if(holder.isSuite()){
        processSuite(holder.suite);
      } else {
        processSpec(holder.spec);
      }
    }
  }

  void processSpec(TeaoliveSpec spec){
    if(spec.result){
      print("ok");
    } else {
      print("not ok");
    }
  }
}
