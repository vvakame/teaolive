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
 * "it".
 * If you want to describe the behavior, start with this function.
 * usually, this method is under "describe" function.
 */
void it(String description, Function test){
  if(_runner == null){
    _runner = new TeaoliveRunner();
  }
  if(_currentSuite == null){
    _runner.addSpec(new TeaoliveSpec(description, test));
  } else {
    _currentSuite.addSpec(new TeaoliveSpec(description, test));
  }
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
Expection expect(var obj){
  return new _ExpectionImpl.expect(obj);
}

interface Expection<T> {
  Expection<T> get not();
  
  void toBe(T obj);

  void toEqual(T obj);

  void toBeNull();
}

void addTest(void testCase()){
  testCase();
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
TeaoliveSuite _currentSuite;

class TeaoliveTextReporter implements TeaoliveReporter {
  
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
  
  TeaoliveSuite _topLevelSuite;
  
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
    if(_topLevelSuite == null){
      _topLevelSuite = new TeaoliveSuite("top level", (){});
    }
    _topLevelSuite.addSpec(spec);
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
  }
}

class AssertionException implements Exception {
  String msg;
  
  AssertionException.msg(this.msg) : super() ;
}

typedef bool _op(StringBuffer buffer, bool result);

class _ExpectionImpl<T> implements Expection<T> {
  
  T expect;
  List<_op> opList;
  
  _ExpectionImpl.expect(T this.expect): opList = new List<_op>();

  _ExpectionImpl._expectWithOp(_ExpectionImpl expection, _op op): this.expect(expection.expect){
    opList.addAll(expection.opList);
    opList.add(op);
  }

  Function _createOp(){
  }
  
  _ExpectionImpl get not(){

    _op op = (buffer, result){
      buffer.add("not ");
      return !result;
    };
    return new _ExpectionImpl._expectWithOp(this, op);
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
