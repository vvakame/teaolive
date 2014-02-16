library hoge_test;

// #import('package:teaolive/teaolive.dart');
import '../../teaolive.dart';

void testCase(){
  describe("sample hoge test case.", (){
    it("ok",(){
    });

    it("ng", (){
      throw "dame dayo!";
    });
  });
}
