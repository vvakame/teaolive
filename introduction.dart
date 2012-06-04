// # Teaolive
//
// Teaolive is a Behavior Driven Development testing framework for Dart.<br>
// It does not rely on browser. Thus it's suited for Server Application or Web Application. I like [Jasmine](http://pivotal.github.com/jasmine/) Test Framework.<br>
// It's really cool product when use with CoffeeScript.
#library('teaolive_introduction');

// import html library.
// this introduction is an assumption run on Browser.
#import('dart:html');

// import main library.
#import('packages/teaolive/teaolive.dart');

// import reporter combinator library.
// this introduction uses TAP reporter and HTML reporter both.
#import('packages/teaolive/reporter/reporter_combinator.dart', prefix: 'combinator');
// import [TAP](http://en.wikipedia.org/wiki/Test_Anything_Protocol) format reporter.
// this reporter output to standard output by `print`.
#import('packages/teaolive/reporter/tap_reporter.dart', prefix: 'tap');
// import HTML format reporter. this reporter construct DOM parts.
// Scroll down the page to see the results of the above specs. All of the specs should pass.
#import('packages/teaolive/reporter/html_reporter.dart', prefix: 'html');

// ## The Runner and Reporter
//
// This file is written in Dart and is compiled into HTML via [Rocco](https://github.com/rtomayko/rocco/). The Dart file is then included, via a `<script>` tag, so that all of the above specs are evaluated and recorded with Teaolive. Thus can run all of these specs. This page is then considered a 'runner'.
//
// Meanwhile, here is how a runner works to execute a  suite.
void main() {
  // ### Add report function.
  //
  // Teaolive can include test case from other file. If you want.
  addTest(testCase);
  
  // ### Setup Reporters.
  //
  // Create the `TeaoliveHtmlReporter` and `TeaoliveTapReporter`, which calls to provide results of each spec and each suite. The Reporter is responsible for presenting results to the user.
  // this instroduction is setup about [TAP](http://en.wikipedia.org/wiki/Test_Anything_Protocol) format reporter and HTML format reporter.
  setTeaoliveReporter(
    new combinator.TeaoliveReporterCombinator(
      [
        new html.TeaoliveHtmlReporter(),
        new tap.TeaoliveTapReporter()
      ]
    ));

  // ### Test Results
  //
  // Start test runner and collecting results.
  // Scroll down to see the results of all of these specs.
  teaoliveRun();
}

