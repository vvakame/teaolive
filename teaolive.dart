#library('teaolive');

void describe(String name, Function test){
  if(_runner == null){
    _runner = new TeaoliveRunner();
  }
  _runner.addSuite(new TeaoliveSuite(name, test));
}

void it(String name, Function test){
  if(_runner == null){
    _runner = new TeaoliveRunner();
  }
  if(_currentSuite == null){
    _runner.addSpec(new TeaoliveSpec(name, test));
  } else {
    _currentSuite.addSpec(new TeaoliveSpec(name, test));
  }
}

Expection expect(Object obj){
  return new Expection.expect(obj);
}

TeaoliveReporter _reporter;
TeaoliveRunner _runner;
TeaoliveSuite _currentSuite;

void teaoliveRun() {
  _runner.run();
}

void setTeaoliveReporter(TeaoliveReporter reporter) {
  _reporter = reporter;
}

interface TeaoliveReporter default TeaoliceTextReporter {

  TeaoliveReporter();
  
  void onRunnerStart();
  
  void onRunnerResult(TeaoliveRunner runner);
  
  void onSuiteResult(TeaoliveSuite suite);

  void onSpecResult(TeaoliveSpec spec);
}

class TeaoliceTextReporter implements TeaoliveReporter {
  
  TeaoliveReporter(){}
  
  void onRunnerStart(){
    print("test is started...");
  }
  
  void onSuiteResult(TeaoliveSuite suite){}

  void onSpecResult(TeaoliveSpec spec){}

  void onRunnerResult(TeaoliveRunner runner){
    for(TeaoliveSuite suite in runner.suites){
      if(suite.result){
        print("describe ${suite.description} is success!");
      } else {
        print("describe ${suite.description} is failure...");
        
        for(TeaoliveSpec spec in suite.specs){
          if(spec.result){
            print("  it ${spec.description} is success!");
          } else {
            print("  it ${spec.description} is failure...");
            if(spec.errorMessage != null){
              print("    ${spec.errorMessage}");
            } else {
              print("    unknown error ${spec.error}");
            }
          }
        }
      }
    }
  }
}

class TeaoliveRunner {
  List<TeaoliveSuite> suites;
  
  TeaoliveSuite topLevelSuite;
  
  TeaoliveRunner(): suites = new List<TeaoliveSuite>();
  
  void run(){
    if(_reporter == null){
      _reporter = new TeaoliveReporter();
    }
    
    _reporter.onRunnerStart();
    
    for(TeaoliveSuite suite in suites){
      suite.run();

      _reporter.onSuiteResult(suite);
    }
    
    _reporter.onRunnerResult(this);
  }
  
  void addSuite(TeaoliveSuite suite){
    suites.add(suite);
  }
  
  void addSpec(TeaoliveSpec spec){
    if(topLevelSuite == null){
      topLevelSuite = new TeaoliveSuite("top level", (){});
    }
    topLevelSuite.addSpec(spec);
  }
}

class TeaoliveSuite {
  String description;
  Function test;

  List<TeaoliveSpec> specs;
  
  bool result = false;
  bool start = false;
  bool finish = false;

  TeaoliveSuite(this.description, this.test): specs = new List<TeaoliveSpec>();
  
  void run(){
    start = true;
    _currentSuite = this;
    test();
    _currentSuite = null;
    finish = true;
    
    result = true;
    for(TeaoliveSpec spec in specs){
      if(spec.start == true && spec.finish == true && spec.result == true){
        continue;
      }
      result = false;
    }
  }
  
  void addSpec(TeaoliveSpec spec){
    specs.add(spec);
    spec.run();
    _reporter.onSpecResult(spec);
  }
}

class TeaoliveSpec {
  String description;
  Function test;
  
  bool result = false;
  bool start = false;
  bool finish = false;
  
  String errorMessage;
  var error;
  
  
  TeaoliveSpec(this.description, this.test);
  
  void run(){
    start = true;
    try{
      test();
    } catch(AssersionException e) {
      errorMessage = e.msg;
      error = e;
      return;
    } catch(var e) {
      error = e;
      return;
    } finally {
      finish = true;
    }
    result = true;
  }
}

class AssersionException implements Exception {
  String msg;
  
  AssersionException.msg(this.msg) : super() ;
}

class Expection {
  
  Object expect;
  List<Function> opList;
  
  Expection.expect(this.expect): opList = new List<Function>();

  Expection._expectWithOp(Expection expection, Function op): this.expect(expection.expect){
    opList.addAll(expection.opList);
    opList.add(op);
  }

  Expection get not(){
    return new Expection._expectWithOp(this, (bool result)=> !result);
  }
  
  void toBe(var obj){
    bool result = _toBe(obj);
    
    for(Function f in opList){
      result = f(result);
    }
    
    if(result){
      throw new AssersionException.msg("expected ${expect}, but got ${obj}.");
    }
  }
  
  bool _toBe(var obj){
    return expect !== obj;
  }
}
