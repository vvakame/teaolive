#library('teaolive-usage');

#import('./teaolive.dart');
#import('./teaolive_html_reporter.dart'); // if you want to run from command-line. remove this line.

void main(){

  describe("Tea olive", (){
    
    it("makes testing Dart is awesome!", (){
      expect(1).toBe(1);
    });
  
    it("failure...", (){
      expect(1).toBe(2);
    });
  
    it("not op", (){
      expect(1).not.toBe(2);
      expect(1).not.not.toBe(1);
  
      expect(1).not.toBe(1);
      expect(1).not.not.toBe(2);
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