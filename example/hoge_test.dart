#library('hoge_test');

#import('../libs/teaolive.dart');

void testCase(){
  describe("sample hoge test case.", (){
    it("ok",(){
    });
    
    it("ng", (){
      throw "dame dayo!";
    });
  });
}
