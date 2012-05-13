#library('foobar_test');

#import('../libs/teaolive.dart');

void testCase(){
  describe("sample foobar test case.", (){
    it("ok",(){
    });
    
    it("ng", (){
      throw "dame dayo!";
    });
  });
}
