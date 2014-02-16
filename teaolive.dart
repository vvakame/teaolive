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

library teaolive;

import 'dart:coreimpl';

import 'reporter/tap_reporter.dart';

/** Task. Represent an action, such as testing and cleanup. */
typedef void Task();

/**
 * "describe".
 * If you want to start writing BDD test, start with this function.
 */
void describe(String description, Task test){
  _checkEnvironment();
  _environment.runner.add(new TestPiece.describe(description, test));
}

/**
 * If you do not want to use to [description] temporarily, you can use this function.
 */
void xdescribe(String description, Task test){
  _checkEnvironment();
  _environment.runner.add(new TestPiece.xdescribe(description, test));
}

/**
 * "it".
 * If you want to describe the behavior, start with this function.
 * usually, this method is under [describe] function.
 */
void it(String description, Task test){
  _checkEnvironment();
  assert(_environment.runner.currentRunning != null);
  _environment.runner.add(new TestPiece.it(description, test));
}

/**
 * If you do not want to use to [it] temporarily, you can use this function.
 */
void xit(String description, Task test){
  _checkEnvironment();
  assert(_environment.runner.currentRunning != null);
  assert(_environment.runner.currentRunning.isSuite());
  _environment.runner.add(new TestPiece.xit(description, test));
}

/**
 * If you want setup for testing before each [describe]s.
 */
void beforeEach(Task task){
  _checkEnvironment();
  assert(_environment.runner.currentRunning != null);
  _environment.runner.currentRunning.beforeEach.add(task);
}

/**
 * If you want clean up for testing after each [describe]s.
 */
