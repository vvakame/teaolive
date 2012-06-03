#library('teaolive_html_reporter');

#import('dart:html');

#import('../teaolive.dart');

/**
 * For implementation of HTML Reporters of [TeaoliveReporter].
 * this class is working with teaolive.html and teaolive.css.
 */
class TeaoliveHtmlReporter implements TeaoliveReporter {
  
  Element _parent;
  
  TeaoliveHtmlReporter() {
    _parent = document.query("#teaolive-result");
  }
  TeaoliveHtmlReporter.withParent(this._parent);
  
  void onRunnerStart(){
    _parent.innerHTML = "test is started...";
  }
  
  void onSuiteResult(TestPiece suite){}

  void onSpecResult(TestPiece spec){}

  void onRunnerResult(TeaoliveRunner runner){
    _parent.nodes.clear();
    
    for(TestPiece piece in runner.tests){
      if(piece.isSuite()){
        addSuite2dom(_parent, piece);
      } else {
        addSpec2dom(_parent, piece);
      }
    }
  }
  
  void addSuite2dom(final Element parent, final TestPiece suite){
    
    final Element el = new Element.tag("div");
    el.classes.add("teaolieve-describe");

    if(suite.ignore){
      el.classes.add("teaolive-skipped");
      el.innerHTML = "describe ${suite.description} is skipped";

    } else if(suite.result){
      el.classes.add("teaolive-success");
      el.innerHTML = "describe ${suite.description} is success!";

    } else {
      el.classes.add("teaolive-failure");
      el.innerHTML = "describe ${suite.description} is failure...";
      
      parent.nodes.add(el);

      for(TestPiece piece in suite.tests){
        if(piece.isSuite()){
          addSuite2dom(el, piece);
        } else {
          addSpec2dom(el, piece);
        }
      }
    }
    parent.nodes.add(el);
  }
  
  void addSpec2dom(Element parent, TestPiece spec){
    
    final Element el = new Element.tag("div");
    el.classes.add("teaolieve-it");

    if(spec.ignore){
      el.classes.add("teaolive-skipped");
      el.innerHTML = "it ${spec.description} is skipped";
    
    } else if(spec.result){
      el.classes.add("teaolive-success");
      el.innerHTML = "it ${spec.description} is success!";

    } else {

      el.classes.add("teaolive-failure");
      el.innerHTML = "it ${spec.description} is failure...";

      if(spec.errorMessage != null){
        el.innerHTML += " ${spec.errorMessage}";
      } else {
        el.innerHTML += " unknown error ${spec.error}";
      }
      if(spec.error is AssertionException == false){
        final Element pre = new Element.tag("pre");
        pre.text = spec.trace.toString();
        el.nodes.add(pre);
      }
    }
    parent.nodes.add(el);
  }
}
