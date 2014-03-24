part of teaolive_test;

// DO NOT USE print FUNCTION!!
// We can't change the standard output stream in the current version of Dart.

void testCase() {
  describe("empty describe", () {});

  describe("save environment", () {
    it("save and restore", () {
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();

      // under new environment
      Sniffer sniffer = new Sniffer();
      setTeaoliveReporter(sniffer);

      addTest(() {
        describe("success describe", () {
          it("success it", () {});
        });
        describe("failure describe", () {
          it("failure it", () {
            expect(1).toBe(2);
          });
        });
        describe("ignore describe, (this describe be success)", () {
          xit("ignore it", () {});
          xdescribe("ignore describe", () {});
        });
      });

      teaoliveRun();

      // continue root testing...
      restoreTeaoliveEnvironment(env);

      // check result
      expect(sniffer.describe.success).toBe(2);
      expect(sniffer.describe.failure).toBe(1);
      expect(sniffer.describe.ignore).toBe(1);

      expect(sniffer.it.success).toBe(1);
      expect(sniffer.it.failure).toBe(1);
      expect(sniffer.it.ignore).toBe(1);
    });
  });

  describe("reporter", () {
    it("call addOnRunnerStart", () {
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();

      // under new environment
      InjectableReporter reporter = new InjectableReporter();
      String result;
      reporter.addOnRunnerStart(() => result = "ok");
      setTeaoliveReporter(reporter);

      addTest(() {
        describe("success describe", () {
          it("success it", () {});
        });
      });

      teaoliveRun();

      // continue root testing...
      restoreTeaoliveEnvironment(env);

      expect(result).toEqual("ok");
    });

    it("call onSuiteResult", () {
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();

      // under new environment
      InjectableReporter reporter = new InjectableReporter();
      StringBuffer buffer = new StringBuffer();
      reporter.addOnSuiteResult((TestPiece suite) => buffer.write("ok"));
      setTeaoliveReporter(reporter);

      addTest(() {
        describe("success describe1", () {
          it("success it", () {});
        });
        describe("success describe2", () {});
      });

      teaoliveRun();

      // continue root testing...
      restoreTeaoliveEnvironment(env);

      expect(buffer.toString()).toEqual("okok");
    });

    it("call onSpecResult", () {
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();

      // under new environment
      InjectableReporter reporter = new InjectableReporter();
      StringBuffer buffer = new StringBuffer();
      reporter.addOnSpecResult((TestPiece spec) => buffer.write("ok"));
      setTeaoliveReporter(reporter);

      addTest(() {
        describe("success describe1", () {
          it("success it", () {});
        });
        describe("success describe2", () {});
      });

      teaoliveRun();

      // continue root testing...
      restoreTeaoliveEnvironment(env);

      expect(buffer.toString()).toEqual("ok");
    });

    it("call onRunnerResult", () {
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();

      // under new environment
      InjectableReporter reporter = new InjectableReporter();
      StringBuffer buffer = new StringBuffer();
      reporter.addOnRunnerResult((TeaoliveRunner runner) => buffer.write("ok"));
      setTeaoliveReporter(reporter);

      addTest(() {
        describe("success describe", () {
          it("success it", () {});
        });
      });

      teaoliveRun();

      // continue root testing...
      restoreTeaoliveEnvironment(env);

      expect(buffer.toString()).toEqual("ok");
    });

    it("all", () {
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();

      // under new environment
      InjectableReporter reporter = new InjectableReporter();
      StringBuffer buffer = new StringBuffer();
      reporter.addOnRunnerStart(() => buffer.write("RunnerStart "));
      reporter.addOnSuiteResult((TestPiece suite) => buffer.write("Suite "));
      reporter.addOnSpecResult((TestPiece spec) => buffer.write("Spec "));
      reporter.addOnRunnerResult((TeaoliveRunner runner) => buffer.write("RunnerEnd"));
      setTeaoliveReporter(reporter);

      addTest(() {
        describe("success describe", () {
          it("success it", () {});
        });
      });

      teaoliveRun();

      // continue root testing...
      restoreTeaoliveEnvironment(env);

      expect(buffer.toString()).toEqual("RunnerStart Spec Suite RunnerEnd");
    });
  });

  describe("matchers", () {
    it("toBe matcher compare by ===", () {
      expect(1).toBe(1);
      expect(1).not.toBe(2);
      expect(1).not.toBe(null);

      expect("hoge").toBe("hoge"); // same object
      {
        StringBuffer buffer = new StringBuffer();
        buffer
            ..write("ho")
            ..write("ge");
        expect("hoge").not.toBe(buffer.toString()); // not same object
      }
    });

    it("toBeLessThan matcher compare by >", () {
      expect(1).toBeLessThan(2);
      expect(1).not.toBeLessThan(1);
      try {
        expect(null).toBeLessThan(1);
        fail("null can't define operator");
      } on AssertionException catch (e) {
      }
      try {
        expect(1).toBeLessThan(null);
        fail("null can't define operator");
      } on AssertionException catch (e) {
      }
    });

    it("toBeLessThanOrEqual matcher compare by >=", () {
      expect(1).toBeLessThanOrEqual(2);
      expect(1).toBeLessThanOrEqual(1);
      expect(1).not.toBeLessThanOrEqual(0);
      try {
        expect(null).toBeLessThanOrEqual(1);
        fail("null can't define operator");
      } on AssertionException catch (e) {
      }
      try {
        expect(1).toBeLessThanOrEqual(null);
        fail("null can't define operator");
      } on AssertionException catch (e) {
      }
    });

    it("toBeGreaterThan matcher compare by <", () {
      expect(2).toBeGreaterThan(1);
      expect(2).not.toBeGreaterThan(2);
      try {
        expect(null).toBeGreaterThan(1);
        fail("null can't define operator");
      } on AssertionException catch (e) {
      }
      try {
        expect(1).toBeGreaterThan(null);
        fail("null can't define operator");
      } on AssertionException catch (e) {
      }
    });

    it("toBeGreaterThanOrEqual matcher compare by <=", () {
      expect(2).toBeGreaterThanOrEqual(1);
      expect(2).toBeGreaterThanOrEqual(2);
      expect(0).not.toBeGreaterThanOrEqual(1);
      try {
        expect(null).toBeGreaterThanOrEqual(1);
        fail("null can't define operator");
      } on AssertionException catch (e) {
      }
      try {
        expect(1).toBeGreaterThanOrEqual(null);
        fail("null can't define operator");
      } on AssertionException catch (e) {
      }
    });

    it("toEqual matcher compare by ==", () {
      expect(1).toEqual(1);
      expect(1).not.toEqual(2);
      expect(1).not.toEqual(null);

      expect("hoge").toEqual("hoge");
      {
        StringBuffer buffer = new StringBuffer();
        buffer.write("ho");
        buffer.write("ge");
        expect("hoge").toEqual(buffer.toString());
      }
    });

    it("toBeTrue matcher compare to true", () {
      expect(true).toBeTrue();
      expect(false).not.toBeTrue();
      try {
        expect(null).toBeTrue();
        fail("null is not bool");
      } on AssertionException catch (e) {
      }
    });

    it("toBeFalse matcher compare to false", () {
      expect(false).toBeFalse();
      expect(true).not.toBeFalse();
      try {
        expect(null).toBeFalse();
        fail("null is not bool");
      } on AssertionException catch (e) {
      }
    });

    it("toBeNull matcher is check null", () {
      expect(1).not.toBeNull();
      expect(null).toBeNull();
      expect("hoge").not.toBeNull();
    });

    it("toThrow matcher is catch exceptions", () {
      Function raiseException = () {
        throw new UnsupportedError("for test");
      };
      expect(raiseException).toThrow();
      expect(raiseException).toThrow((var e) => e is UnsupportedError);
      expect(raiseException).not.toThrow((var e) => e is ArgumentError);
      try {
        expect(1).toThrow();
        fail("actual is not function");
      } on AssertionException catch (e) {
      }
      try {
        expect((var v) {}).toThrow((var e) => e is ArgumentError);
        fail("ClosureArgumentMismatchException");
      } on AssertionException catch (e) {
      }
    });

    it("custom matcher", () {
      // default, same toBe
      addMatcher(new Matcher());

      expect(2).to.Be(2);
      expect(2).not.to.Be(1);

      // testing to be 3
      Function tester = (var actual, var expected) => actual == 3;
      Function message = (String pre, var actual, var expected) {
        return "${pre}<${actual}> is not 3!!!";
      };
      addMatcher(new Matcher.create("Three", tester, message));

      expect(3).to.Three();
      expect(10).not.to.Three();

      // ok!
      addMatcher(new OkMatcher());

      expect("ok!").to.Ok();
      expect("ng...").not.to.Ok();
    });
  });

  describe("operator functions", () {
    it("beforeEach and afterEach", () {
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();

      // under new environment
      Sniffer sniffer = new Sniffer();
      setTeaoliveReporter(sniffer);

      StringBuffer builder = new StringBuffer();

      addTest(() {
        describe("beforeEach", () {
          beforeEach(() {
            builder.write("b1 ");
          });
          it("b1 m1 ", () {
            builder.write("m1 ");
          });
        });
        describe("afterEach", () {
          afterEach(() {
            builder.write("a2 ");
          });
          it("m2 a2 ", () {
            builder.write("m2 ");
          });
        });
        describe("beforeEach twice", () {
          beforeEach(() {
            builder.write("b3-1 ");
          });
          beforeEach(() {
            builder.write("b3-2 ");
          });
          it("b3-1 b3-2 m3 ", () {
            builder.write("m3 ");
          });
        });
        describe("afterEach twice", () {
          afterEach(() {
            builder.write("a4-1 ");
          });
          afterEach(() {
            builder.write("a4-2 ");
          });
          it("m4 a4-2 a4-1 ", () {
            builder.write("m4 ");
          });
        });
        describe("multi spec", () {
          beforeEach(() {
            builder.write("b5 ");
          });
          afterEach(() {
            builder.write("a5 ");
          });
          it("b5 m5-1 a5 ", () {
            builder.write("m5-1 ");
          });
          it("b5 m5-2 a5 ", () {
            builder.write("m5-2 ");
          });
        });
        describe("nested(outer)", () {
          beforeEach(() {
            builder.write("b6-o ");
          });
          afterEach(() {
            builder.write("a6-o ");
          });
          it("b6-o m6-o a6-o ", () {
            builder.write("m6-o ");
          });
          describe("nested(inner)", () {
            beforeEach(() {
              builder.write("b6-i ");
            });
            afterEach(() {
              builder.write("a6-i ");
            });
            it("b6-o b6-i m6-i a6-i a6-o ", () {
              builder.write("m6-i ");
            });
          });
        });
      });

      teaoliveRun();

      // continue root testing...
      restoreTeaoliveEnvironment(env);

      // check result
      expect(builder.toString()).toEqual("b1 m1 m2 a2 b3-1 b3-2 m3 m4 a4-2 a4-1 b5 m5-1 a5 b5 m5-2 a5 b6-o m6-o a6-o b6-o b6-i m6-i a6-i a6-o ");
    });
  });

  describe("capture exception", () {
    it("save stack trace", () {
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();

      // under new environment
      Sniffer sniffer = new Sniffer();
      setTeaoliveReporter(sniffer);

      addTest(() {
        describe("...", () {
          it("unknown exception", () {
            throw "unexpected error";
          });
          it("assertion error", () {
            expect(1).toBe(2);
          });
          it("success", () {
          });
        });
      });

      teaoliveRun();

      // continue root testing...
      restoreTeaoliveEnvironment(env);

      // check result
      expect(sniffer.runner.tests.length).toBe(1);
      expect(sniffer.runner.tests[0].tests.length).toBe(3);
      { // unknown exception
        TestPiece spec = sniffer.runner.tests[0].tests[0];
        expect(spec.result).toBe(false);
        expect(spec.error).not.toBeNull();
        expect(spec.errorMessage).toBeNull();
        expect(spec.trace).not.toBeNull();
      }
      { // assert error
        TestPiece spec = sniffer.runner.tests[0].tests[1];
        expect(spec.result).toBe(false);
        expect(spec.error).not.toBeNull();
        expect(spec.errorMessage).not.toBeNull();
        expect(spec.trace).not.toBeNull();
      }
      { // success
        TestPiece spec = sniffer.runner.tests[0].tests[2];
        expect(spec.result).toBe(true);
        expect(spec.error).toBeNull();
        expect(spec.errorMessage).toBeNull();
        expect(spec.trace).toBeNull();
      }
    });
  });

  describe("asynchronous specs", () {
    it("createGuardian", () {
      var completer = createGuardian();
      asyncResult(() {
        expect(1).toBe(1);
      });
      completer.complete();
    });

    it("use Future", () {
      Completer<dynamic> completer = new Completer();
      asyncWait(completer.future);
      asyncResult(() {
        expect(1).toBe(1);
      });
      completer.complete(null);
    });
  });
}

class OkMatcher extends Matcher {
  OkMatcher();

  String get name => "Ok";
  bool test(var actual, var expected) => actual == "ok!";
  String message(String pre, var actual, var expected) => "${pre}<${actual}> is not ok!";
}