void afterEach(Task task){
  _checkEnvironment();
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
 * add custom match.
 * e.g.
 * addMatcherFunction("Three", ([var a])=> (var e)=> a == 3);
 * expect(3).to.Three();
 */
void addMatcher(Matcher matcher){
  _checkEnvironment();
  _environment.addMatcher(matcher);
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

/**
 * fails the test.
 */
void fail([String description]){
  if(description !=null){
    throw new AssertionException.msg(description);
  } else {
    throw new AssertionException();
  }
}

/**
 * create guardian for async test.
 * this method is used with [Guardian] and [asyncResult].
 */
Guardian createGuardian(){
  assert(_environment.runner.currentRunning != null);
  Guardian completer = new Guardian();
  _environment.runner.currentRunning.guardians.add(completer.future);
  return completer;
}

/**
 * add a [Future] for async test.
 * this method is used with [asyncResult].
 */
asyncWait(Future future){
  assert(_environment.runner.currentRunning != null);
  _environment.runner.currentRunning.guardians.add(future);
}

/**
 * [Task] exec after all Future is completed.
 */
void asyncResult(Task task){
  _environment.runner.currentRunning.asyncResults.add(task);
}

/**
 * The interface for the [expect]. methods that exist in this interface are available.
 */
abstract class Expectation<T> {
  Expectation<T> get not;

  void toBe(T obj);

  void toEqual(T obj);

  void toBeLessThan(T obj);

  void toBeLessThanOrEqual(T obj);

  void toBeGreaterThan(T obj);

  void toBeGreaterThanOrEqual(T obj);

  void toBeTrue();

  void toBeFalse();

  void toBeNull();

  void toThrow([bool judge(var e)]);

  dynamic get to;
}

/**
 * guardian for async test.
 * this is wrapper of [Completer].
 */
class Guardian extends CompleterImpl {
  void arrival(){
    if(future.isComplete == false){
      complete(null);
    }
  }
}

/**
 * start testing.
 * [describe] and [it] functions were already call?
 */
void teaoliveRun() {
  _checkEnvironment();
  _environment.run();
}

/**
 * set [TeaoliveReporter].
 * the default is to use the [TeaoliveTapReporter] class.
 * It's use a [print] function.
 */
void setTeaoliveReporter(TeaoliveReporter reporter) {
  _checkEnvironment();
  _environment.reporter = reporter;
}

/**
 * this class takes the test results and convert it to a human-readable format.
 * and more. if reporter output the [TAP](http://en.wikipedia.org/wiki/Test_Anything_Protocol) format. Dart can be a CI friendly.
 */
abstract class TeaoliveReporter {

  factory TeaoliveReporter() = TeaoliveTapReporter;

  /** this method called when start test running. */
  void onRunnerStart();

  /** this method called when finish test running. */
  void onRunnerResult(TeaoliveRunner runner);

  /** this method called when finish one of [describe]. */
  void onSuiteResult(TestPiece piece);

  /** this method called when finish one of [it]. */
  void onSpecResult(TestPiece piece);
}

/**
 * get [TeaoliveEnvironment].
 * this function is use for self testing about Teaolive.
 */
TeaoliveEnvironment getCurrentTeaoliveEnvironment() => _environment;

/**
 * restore [TeaoliveEnvironment].
 * this function is use for self testing about Teaolive.
 */
void restoreTeaoliveEnvironment(TeaoliveEnvironment environment){
  _environment = environment;
}

/**
 * re-initialize [TeaoliveEnvironment].
 * this function is use for self testing about Teaolive.
 */
void resetTeoliveEnvironment(){
  _environment = null;
}

// implementation from here.

TeaoliveEnvironment _environment;

void _checkEnvironment() {
  if(_environment == null){
    _environment = new TeaoliveEnvironment();
  }
}

class TeaoliveEnvironment {
  TeaoliveReporter reporter;
  final TeaoliveRunner runner;

  Map<String, Matcher> matchers;

  TeaoliveEnvironment():
    runner = new TeaoliveRunner(),
    reporter = new TeaoliveReporter(),
    matchers = new Map();

  void run() {
    runner.run();
  }

  void addMatcher(Matcher matcher){
    matchers[matcher.name] = matcher;
  }
}

class TeaoliveRunner extends TestPiece {

  TestPiece currentRunning;

  TeaoliveRunner(): super._runner(){
    currentRunning = this;
  }

  void run([Task nextTask]){
    if(nextTask == null){
      nextTask = (){
        _environment.reporter.onRunnerResult(this);
      };
    }
    _environment.reporter.onRunnerStart();
    super.run(nextTask);
  }

  void add(TestPiece piece){
    assert(piece != null);
    piece.parent = _findAncestorSuite(currentRunning);
    piece.parent.tests.add(piece);
  }

  TestPiece _findAncestorSuite(TestPiece current){
    if(current == null){
      return null;
    } else if(current.isRunner() || current.isSuite()){
      return current;
    } else {
      return _findAncestorSuite(current.parent);
    }
  }
}

class TestPiece {
  TestPiece parent;
  String description;
  Task _test;
  List<TestPiece> tests;
  List<Task> beforeEach;
  List<Task> afterEach;

  bool _runner = false;
  bool _describe = false;
  bool ignore = false;

  Stopwatch _stopwatch;
  int microseconds = null;
  bool result = false;
  bool start = false;
  bool finish = false;

  List<Future> guardians;
  List<Task> asyncResults;

  dynamic error;
  String errorMessage;
  dynamic trace;

  TestPiece._runner(): _runner = true {
    this.description = "testing root";
    this._test = (){};
    _init();
  }

  TestPiece.describe(this.description, this._test, [this.parent = null]): _describe = true {
   _init();
  }
  TestPiece.it(this.description, this._test, [this.parent = null]) {
    _init();
  }

  TestPiece.xdescribe(this.description, this._test, [this.parent = null]):
    _describe = true,
    ignore = true {
    _init();
  }
  TestPiece.xit(this.description, this._test, [this.parent = null]):
    _describe = false,
    ignore = true {
    _init();
  }

  void _init(){
    tests = new List<TestPiece>();
    beforeEach = new List<Task>();
    afterEach = new List<Task>();
    guardians = new List<Future>();
    asyncResults = new List<Task>();
  }

  bool isRunner() => _runner;
  bool isSuite() => !_runner && _describe;
  bool isSpec() => !_runner && !_describe;

  void run([final Task nextTask]){
    if(ignore){
      start = true;
      finish = true;
      nextTask();
      return;
    }

    _stopwatch = new Stopwatch.start();

    TeaoliveRunner runner = _environment.runner;
    TestPiece restore = runner.currentRunning;
    runner.currentRunning = this;

    start = true;

    new Chain().trapException((var e, var _trace){
      if(e is AssertionException){
        errorMessage = e.msg;
      }
      this.error = e;
      this.trace = _trace;
      this.result = false;
      this.finish = true;
    })
    .chain((Task next){
      if(isSpec()){
        _collectBeforeTask().forEach((Task task) => task());
      }

      _test();

      Future.wait(guardians).then((var v){
        asyncResults.forEach((Task task) => task());
        next();
      });
    })
    .finish((){
      if(isSpec()){
        _collectAfterTask().forEach((Task task) => task());
      }
    })
    .finish((){
      _run((){
        microseconds = _stopwatch.elapsedMicroseconds;
        _stopwatch.stop();
        _stopwatch = null;

        if(isSuite()){
          _environment.reporter.onSuiteResult(this);
        } else if(isSpec()){
          _environment.reporter.onSpecResult(this);
        }

        runner.currentRunning = restore;
        nextTask();
      });
    })
    .run();
  }

  void _run(final Task nextTask){
    for(TestPiece piece in tests){
      if(piece.start || piece.finish){
        continue;
      }
      piece.run((){
        _run(nextTask);
      });
      return;
    }
    _run_finish(nextTask);
  }

  void _run_finish(Task nextTask){
    finish = true;
    if(error == null){
      result = true;
    }

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

    nextTask();
  }

  void add(TestPiece piece){
    assert(piece != null);
    if(isRunner() || isSuite()){
      tests.add(piece);
    } else {
      assert(parent != null);
      parent.add(piece);
    }
  }

  List<Task> _collectBeforeTask([TestPiece piece, List<Task> tasks]){
    if(parent == null){
      return new List<Task>();
    }
    if(piece == null){
      piece = parent;
    }
    if(tasks == null){
      tasks = new List<Task>();
    }
    if(piece.parent != null){
      _collectBeforeTask(piece.parent, tasks);
    }
    tasks.addAll(piece.beforeEach);
    return tasks;
  }

  List<Task> _collectAfterTask([TestPiece piece, List<Task> tasks]){
    if(parent == null){
      return new List<Task>();
    }
    if(piece == null){
      piece = parent;
    }
    if(tasks == null){
      tasks = new List<Task>();
    }
    _collectAfterTask_collect(piece, tasks);

    List<Task> reverse = new List<Task>();
    while(tasks.length != 0){
      Task task = tasks.removeLast();
      reverse.add(task);
    }

    return reverse;
  }

  void _collectAfterTask_collect(TestPiece piece, [List<Task> tasks]){
    if(piece.parent != null){
      _collectAfterTask_collect(piece.parent, tasks);
    }
    tasks.addAll(piece.afterEach);
  }
}

class Chain {
  Function _handler;
  List<Function> _tasks;
  List<Function> _finalizer;

  Chain(): _tasks = new List<Function>(), _finalizer = new List<Function>();

  Chain chain(void task(Task next)){
    _tasks.add(task);
    return this;
  }

  Chain finish(void task()){
    _finalizer.add(task);
    return this;
  }

  Chain trapException(void handler(var e, var trace)){
    _handler = handler;
    return this;
  }

  void run(){
    if(_tasks.length != 0){
      try {
        Function task = _tasks[0];
        _tasks.removeRange(0, 1);
        task((){
          run();
        });
      } catch(var e, var trace){
        if(_handler != null){
          _handler(e, trace);
        }
        _finish();
      }
    } else {
      _finish();
    }
  }

  void _finish(){
    if(_finalizer.length != 0){
      try {
        Function task = _finalizer[0];
        _finalizer.removeRange(0, 1);
        task();
      } catch(var e, var trace){
        // is it ok...?
      } finally {
        _finish();
      }
    }
  }
}

class AssertionException implements Exception {
  final String msg;

  AssertionException(): super(), msg = "";
  AssertionException.msg(this.msg) : super();
}

class Matcher {

  final String name;
  Function _tester;
  Function _consMessage;

  var _expect;
  var _actual;

  Matcher(): name = "Be" {
    _tester = (var expected, var actual) => expected == actual;
    _consMessage = (String pre, var actual, var expected) => "expected is ${pre}<${expected}>, but got <${actual}>.";
  }

  Matcher.create(this.name, bool tester(var actual, var expected), String consMessage(String pre, var actual, var expected)) {
    _tester = tester;
    _consMessage = consMessage;
  }

  bool test(var actual, var expected){
    _expect = expected;
    _actual = actual;
    return _tester(actual, expected);
  }

  String message(String pre, var actual, var expected) => _consMessage(pre, actual, expected);
}

typedef bool _op(StringBuffer buffer, bool result);
class _ExpectationImpl<T> implements Expectation<T> {

  T _actual;

  List<_op> _opList;

  _ExpectationImpl.actual(T this._actual): _opList = new List<_op>();

  _ExpectationImpl._actualWithOp(_ExpectationImpl expectation, _op op): _opList = new List<_op>(){
    _actual = expectation._actual;
    _opList.addAll(expectation._opList);
    _opList.add(op);
  }

  Function _createOp(){
  }

  _ExpectationImpl get not{

    _op op = (buffer, result){
      buffer.add("not ");
      return !result;
    };
    return new _ExpectationImpl._actualWithOp(this, op);
  }

  void toBe(T _expect){
    if(_opBool(identical(_expect, _actual)) == false){
      throw new AssertionException.msg("expected is ${_opPrefix()}<${_expect}>, but got <${_actual}>.");
    }
  }

  void toBeLessThan(T _expect){
    _checkNull(_expect, _actual);
    if(_opBool(_expect.dynamic > _actual.dynamic) == false){
      throw new AssertionException.msg("don't expect the result, ${_opPrefix()}<${_expect}> > <${_actual}>");
    }
  }

  void toBeLessThanOrEqual(T _expect){
    _checkNull(_expect, _actual);
    if(_opBool(_expect.dynamic >= _actual.dynamic) == false){
      throw new AssertionException.msg("don't expect the result, ${_opPrefix()}<${_expect}> >= <${_actual}>");
    }
  }

  void toBeGreaterThan(T _expect){
    _checkNull(_expect, _actual);
    if(_opBool(_expect.dynamic < _actual.dynamic) == false){
      throw new AssertionException.msg("don't expect the result, ${_opPrefix()}<${_expect}> < <${_actual}>");
    }
  }

  void toBeGreaterThanOrEqual(T _expect){
    _checkNull(_expect, _actual);
    if(_opBool(_expect.dynamic <= _actual.dynamic) == false){
      throw new AssertionException.msg("don't expect the result, ${_opPrefix()}<${_expect}> <= <${_actual}>");
    }
  }

  void toEqual(T _expect){
    if(_opBool(_expect.dynamic == _actual.dynamic) == false){
      throw new AssertionException.msg("expected is ${_opPrefix()}<${_expect}>, but got <${_actual}>.");
    }
  }

  void toBeTrue(){
    _checkBool(_actual);
    toBe(true.dynamic);
  }

  void toBeFalse(){
    _checkBool(_actual);
    toBe(false.dynamic);
  }

  void toBeNull(){
    if(_opBool(null == _actual.dynamic) == false){
      throw new AssertionException.msg("expected is ${_opPrefix()} null, but got <${_actual}>.");
    }
  }

  void toThrow([bool judge(var e)]){
    _checkFunction(_actual);
    try{
      Function func = _actual.dynamic;
      func();
      fail("function not raise a exception");
    } on ClosureArgumentMismatchException catch(e){
      throw new AssertionException.msg("actual function is argument mismatch. please use the 'void actual()'");
    } catch(var e, var trace){
      if(judge != null && _opBool(judge(e)) == false){
        throw new AssertionException.msg("don't expect the result, ${_opPrefix()}throw <${e}>");
      }
    }
  }

  dynamic get to => dynamic;

  dynamic noSuchMethod(String name, List args) {
    final Matcher matcher = _environment.matchers[name];
    if(matcher == null){
      throw new NoSuchMethodException(this, name, args);
    }

    var expected = args.length != 0 ? args[0] : null;
    bool result = matcher.test(_actual, expected);
    if(_opBool(result) == false){
      throw new AssertionException.msg(matcher.message(_opPrefix(), _actual, expected));
    }
  }

  String _opPrefix(){
    StringBuffer buffer = new StringBuffer();
    for(_op op in _opList){
      op(buffer, true);
    }
    return buffer.toString();
  }

  bool _opBool(bool result){
    StringBuffer buffer = new StringBuffer();
    for(_op op in _opList){
      result = op(buffer, result);
    }
    return result;
  }

  void _checkNull(T _expect, T __actual){
    if(_expect == null){
      throw new AssertionException.msg("expect value is null");
    } else if(__actual == null) {
      throw new AssertionException.msg("actual value is null");
    }
  }

  void _checkBool(T actual){
    if(actual is bool == false){
      throw new AssertionException.msg("actual<${actual}> is not bool");
    }
  }

  void _checkFunction(T actual){
    if(actual is Function == false){
      throw new AssertionException.msg("actual<${actual}> is not Function");
    }
  }
}
