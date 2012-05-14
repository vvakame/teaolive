/*
 * Copyright 2012 vvakame <vvakame@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#library('teaolive');

/**
 * "describe".
 * If you want to start writing BDD test, start with this function.
 */
void describe(String description, Function test){
  if(_runner == null){
    _runner = new TeaoliveRunner();
  }
  _runner.addSuite(new TeaoliveSuite(description, test));
}

/**
 * If you do not want to use to "description" temporarily, you can use this function.
 */
void xdescribe(String description, Function test){
}

/**
 * "it".
 * If you want to describe the behavior, start with this function.
 * usually, this method is under "describe" function.
 */
void it(String description, Function test){
  if(_runner == null){
    _runner = new TeaoliveRunner();
  }
  _runner.addSpec(new TeaoliveSpec(description, test));
}

/**
 * If you do not want to use to "it" temporarily, you can use this function.
 */
void xit(String description, Function test){
}

/**
 * Helper function for integrated test case of some source codes.
 */
void addTest(void testCase()){
  testCase();
}

/**
 * Be the first to call for inspection of the expected value.
 * The rest is just going to write that may the intellisense be with you.
 */
/* I was not like current implementation. I'm really want to like this.
<T> Expection<T> expect(T obj){
  return new Exception.expect(obj);
}
 * because type checking is perform.
 * expect("hoge").toBe(1) // error at compile-time. like hamcrest library (Java).
 */
Expectation expect(var obj){
  return new _ExpectationImpl.expect(obj);
}

interface Expectation<T> {
  Expectation<T> get not();
  
  void toBe(T obj);

  void toEqual(T obj);

  void toBeNull();
}


/**
 * start testing.
 * "describe" and "it" functions were already call?
 */
void teaoliveRun() {
  _runner.run();
}

/**
 * set TeaoliveReporter.
 * the default is to use the TeaoliveTextReporter class.
 * It's use a "print" function.
 */
void setTeaoliveReporter(TeaoliveReporter reporter) {
  _reporter = reporter;
}

/**
 * this class takes the test results and convert it to a human-readable format.
 * and more. if reporter output the TAP( http://en.wikipedia.org/wiki/Test_Anything_Protocol ) format. Dart can be a CI friendly.
 */
interface TeaoliveReporter default TeaoliveTextReporter {

  TeaoliveReporter();

  /** this method called when start test running. */
  void onRunnerStart();
  
  /** this method called when finish test running. */
  void onRunnerResult(TeaoliveRunner runner);
  
  /** this method called when finish one of "describe". */
  void onSuiteResult(TeaoliveSuite suite);

  /** this method called when finish one of "it". */
  void onSpecResult(TeaoliveSpec spec);
}

// implementation from here.

TeaoliveReporter _reporter;
TeaoliveRunner _runner;

class TeaoliveTextReporter implements TeaoliveReporter {
  
  TeaoliveReporter(){}
  
  void onRunnerStart(){
    print("test is started...");
    print("");
  }
  
  void onSuiteResult(TeaoliveSuite suite){}

  void onSpecResult(TeaoliveSpec spec){}

  void onRunnerResult(TeaoliveRunner runner){
    for(TeaoliveTestHolder holder in runner.tests){
      printHolder(holder, 0);
    }
  }
  
  void printHolder(TeaoliveTestHolder holder, int depth){
    if(holder.isSuite()){
      printSuite(holder.suite, depth);
    } else {
      printSpec(holder.spec, depth);
    }
  }
  
  void printSuite(TeaoliveSuite suite, int depth){
    if(suite.result){
      put("describe ${suite.description} is success!", depth);
    } else {
      put("describe ${suite.description} is failure...", depth);
      
      for(TeaoliveTestHolder holder in suite.tests){
        printHolder(holder, depth + 1);
      }
    }
  }
  
