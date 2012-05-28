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

#import('reporter/teaolive_text_reporter.dart');

/** Task. Represent an action, such as testing and cleanup. */
typedef void Task();

/**
 * "describe".
 * If you want to start writing BDD test, start with this function.
 */
void describe(String description, Task test){
  checkEnvironment();
  _environment.runner.add(new TestPiece.describe(description, test));
}

/**
 * If you do not want to use to "description" temporarily, you can use this function.
 */
void xdescribe(String description, Task test){
  checkEnvironment();
  _environment.runner.add(new TestPiece.xdescribe(description, test));
}

/**
 * "it".
 * If you want to describe the behavior, start with this function.
 * usually, this method is under "describe" function.
 */
void it(String description, Task test){
  checkEnvironment();
  _environment.runner.add(new TestPiece.it(description, test));
}

/**
 * If you do not want to use to "it" temporarily, you can use this function.
 */
void xit(String description, Task test){
  checkEnvironment();
  _environment.runner.add(new TestPiece.xit(description, test));
}

/**
 * If you want setup for testing before each "describe"s.
 */
void beforeEach(Task task){
  checkEnvironment();
  assert(_environment.runner.currentRunning != null);
  _environment.runner.currentRunning.beforeEach.add(task);
}

/**
 * If you want clean up for testing after each "describe"s.
 */
