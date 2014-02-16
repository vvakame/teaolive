library foobar_test;

import 'package:teaolive/src/teaolive.dart';

void testCase(){
  describe("sample foobar test case.", (){
    it("ok",(){
    });

    it("ng", (){
      throw "dame dayo!";
    });
  });
}