  void printSpec(TeaoliveSpec spec, int depth){
    if(spec.result){
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

class TeaoliveTestHolder {
  TeaoliveSuite _suite;
  TeaoliveSpec _spec;
  
  TeaoliveTestHolder.suite(this._suite);
  TeaoliveTestHolder.spec(this._spec);
  
  bool isSuite(){
    return _suite != null;
  }

  bool isSpec(){
    return _spec != null;
  }
  
  TeaoliveSuite get suite(){
    assert(_suite != null);
    return _suite;
  }
  
  TeaoliveSpec get spec(){
    assert(_spec != null);
    return _spec;
  }
  
  bool get result(){
    if(isSuite()){
      return _suite.result;
    } else {
      return _spec.result;
    }
  }

  bool get start(){
    if(isSuite()){
      return _suite.start;
    } else {
      return _spec.start;
    }
  }

  bool get finish(){
    if(isSuite()){
      return _suite.finish;
    } else {
      return _spec.finish;
    }
  }
}

class TeaoliveRunner {
  
  List<TeaoliveTestHolder> tests;

  TeaoliveSuite _currentSuite;

  TeaoliveRunner(): tests = new List<TeaoliveTestHolder>();
  
  void run(){
    if(_reporter == null){
      _reporter = new TeaoliveReporter();
    }
    
    _reporter.onRunnerStart();
    
    for(TeaoliveTestHolder holder in tests){
      if(holder.isSuite()){
        _executeSuite(holder.suite);
      } else {
        _executeSpec(holder.spec);
      }
    }
    
    _reporter.onRunnerResult(this);
  }
    
  void addSuite(TeaoliveSuite suite){
    if(_currentSuite != null){
      _currentSuite.addSuite(suite);
    } else {
      tests.add(new TeaoliveTestHolder.suite(suite));
    }
  }
  
  void addSpec(TeaoliveSpec spec){
    if(_currentSuite != null){
      _currentSuite.addSpec(spec);
    } else {
      tests.add(new TeaoliveTestHolder.spec(spec));
    }
  }
  
  void _executeSuite(TeaoliveSuite suite){
    TeaoliveSuite tmp = _currentSuite;
    _currentSuite = suite;
    _currentSuite.run();
    _currentSuite = tmp;
  }

  void _executeSpec(TeaoliveSpec spec){
    spec.run();
  }
}

class TeaoliveSuite {
  String description;
  Function test;

  List<TeaoliveTestHolder> tests;
  
  bool result = false;
  bool start = false;
  bool finish = false;

  TeaoliveSuite(this.description, this.test): tests = new List<TeaoliveTestHolder>();
  
  void run(){
    try{
      start = true;
      test();
      finish = true;
      
      result = true;

      for(TeaoliveTestHolder holder in tests){
        if(holder.start == true && holder.finish == true && holder.result == true){
          continue;
        }
        result = false;
      }
    } finally {
      _reporter.onSuiteResult(this);
    }
  }

  void addSuite(TeaoliveSuite suite){
    tests.add(new TeaoliveTestHolder.suite(suite));
    _runner._executeSuite(suite);
  }
  
  void addSpec(TeaoliveSpec spec){
    tests.add(new TeaoliveTestHolder.spec(spec));
    _runner._executeSpec(spec);
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
    try{
      start = true;

      try{
        test();
      } catch(AssertionException e) {
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

    } finally {
      _reporter.onSpecResult(this);
    }
  }
}

class AssertionException implements Exception {
  String msg;
  
  AssertionException.msg(this.msg) : super() ;
}

typedef bool _op(StringBuffer buffer, bool result);

class _ExpectationImpl<T> implements Expectation<T> {
  
  T expect;
  List<_op> opList;
  
  _ExpectationImpl.expect(T this.expect): opList = new List<_op>();

  _ExpectationImpl._expectWithOp(_ExpectationImpl expection, _op op): this.expect(expection.expect){
    opList.addAll(expection.opList);
    opList.add(op);
  }

  Function _createOp(){
  }
  
  _ExpectationImpl get not(){

    _op op = (buffer, result){
      buffer.add("not ");
      return !result;
    };
    return new _ExpectationImpl._expectWithOp(this, op);
  }
  
  void toBe(T actual){
    _check(expect === actual, actual);
  }

  void toBeNull(){
    _check(expect == null);
  }

  void toEqual(T actual){
    _check(expect == actual, actual);
  }

  void _check(bool result, [T actual = null]){
    StringBuffer buffer = new StringBuffer();
    for(_op op in opList){
      result = op(buffer, result);
    }

    if(result == false){
      throw new AssertionException.msg("expected is ${buffer.toString()}<${expect}>, but got <${actual}>.");
    }
  }
}
