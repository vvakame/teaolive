#library('teaolive_test');

#import('../libs/teaolive.dart');
#import('../libs/teaolive_tap_reporter.dart');

// #import('../libs/teaolive_html_reporter.dart'); // if you want to run from command-line. remove this line.

// DO NOT USE print FUNCTION!!
// We can't change the standard output stream in the current version of Dart.

void main(){
    
  addTest(testCase);

  setTeaoliveReporter(new TeaoliveTapReporter());
  // setTeaoliveReporter(new TeaoliveHtmlReporter()); // if you want to run from command-line. remove this line.
  teaoliveRun();
}

void testCase(){
  describe("save environment", (){
    it("save and restore", (){
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();
      
      // under new environment
      
      TeaoliveRunner resultRunner;
      TeaoliveReporter sniffReporter = new TestSniffer((TeaoliveRunner runner){
        resultRunner = runner;
      });
      setTeaoliveReporter(sniffReporter);

      addTest((){
        describe("success describe", (){
          it("success it", (){
          });
        });
        describe("failure describe", (){
          it("failure it", (){
            expect(1).toBe(2);
          });
        });
        describe("ignore describe, (this describe be success)", (){
          xit("ignore it", (){
          });
          xdescribe("ignore describe", (){
          });
        });
      });
      
      teaoliveRun();
      
      // continue root testing...
      restoreTeaoliveEnvironment(env);
      
      // check result
      expect(countSuccessDescribe(resultRunner)).toBe(2);
      expect(countFailureDescribe(resultRunner)).toBe(1);
      expect(countIgnoreDescribe(resultRunner)).toBe(1);

      expect(countSuccessIt(resultRunner)).toBe(1);
      expect(countFailureIt(resultRunner)).toBe(1);
      expect(countIgnoreIt(resultRunner)).toBe(1);
    });
  });
}

typedef void Sniffer(TeaoliveRunner runner);

class TestSniffer implements TeaoliveReporter {
  
  Sniffer _sniffer;
  
  TestSniffer(Sniffer sniffer): _sniffer = sniffer {}
  
  void onRunnerStart(){}
  
  void onSuiteResult(TeaoliveSuite suite){}

  void onSpecResult(TeaoliveSpec spec){}

  void onRunnerResult(TeaoliveRunner runner){
    _sniffer(runner);
  }
}

typedef bool Counter(TeaoliveTestHolder holder);

int countSuccessDescribe(TeaoliveRunner runner){
  return countResult(runner.tests, (TeaoliveTestHolder holder){
    if(holder.isSuite() && holder.result){
      return true;
    } else {
      return false;
    }
  });
}

int countSuccessIt(TeaoliveRunner runner){
  return countResult(runner.tests, (TeaoliveTestHolder holder){
    if(holder.isSpec() && holder.result){
      return true;
    } else {
      return false;
    }
  });
}

int countIgnoreDescribe(TeaoliveRunner runner){
  return countResult(runner.tests, (TeaoliveTestHolder holder){
    if(holder.isSuite() && holder.suite.ignore){
      return true;
    } else {
      return false;
    }
  });
}

int countIgnoreIt(TeaoliveRunner runner){
  return countResult(runner.tests, (TeaoliveTestHolder holder){
    if(holder.isSpec() && holder.spec.ignore){
      return true;
    } else {
      return false;
    }
  });
}

int countFailureDescribe(TeaoliveRunner runner){
  return countResult(runner.tests, (TeaoliveTestHolder holder){
    if(holder.isSuite() && !holder.suite.ignore && !holder.result){
      return true;
    } else {
      return false;
    }
  });
}

int countFailureIt(TeaoliveRunner runner){
  return countResult(runner.tests, (TeaoliveTestHolder holder){
    if(holder.isSpec() && !holder.spec.ignore && !holder.result){
      return true;
    } else {
      return false;
    }
  });
}

int countResult(List<TeaoliveTestHolder> holderList, Counter counter){
  int result = 0;
  for(TeaoliveTestHolder holder in holderList){
    if(counter(holder)){
      result += 1;
    }
    if(holder.isSuite()){
      result += countResult(holder.suite.tests, counter);
    }
  }
  return result;
}
