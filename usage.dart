#library('teaolive-usage');

#import('./teaolive.dart');
#import('./teaolive_html_reporter.dart'); // if you want to run from command-line. remove this line.

void main(){

  describe("Tea olive", (){
    
    it("makes testing Dart is awesome!", (){
      expect(1).toBe(1);
    });
  
    it("failure...", (){
      expect(1).toBe(2); // this test is fail.
    });
  
    it("toBe is valid.", (){
      expect(1).toBe(1);
      expect("hoge").toBe("hoge");

      var a = new Sample();
      var b = new Sample();
      
      expect(a).toBe(a);     // a === a is true
      expect(a).not.toBe(b); // a === b is false
    });
    
    it("not is valid.", (){
      expect(1).not.toBe(2);
      expect(1).not.not.toBe(1);
    });
    
    it("toBeNull is valid.", (){
      expect(null).toBeNull();
      expect("hoge").not.toBeNull();
    });

    it("toEqual is valid.", (){
      expect(1).toEqual(1);
      expect("hoge").toEqual("hoge");

      var a = new Sample();
      var b = new Sample();
      
      expect(a).toEqual(a); // a == a is true
      expect(a).toEqual(b); // a == b is true (overwrite operator ==)
    });

    describe("child", (){
  
      it("not op", (){
        
        expect(1).toBe(1);
      });
    });
  });
  
  // TODO top-level it
  /*
  it("top-level it", (){
    
    expect(1).toBe(1);
  });
   */
  
  setTeaoliveReporter(new TeaoliveHtmlReporter()); // if you want to run from command-line. remove this line.
  teaoliveRun();
}

class Sample {
  operator ==(Sample other) {
    return true;
  }
}