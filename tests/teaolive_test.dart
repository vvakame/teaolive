#library('teaolive_test');

#import('helper/test_util.dart');

#import('../teaolive.dart');
#import('../reporter/teaolive_junit_xml_reporter.dart');

// DO NOT USE print FUNCTION!!
// We can't change the standard output stream in the current version of Dart.

void main(){
    
  addTest(testCase);

  setTeaoliveReporter(new TeaoliveJUnitXMLReporter());
  teaoliveRun();
}

void testCase(){
  describe("save environment", (){
    it("save and restore", (){
      TeaoliveEnvironment env = getCurrentTeaoliveEnvironment();
      resetTeoliveEnvironment();
      
      // under new environment
      Sniffer sniffer = new Sniffer();
      setTeaoliveReporter(sniffer);

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
      expect(sniffer.describe.success).toBe(2);
      expect(sniffer.describe.failure).toBe(1);
      expect(sniffer.describe.ignore).toBe(1);

      expect(sniffer.it.success).toBe(1);
      expect(sniffer.it.failure).toBe(1);
      expect(sniffer.it.ignore).toBe(1);
    });
  });
}
