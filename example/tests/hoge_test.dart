library hoge_test;

import 'package:teaolive/src/teaolive.dart';

void testCase(){
  describe("sample hoge test case.", (){
    it("ok",(){
    });

    it("ng", (){
      throw "dame dayo!";
    });
  });
}
