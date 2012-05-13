#library('teaolive_html_reporter');

#import('dart:html');

#import('./teaolive.dart');

class TeaoliveHtmlReporter implements TeaoliveReporter {
  
  
  Element _parent;
  
  TeaoliveReporter(){}

  TeaoliveHtmlReporter.withParent(this._parent);
  
  void onRunnerStart(){
    if(_parent == null){
      _parent = document.query("#teaolive-result");
    }
    _parent.innerHTML = "test is started...";
  }
  
  void onSuiteResult(TeaoliveSuite suite){}

  void onSpecResult(TeaoliveSpec spec){}

  void onRunnerResult(TeaoliveRunner runner){
    _parent.nodes.clear();
    
    for(TeaoliveSuite suite in runner.suites){
      addSuite2dom(_parent, suite);
    }
  }
  
  void addSuite2dom(final Element parent, final TeaoliveSuite suite){
    
    final Element el = new Element.tag("div");
    el.classes.add("teaolieve-describe");

    if(suite.result){
      el.classes.add("teaolive-success");
      el.innerHTML = "describe ${suite.description} is success!";

    } else {
      el.classes.add("teaolive-failure");
      el.innerHTML = "describe ${suite.description} is failure...";
      
      _parent.nodes.add(el);

      for(TeaoliveSpec spec in suite.specs){
        addSpec2dom(el, spec);
      }
    }
    parent.nodes.add(el);
  }
  
  void addSpec2dom(Element parent, TeaoliveSpec spec){
    
    final Element el = new Element.tag("div");
    el.classes.add("teaolieve-it");

    if(spec.result){
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
    }
    parent.nodes.add(el);
  }
}
