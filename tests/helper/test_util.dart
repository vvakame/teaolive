#library('teaolive_test_util');

#import('../../teaolive.dart');

class Sniffer implements TeaoliveReporter {
  
  TeaoliveRunner _runner;
  
  Sniffer();
  
  void onRunnerStart(){}
  
  void onSuiteResult(TestPiece suite){}

  void onSpecResult(TestPiece spec){}

  void onRunnerResult(TeaoliveRunner runner){
    _runner = runner;
  }
  
  TestResult get describe() {
    int success = _countSuccessDescribe(_runner);
    int failure = _countFailureDescribe(_runner);
    int ignore = _countIgnoreDescribe(_runner);
    
    return new TestResult(success, failure, ignore);
  }

  TestResult get it() {
    int success = _countSuccessIt(_runner);
    int failure = _countFailureIt(_runner);
    int ignore = _countIgnoreIt(_runner);
    
    return new TestResult(success, failure, ignore);
  }

  int _countSuccessDescribe(TeaoliveRunner runner){
    return _countResult(runner.tests, (TestPiece piece){
      if(piece.isSuite() && piece.result){
        return true;
      } else {
        return false;
      }
    });
  }
  
  int _countSuccessIt(TeaoliveRunner runner){
    return _countResult(runner.tests, (TestPiece piece){
      if(piece.isSpec() && piece.result){
        return true;
      } else {
        return false;
      }
    });
  }
  
  int _countIgnoreDescribe(TeaoliveRunner runner){
    return _countResult(runner.tests, (TestPiece piece){
      if(piece.isSuite() && piece.ignore){
        return true;
      } else {
        return false;
      }
    });
  }
  
  int _countIgnoreIt(TeaoliveRunner runner){
    return _countResult(runner.tests, (TestPiece piece){
      if(piece.isSpec() && piece.ignore){
        return true;
      } else {
        return false;
      }
    });
  }
  
  int _countFailureDescribe(TeaoliveRunner runner){
    return _countResult(runner.tests, (TestPiece piece){
      if(piece.isSuite() && !piece.ignore && !piece.result){
        return true;
      } else {
        return false;
      }
    });
  }
  
  int _countFailureIt(TeaoliveRunner runner){
    return _countResult(runner.tests, (TestPiece piece){
      if(piece.isSpec() && !piece.ignore && !piece.result){
        return true;
      } else {
        return false;
      }
    });
  }
  
  int _countResult(List<TestPiece> pieces, bool counter(TestPiece)){
    int result = 0;
    for(TestPiece piece in pieces){
      if(counter(piece)){
        result += 1;
      }
      if(piece.isSuite()){
        result += _countResult(piece.tests, counter);
      }
    }
    return result;
  }
}

class TestResult {
  int _success = 0;
  int _failure = 0;
  int _ignore = 0;
  
  TestResult(this._success, this._failure, this._ignore);
  
  int get success() => _success;
  int get failure() => _failure;
  int get ignore() => _ignore;
}