void testCase() {
  // ## Suites: `describe` Your Tests
  //
  // A test suite begins with a call to the global function `describe` with two parameters: a string and a function. The string is a name or title for a spec suite - usually what is under test. The function is a block of code that implements the suite.
  //
  // ## Specs
  //
  // Specs are defined by calling the global function `it`, which, like `describe` takes a string and a function. The string is a title for this spec and the function is the spec, or test. A spec contains one or more expectations that test the state of the code under test.
  //
  // An expectation in is an assertion that can be either true or false. A spec with all true expectations is a passing spec. A spec with one or more expectations that evaluate to false is a failing spec.
  describe("A suite", (){
    it("contains spec with an expectation", (){
      expect(true).toBe(true);
    });
  });
  
  // ### It's Just Functions
  //
  // Since `describe` and `it` blocks are functions, they can contain any executable code necessary to implement the test. JavaScript scoping rules apply, so variables declared in a `describe` are available to any `it` block inside the suite.
  describe("A suite is just a function", () {
    bool a;
    it("and so is a spec", () {
      a = true;
      expect(a).toBe(true);
    });
  });
  
  // ## Expectations
  //
  // Expectations are built with the function `expect` which takes a value, called the actual. It is chained with a Matcher function, which takes the expected value.
  describe("The 'toBe' matcher compares with ===", () {
    // ### Matchers
    //
    // Each matcher implements a boolean comparison between the actual value and the expected value. It is responsible for reporting to  if the expectation is true or false.  will then pass or fail the spec.
    it("and has a positive case ", () {
      expect(true).toBe(true);
    });

    // Any matcher can evaluate to a negative assertion by chaining the call to `expect` with a `not` before calling the matcher.
    it("and can have a negative case", () {
      expect(false).not.toBe(true);
    });
  });

  // ### Included Matchers
  //
  //  as a rich set of matchers included. Each is used here - all expectations and specs pass.
  //
  // There is also the ability to write custom matchers for when a project's domain calls for specific assertions that are not included below.
  describe("Included matchers:", () {

    it("The 'toBe' matcher compares with ===", () {
      int a = 12;
      int b = a;

      expect(a).toBe(b);
      expect(a).not.toBe(null);
    });

    describe("The 'toEqual' matcher", () {

      it("works for simple literals and variables", () {
        int a = 12;
        expect(a).toEqual(12);
      });

      it("should work for objects", () {
        String a = "foo";
        StringBuffer b = new StringBuffer();
        b.add("foo");
        
        expect(b.toString()).toEqual(a);
      });
    });

    it("The 'toBeNull' matcher compares against null", () {
      var a = null;
      String foo = 'foo';

      expect(null).toBeNull();
      expect(a).toBeNull();
      expect(foo).not.toBeNull();
    });

    it("The 'toBeLessThan' matcher is for mathematical comparisons", () {
      var pi = 3.1415926, e = 2.78;

      expect(e).toBeLessThan(pi);
      expect(pi).not.toBeLessThan(e);
    });

    it("The 'toBeLessThanOrEqual' matcher is for mathematical comparisons", () {
      var pi = 3.1415926, e = 2.78;

      expect(e).toBeLessThanOrEqual(e);
      expect(pi).not.toBeLessThanOrEqual(e);
    });

    it("The 'toBeGreaterThan' is for mathematical comparisons", () {
      num pi = 3.1415926;
      num e = 2.78;

      expect(pi).toBeGreaterThan(e);
      expect(e).not.toBeGreaterThan(pi);
    });

    it("The 'toBeGreaterThanOrEqual' matcher is for mathematical comparisons", () {
      var pi = 3.1415926, e = 2.78;

      expect(pi).toBeGreaterThanOrEqual(e);
      expect(e).not.toBeGreaterThanOrEqual(pi);
    });

    it("The 'toBeTrue' matcher compares to true", () {
      expect(1 + 1 == 2).toBeTrue();
      expect(1 + 1 == 3).not.toBeTrue();
    });

    it("The 'toBeFalse' matcher compares to false", () {
      expect(1 * 1 == 2).toBeFalse();
      expect(1 * 1 == 1).not.toBeFalse();
    });

    it("The 'toThrow' matcher is for testing if a function throws an exception", () {
      Function foo = () {
        return 1 + 2;
      };
      Function bar = () {
        return null + 1;
      };

      expect(foo).not.toThrow();
      expect(bar).toThrow();
      
      Function raiseException = (){
        throw new UnsupportedOperationException("for test");
      };
      expect(raiseException).toThrow((var e) => e is UnsupportedOperationException);
    });
    
    it("The custom matcher provides a test that you define", (){
      Function tester = (var actual, var expected) => actual == 3;
      Function message = (String pre, var actual, var expected){
        return "${pre}<${actual}> is not 3!!!";
      };
      addMatcher(new Matcher.create("Three", tester, message));

      expect(3).to.Three();
      expect(10).not.to.Three();
    });
  });
  
  // ## Grouping Related Specs with `describe`
  //
  // The `describe` function is for grouping related specs. The string parameter is for naming the collection of specs, and will be contatenated with specs to make a spec's full name. This aids in finding specs in a large suite. If you name them well, your specs read as full sentences in traditional BDD style.
  describe("A spec", function() {
    it("is just a function, so it can contain any code", () {
      int foo = 0;
      foo += 1;
 
      expect(foo).toEqual(1);
    });

    it("can have more than one expectation", () {
      int foo = 0;
      foo += 1;

      expect(foo).toEqual(1);
      expect(true).toEqual(true);
    });
  });

  // ### Setup and Teardown
  //
  // To help a test suite DRY up any duplicated setup and teardown code,  provides the global `beforeEach` and `afterEach` functions. As the name implies the `beforeEach` function is called once before each spec in the `describe` is run and the `afterEach` function is called once after each spec.
  //
  // Here is the same set of specs written a little differently. The variable under test is defined at the top-level scope -- the `describe` block --  and initialization code is moved into a `beforeEach` function. The `afterEach` function resets the variable before continuing.
  describe("A spec (with setup and tear-down)", () {
    int foo;

    beforeEach(() {
      foo = 0;
      foo += 1;
    });

    afterEach(() {
      foo = 0;
    });

    it("is just a function, so it can contain any code", () {
      expect(foo).toEqual(1);
    });

    it("can have more than one expectation", () {
      expect(foo).toEqual(1);
      expect(true).toEqual(true);
    });
  });

  // ### Nesting `describe` Blocks
  //
  // Calls to `describe` can be nested, with specs defined at any level. This allows a suite to be composed as a tree of functions. Before a spec is executed,  walks down the tree executing each `beforeEach` function in order. After the spec is executed,  walks through the `afterEach` functions similarly.
  describe("A spec", () {
    int foo;

    beforeEach(() {
      foo = 0;
      foo += 1;
    });

    afterEach(() {
      foo = 0;
    });

    it("is just a function, so it can contain any code", () {
      expect(foo).toEqual(1);
    });

    it("can have more than one expectation", () {
      expect(foo).toEqual(1);
      expect(true).toEqual(true);
    });

    describe("nested inside a second describe", () {
      int bar;

      beforeEach(() {
        bar = 1;
      });

      it("can reference both scopes as needed ", () {
        expect(foo).toEqual(bar);
      });
    });
  });

  // ## Disabling Specs and Suites
  //
  // Suites and specs can be disabled with the `xdescribe` and `xit` functions, respectively. These suites and specs are skipped when run and thus their results will not appear in the results.
  xdescribe("A spec", () {
    int foo;

    beforeEach(() {
      foo = 0;
      foo += 1;
    });

    xit("is just a function, so it can contain any code", () {
      expect(foo).toEqual(1);
    });
  });
  
  // ## Asynchronous Support
  //
  // Teaolive also has support for running specs that require testing asynchronous operations.
  describe("Asynchronous specs", function() {

    it("should support async execution of test preparation and exepectations", () {

      // Specs are written by guardian and asyncResult. you should make a guardian before start async process. you must call `arrival` when finish async process.
      // If you have a `Future`, call `asyncWait` with it.
      Guardian guardian = createGuardian();
      
      bool flag = false;

      window.setTimeout(() {
        flag = true;
        guardian.arrival();
      }, 500);

      // usually. process blocked by guardian or Future. It is an opportunity to restart when completed or arrival.
      asyncResult((){
        expect(flag).toBeTrue();
      });
    });
  });
}

// ## More documents
//
// * [docs](./docs/index.html)
//
// ## Downloads
//
// * strong recommended use [Pub](http://www.dartlang.org/docs/pub-package-manager/). [for example](https://github.com/vvakame/teaolive/blob/gh-pages/pubspec)
// * to clone using git, copy and paste as primitive man
//
// ## Support
//
// * [Report Issues](https://github.com/vvakame/teaolive/issues) at Github
// * Follow [@vvakame](http://twitter.com/vvakame) on Twitter
// * Mailing list is not avairable. Should I make? :)
//
// ## Thanks
//
// Teaolive inspired by [Jasmine](http://pivotal.github.com/jasmine/) and Google Dart dev team.
