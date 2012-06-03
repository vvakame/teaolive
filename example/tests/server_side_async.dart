#library('server_side_async_test');

#import('dart:io');
#import('dart:uri');

// #import('package:teaolive/teaolive.dart');
#import('../../teaolive.dart');

void testCase(){
  describe("asynchronous test", (){
    afterEach((){
      print("afterEach");
    });
    
    it("use guardian", (){
      Guardian guardian = createGuardian();
      String payload;
      
      HttpClient client = new HttpClient();
      HttpClientConnection connection = client.getUrl(new Uri.fromString("http://dl.dropbox.com/u/6581286/mti/android/turn6/data.json"));
      connection.onError = (var e) => guardian.completeException(e);
      connection.onResponse = (HttpClientResponse response){
        StringBuffer buffer = new StringBuffer();
        InputStream input = response.inputStream; 
        input.onData = (){
          buffer.add(new String.fromCharCodes(input.read()));
        };
        input.onClosed = (){
          client.shutdown();
          payload = buffer.toString();
          guardian.arrival();
        };
      };
      
      asyncResult((){
        expect(payload.length).not.toBe(0);
      });
    });
  });
}