void afterEach(Task task){
  checkEnvironment();
  assert(_environment.runner.currentRunning != null);
  _environment.runner.currentRunning.afterEach.add(task);
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
Expectation expect(var actual){
  return new _ExpectationImpl.actual(actual);
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
  checkEnvironment();
  _environment.run();
}

/**
 * set TeaoliveReporter.
 * the default is to use the TeaoliveTextReporter class.
 * It's use a "print" function.
 */
void setTeaoliveReporter(TeaoliveReporter reporter) {
  checkEnvironment();
  _environment.reporter = reporter;
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
  void onSuiteResult(TestPiece piece);

  /** this method called when finish one of "it". */
  void onSpecResult(TestPiece piece);
}

/**
 * get TeaoliveEnvironment.
 * this function is use for self testing about Teaolive.
 */
TeaoliveEnvironment getCurrentTeaoliveEnvironment() => _environment;

/**
 * restore TeaoliveEnvironment.
 * this function is use for self testing about Teaolive.
 */
void restoreTeaoliveEnvironment(TeaoliveEnvironment environment){
  _environment = environment;
}

/**
 * re-initialize TeaoliveEnvironment.
 * this function is use for self testing about Teaolive.
 */
void resetTeoliveEnvironment(){
  _environment = null;
}

// implementation from here.

TeaoliveEnvironment _environment;

void checkEnvironment() {
  if(_environment == null){
    _environment = new TeaoliveEnvironment();
  }
}

class TeaoliveEnvironment {
  TeaoliveReporter _reporter;
  TeaoliveRunner _runner;
  
  TeaoliveEnvironment(): _runner = new TeaoliveRunner(), _reporter = new TeaoliveReporter();
  
  void run() {
    _runner.run();
  }
  
  void set reporter(TeaoliveReporter reporter) {
    assert(reporter != null);
    _reporter = reporter;
  }
  
  TeaoliveReporter get reporter() => _reporter;
  
  TeaoliveRunner get runner() => _runner;
}

class TeaoliveRunner {
  
  List<TestPiece> tests;

  TestPiece _currentRunning;

  TeaoliveRunner(): tests = new List<TestPiece>();
  
  void run(){
    _environment.reporter.onRunnerStart();
    
    for(TestPiece piece in tests){
      piece.run();
    }
    
    _environment.reporter.onRunnerResult(this);
  }

  void add(TestPiece piece){
    assert(piece != null);
    piece.parent = _findAncestorSuite(_currentRunning);
    if(piece.parent != null){
      piece.parent.add(piece);
    } else {
      tests.add(piece);
    }
  }
  
  TestPiece _findAncestorSuite(TestPiece current){
    if(current == null){
      return null;
    } else if(current.isSuite()){
      return current;
    } else {
      return _findAncestorSuite(current.parent);
    }
  }
  
  void set currentRunning(TestPiece currentRunning){
    _currentRunning = currentRunning;
  }
  
  TestPiece get currentRunning() => _currentRunning;
}

class TestPiece {
  TestPiece parent;
  String description;
  Task _test;
  List<TestPiece> tests;
  List<Task> beforeEach;
  List<Task> afterEach;

  bool _describe;
  bool ignore;

  bool result = false;
  bool start = false;
  bool finish = false;

  String errorMessage;
  var error;
  
  TestPiece.describe(this.description, this._test, [this.parent = null]): _describe = true, ignore = false, tests = new List<TestPiece>(), beforeEach = new List<Task>(), afterEach = new List<Task>();
  TestPiece.it(this.description, this._test, [this.parent = null]): _describe = false, ignore = false, tests = new List<TestPiece>(), beforeEach = new List<Task>(), afterEach = new List<Task>();

  TestPiece.xdescribe(this.description, this._test, [this.parent = null]): _describe = true, ignore = true, tests = new List<TestPiece>(), beforeEach = new List<Task>(), afterEach = new List<Task>();
  TestPiece.xit(this.description, this._test, [this.parent = null]): _describe = false, ignore = true, tests = new List<TestPiece>(), beforeEach = new List<Task>(), afterEach = new List<Task>();

  bool isSuite() => _describe;
  bool isSpec() => !_describe;
  
  void run(){
    TeaoliveRunner runner = _environment.runner;
    TestPiece pre = runner.currentRunning;
    runner.currentRunning = this;
    try{
      start = true;
      if(ignore){
        finish = true;
        return;
      }
      _test();
      for(TestPiece piece in tests){
        for(Task beforeTask in beforeEach){
          beforeTask();
        }
        piece.run();
        for(Task afterTask in afterEach){
          afterTask();
        }
      }
      finish = true;
      result = true;

      List<TestPiece> fullset = new List<TestPiece>();
      fullset.add(this);
      fullset.addAll(tests);
      for(TestPiece piece in fullset){
        if(piece.start && piece.finish && piece.result){
          continue;
        } else if(piece.ignore){
          continue;
        }
        result = false;
      }
    } catch(AssertionException e) {
      errorMessage = e.msg;
      error = e;
      return;
    } catch(var e) {
      error = e;
      return;
    } finally {
      runner.currentRunning = pre;
      finish = true;
    }
  }
  
  void add(TestPiece piece){
    assert(piece != null);
    if(isSuite()){
      tests.add(piece);
    } else {
      assert(parent != null);
      parent.add(piece);
    }
  }
  
  List<Task> _collectBeforeTask(TestPiece piece, [List<Task> tasks = new List<Task>()]){
    if(piece.parent != null){
      _collectBeforeTask(piece.parent, tasks);
    }
    tasks.addAll(piece.beforeEach);
    return tasks;
  }

  List<Task> _collectAfterTask(TestPiece piece, [List<Task> tasks = new List<Task>()]){
    if(piece.parent != null){
      _collectAfterTask(piece.parent, tasks);
    }
    tasks.addAll(piece.afterEach);
    List<Task> reverse = new List<Task>();
    while(tasks.length != 0){
      Task task = tasks.removeLast();
      reverse.add(task);
    }
    return tasks;
  }
}

class AssertionException implements Exception {
  String msg;
  
  AssertionException.msg(this.msg) : super();
}

typedef bool _op(StringBuffer buffer, bool result);
class _ExpectationImpl<T> implements Expectation<T> {
  
  T _actual;
  List<_op> _opList;
  
  _ExpectationImpl.actual(T this._actual): _opList = new List<_op>();

  _ExpectationImpl._actualWithOp(_ExpectationImpl expectation, _op op): this.actual(expectation._actual){
    _opList.addAll(expectation._opList);
    _opList.add(op);
  }

  Function _createOp(){
  }
  
  _ExpectationImpl get not(){

    _op op = (buffer, result){
      buffer.add("not ");
      return !result;
    };
    return new _ExpectationImpl._actualWithOp(this, op);
  }
  
  void toBe(T _expect){
    _check(_expect === _actual, _expect);
  }

  void toBeNull(){
    _check(_actual == null);
  }

  void toEqual(T _expect){
    _check(_expect == _actual, _expect);
  }

  void _check(bool result, [T _expect = null]){
    StringBuffer buffer = new StringBuffer();
    for(_op op in _opList){
      result = op(buffer, result);
    }

    if(result == false){
      throw new AssertionException.msg("expected is ${buffer.toString()}<${_expect}>, but got <${_actual}>.");
    }
  }
}
