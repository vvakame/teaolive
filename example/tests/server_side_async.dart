library server_side_async_test;

import 'package:http/http.dart' as http;

// #import('package:teaolive/teaolive.dart');
import '../../teaolive.dart';

void testCase(){
  describe("asynchronous test", (){
    afterEach((){
      print("afterEach");
    });

    it("use guardian", (){
      var guardian = createGuardian();
      String payload;

      var client = new http.Client();
      client.get("http://vvakame.github.io/teaolive/")
        .then((response) {
          var buffer = new StringBuffer();
          payload = response.body;
          guardian.complete();
        })
        .catchError((e) {
          guardian.completeError(e);
        });

      asyncResult((){
        expect(payload.length).not.toBe(0);
      });
    });
  });
}
