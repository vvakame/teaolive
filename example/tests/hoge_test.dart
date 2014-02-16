library hoge_test;

// #import('package:teaolive/teaolive.dart');
import '../../lib/teaolive.dart';

void testCase(){
  describe("sample hoge test case.", (){
    it("ok",(){
    });

    it("ng", (){
      throw "dame dayo!";
    });
  });
}
