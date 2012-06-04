function $defProp(obj, prop, value) {
  Object.defineProperty(obj, prop,
      {value: value, enumerable: false, writable: true, configurable: true});
}
$defProp(Object.prototype, '$typeNameOf', (function() {
  function constructorNameWithFallback(obj) {
    var constructor = obj.constructor;
    if (typeof(constructor) == 'function') {
      // The constructor isn't null or undefined at this point. Try
      // to grab hold of its name.
      var name = constructor.name;
      // If the name is a non-empty string, we use that as the type
      // name of this object. On Firefox, we often get 'Object' as
      // the constructor name even for more specialized objects so
      // we have to fall through to the toString() based implementation
      // below in that case.
      if (typeof(name) == 'string' && name && name != 'Object') return name;
    }
    var string = Object.prototype.toString.call(obj);
    return string.substring(8, string.length - 1);
  }

  function chrome$typeNameOf() {
    var name = this.constructor.name;
    if (name == 'Window') return 'DOMWindow';
    if (name == 'CanvasPixelArray') return 'Uint8ClampedArray';
    return name;
  }

  function firefox$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    if (name == 'Document') return 'HTMLDocument';
    if (name == 'XMLDocument') return 'Document';
    if (name == 'WorkerMessageEvent') return 'MessageEvent';
    return name;
  }

  function ie$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    // IE calls both HTML and XML documents 'Document', so we check for the
    // xmlVersion property, which is the empty string on HTML documents.
    if (name == 'Document' && this.xmlVersion) return 'Document';
    if (name == 'Document') return 'HTMLDocument';
    if (name == 'HTMLTableDataCellElement') return 'HTMLTableCellElement';
    if (name == 'HTMLTableHeaderCellElement') return 'HTMLTableCellElement';
    if (name == 'MSStyleCSSProperties') return 'CSSStyleDeclaration';
    if (name == 'CanvasPixelArray') return 'Uint8ClampedArray';
    if (name == 'HTMLPhraseElement') return 'HTMLElement';
    return name;
  }

  // If we're not in the browser, we're almost certainly running on v8.
  if (typeof(navigator) != 'object') return chrome$typeNameOf;

  var userAgent = navigator.userAgent;
  if (/Chrome|DumpRenderTree/.test(userAgent)) return chrome$typeNameOf;
  if (/Firefox/.test(userAgent)) return firefox$typeNameOf;
  if (/MSIE/.test(userAgent)) return ie$typeNameOf;
  return function() { return constructorNameWithFallback(this); };
})());
Function.prototype.bind = Function.prototype.bind ||
  function(thisObj) {
    var func = this;
    var funcLength = func.$length || func.length;
    var argsLength = arguments.length;
    if (argsLength > 1) {
      var boundArgs = Array.prototype.slice.call(arguments, 1);
      var bound = function() {
        // Prepend the bound arguments to the current arguments.
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, boundArgs);
        return func.apply(thisObj, newArgs);
      };
      bound.$length = Math.max(0, funcLength - (argsLength - 1));
      return bound;
    } else {
      var bound = function() {
        return func.apply(thisObj, arguments);
      };
      bound.$length = funcLength;
      return bound;
    }
  };
function $notnull_bool(test) {
  if (test === true || test === false) return test;
  $throw(new TypeError(test, 'bool'));
}
function $throw(e) {
  // If e is not a value, we can use V8's captureStackTrace utility method.
  // TODO(jmesserly): capture the stack trace on other JS engines.
  if (e && (typeof e == 'object') && Error.captureStackTrace) {
    // TODO(jmesserly): this will clobber the e.stack property
    Error.captureStackTrace(e, $throw);
  }
  throw e;
}
$defProp(Object.prototype, '$index', function(i) {
  $throw(new NoSuchMethodException(this, "operator []", [i]));
});
$defProp(Array.prototype, '$index', function(index) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i];
});
$defProp(String.prototype, '$index', function(i) {
  return this[i];
});
$defProp(Object.prototype, '$setindex', function(i, value) {
  $throw(new NoSuchMethodException(this, "operator []=", [i, value]));
});
$defProp(Array.prototype, '$setindex', function(index, value) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i] = value;
});
function $wrap_call$0(fn) { return fn; }
function $wrap_call$1(fn) { return fn; };
function $wrap_call$2(fn) { return fn; };
function $add$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'string') {
    var str = (y == null) ? 'null' : y.toString();
    if (typeof(str) != 'string') {
      throw new Error("calling toString() on right hand operand of operator " +
      "+ did not return a String");
    }
    return x + str;
  } else if (typeof(x) == 'object') {
    return x.$add(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator +", [y]));
  }
}

function $add$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x + y;
  return $add$complex$(x, y);
}
function $eq$(x, y) {
  if (x == null) return y == null;
  return (typeof(x) != 'object') ? x === y : x.$eq(y);
}
// TODO(jimhug): Should this or should it not match equals?
$defProp(Object.prototype, '$eq', function(other) {
  return this === other;
});
function $mul$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$mul(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator *", [y]));
  }
}
function $mul$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x * y;
  return $mul$complex$(x, y);
}
function $ne$(x, y) {
  if (x == null) return y != null;
  return (typeof(x) != 'object') ? x !== y : !x.$eq(y);
}
function $sub$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$sub(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator -", [y]));
  }
}
function $sub$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x - y;
  return $sub$complex$(x, y);
}
function $truncdiv$(x, y) {
  if (typeof(x) == 'number') {
    if (typeof(y) == 'number') {
      if (y == 0) $throw(new IntegerDivisionByZeroException());
      var tmp = x / y;
      return (tmp < 0) ? Math.ceil(tmp) : Math.floor(tmp);
    } else {
      $throw(new IllegalArgumentException(y));
    }
  } else if (typeof(x) == 'object') {
    return x.$truncdiv(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator ~/", [y]));
  }
}
$defProp(Object.prototype, "get$typeName", Object.prototype.$typeNameOf);
/** Implements extends for Dart classes on JavaScript prototypes. */
function $inherits(child, parent) {
  if (child.prototype.__proto__) {
    child.prototype.__proto__ = parent.prototype;
  } else {
    function tmp() {};
    tmp.prototype = parent.prototype;
    child.prototype = new tmp();
    child.prototype.constructor = child;
  }
}
function $dynamic(name) {
  var f = Object.prototype[name];
  if (f && f.methods) return f.methods;

  var methods = {};
  if (f) methods.Object = f;
  function $dynamicBind() {
    // Find the target method
    var obj = this;
    var tag = obj.$typeNameOf();
    var method = methods[tag];
    if (!method) {
      var table = $dynamicMetadata;
      for (var i = 0; i < table.length; i++) {
        var entry = table[i];
        if (entry.map.hasOwnProperty(tag)) {
          method = methods[entry.tag];
          if (method) break;
        }
      }
    }
    method = method || methods.Object;

    var proto = Object.getPrototypeOf(obj);

    if (method == null) {
      // Trampoline to throw NoSuchMethodException (TODO: call noSuchMethod).
      method = function(){
        // Exact type check to prevent this code shadowing the dispatcher from a
        // subclass.
        if (Object.getPrototypeOf(this) === proto) {
          // TODO(sra): 'name' is the jsname, should be the Dart name.
          $throw(new NoSuchMethodException(
              obj, name, Array.prototype.slice.call(arguments)));
        }
        return Object.prototype[name].apply(this, arguments);
      };
    }

    if (!proto.hasOwnProperty(name)) {
      $defProp(proto, name, method);
    }

    return method.apply(this, Array.prototype.slice.call(arguments));
  };
  $dynamicBind.methods = methods;
  $defProp(Object.prototype, name, $dynamicBind);
  return methods;
}
if (typeof $dynamicMetadata == 'undefined') $dynamicMetadata = [];
function $dynamicSetMetadata(inputTable) {
  // TODO: Deal with light isolates.
  var table = [];
  for (var i = 0; i < inputTable.length; i++) {
    var tag = inputTable[i][0];
    var tags = inputTable[i][1];
    var map = {};
    var tagNames = tags.split('|');
    for (var j = 0; j < tagNames.length; j++) {
      map[tagNames[j]] = true;
    }
    table.push({tag: tag, tags: tags, map: map});
  }
  $dynamicMetadata = table;
}
$defProp(Object.prototype, "get$dynamic", function() {
  "use strict"; return this;
});
$defProp(Object.prototype, "noSuchMethod", function(name, args) {
  $throw(new NoSuchMethodException(this, name, args));
});
$defProp(Object.prototype, "$dom_addEventListener$3", function($0, $1, $2) {
  return this.noSuchMethod("$dom_addEventListener", [$0, $1, $2]);
});
$defProp(Object.prototype, "$dom_removeEventListener$3", function($0, $1, $2) {
  return this.noSuchMethod("$dom_removeEventListener", [$0, $1, $2]);
});
$defProp(Object.prototype, "add$1", function($0) {
  return this.noSuchMethod("add", [$0]);
});
$defProp(Object.prototype, "addAll$1", function($0) {
  return this.noSuchMethod("addAll", [$0]);
});
$defProp(Object.prototype, "addLast$1", function($0) {
  return this.noSuchMethod("addLast", [$0]);
});
$defProp(Object.prototype, "assert$ArgumentNode", function() {
  $throw(new TypeError._internal$ctor(this, "ArgumentNode"));
});
$defProp(Object.prototype, "assert$BlockSyntax", function() {
  $throw(new TypeError._internal$ctor(this, "BlockSyntax"));
});
$defProp(Object.prototype, "assert$CaseNode", function() {
  $throw(new TypeError._internal$ctor(this, "CaseNode"));
});
$defProp(Object.prototype, "assert$CatchNode", function() {
  $throw(new TypeError._internal$ctor(this, "CatchNode"));
});
$defProp(Object.prototype, "assert$Collection", function() {
  $throw(new TypeError._internal$ctor(this, "Collection"));
});
$defProp(Object.prototype, "assert$Collection_Element", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<html.Element>"));
});
$defProp(Object.prototype, "assert$Collection_File", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<html.File>"));
});
$defProp(Object.prototype, "assert$Collection_Object", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<dart:core.Object>"));
});
$defProp(Object.prototype, "assert$Collection_String", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"));
});
$defProp(Object.prototype, "assert$Collection_StyleSheet", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"));
});
$defProp(Object.prototype, "assert$Collection_Touch", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"));
});
$defProp(Object.prototype, "assert$Collection__NodeImpl", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"));
});
$defProp(Object.prototype, "assert$Collection_int", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"));
});
$defProp(Object.prototype, "assert$Collection_num", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"));
});
$defProp(Object.prototype, "assert$CounterLog", function() {
  $throw(new TypeError._internal$ctor(this, "CounterLog"));
});
$defProp(Object.prototype, "assert$Date", function() {
  $throw(new TypeError._internal$ctor(this, "Date"));
});
$defProp(Object.prototype, "assert$Definition", function() {
  $throw(new TypeError._internal$ctor(this, "Definition"));
});
$defProp(Object.prototype, "assert$DoubleLinkedQueueEntry_KeyValuePair", function() {
  $throw(new TypeError._internal$ctor(this, "DoubleLinkedQueueEntry<dart:coreimpl.KeyValuePair>"));
});
$defProp(Object.prototype, "assert$Duration", function() {
  $throw(new TypeError._internal$ctor(this, "Duration"));
});
$defProp(Object.prototype, "assert$ElementList", function() {
  $throw(new TypeError._internal$ctor(this, "ElementList"));
});
$defProp(Object.prototype, "assert$Expression", function() {
  $throw(new TypeError._internal$ctor(this, "Expression"));
});
$defProp(Object.prototype, "assert$FieldMember", function() {
  $throw(new TypeError._internal$ctor(this, "FieldMember"));
});
$defProp(Object.prototype, "assert$FormalNode", function() {
  $throw(new TypeError._internal$ctor(this, "FormalNode"));
});
$defProp(Object.prototype, "assert$Future", function() {
  $throw(new TypeError._internal$ctor(this, "Future"));
});
$defProp(Object.prototype, "assert$GlobalValue", function() {
  $throw(new TypeError._internal$ctor(this, "GlobalValue"));
});
$defProp(Object.prototype, "assert$Identifier", function() {
  $throw(new TypeError._internal$ctor(this, "Identifier"));
});
$defProp(Object.prototype, "assert$InlineSyntax", function() {
  $throw(new TypeError._internal$ctor(this, "InlineSyntax"));
});
$defProp(Object.prototype, "assert$InterpStack", function() {
  $throw(new TypeError._internal$ctor(this, "InterpStack"));
});
$defProp(Object.prototype, "assert$InvokeKey", function() {
  $throw(new TypeError._internal$ctor(this, "InvokeKey"));
});
$defProp(Object.prototype, "assert$Iterable", function() {
  $throw(new TypeError._internal$ctor(this, "Iterable"));
});
$defProp(Object.prototype, "assert$Iterator", function() {
  $throw(new TypeError._internal$ctor(this, "Iterator"));
});
$defProp(Object.prototype, "assert$Iterator_Element", function() {
  $throw(new TypeError._internal$ctor(this, "Iterator<html.Element>"));
});
$defProp(Object.prototype, "assert$Iterator_dart_core_String", function() {
  $throw(new TypeError._internal$ctor(this, "Iterator<dart:core.String>"));
});
$defProp(Object.prototype, "assert$KeyValuePair", function() {
  $throw(new TypeError._internal$ctor(this, "KeyValuePair"));
});
$defProp(Object.prototype, "assert$Library", function() {
  $throw(new TypeError._internal$ctor(this, "Library"));
});
$defProp(Object.prototype, "assert$LibraryImport", function() {
  $throw(new TypeError._internal$ctor(this, "LibraryImport"));
});
$defProp(Object.prototype, "assert$List", function() {
  $throw(new TypeError._internal$ctor(this, "List"));
});
$defProp(Object.prototype, "assert$ListFactory", function() {
  $throw(new TypeError._internal$ctor(this, "ListFactory"));
});
$defProp(Object.prototype, "assert$List_Element", function() {
  $throw(new TypeError._internal$ctor(this, "List<html.Element>"));
});
$defProp(Object.prototype, "assert$List_int", function() {
  $throw(new TypeError._internal$ctor(this, "List<dart:core.int>"));
});
$defProp(Object.prototype, "assert$Map", function() {
  $throw(new TypeError._internal$ctor(this, "Map"));
});
$defProp(Object.prototype, "assert$Match", function() {
  $throw(new TypeError._internal$ctor(this, "Match"));
});
$defProp(Object.prototype, "assert$Member", function() {
  $throw(new TypeError._internal$ctor(this, "Member"));
});
$defProp(Object.prototype, "assert$MethodCallData", function() {
  $throw(new TypeError._internal$ctor(this, "MethodCallData"));
});
$defProp(Object.prototype, "assert$Parameter", function() {
  $throw(new TypeError._internal$ctor(this, "Parameter"));
});
$defProp(Object.prototype, "assert$ParameterType", function() {
  $throw(new TypeError._internal$ctor(this, "ParameterType"));
});
$defProp(Object.prototype, "assert$Pattern", function() {
  $throw(new TypeError._internal$ctor(this, "Pattern"));
});
$defProp(Object.prototype, "assert$RegExp", function() {
  $throw(new TypeError._internal$ctor(this, "RegExp"));
});
$defProp(Object.prototype, "assert$Set_dart_core_String", function() {
  $throw(new TypeError._internal$ctor(this, "Set<dart:core.String>"));
});
$defProp(Object.prototype, "assert$SourceFile", function() {
  $throw(new TypeError._internal$ctor(this, "SourceFile"));
});
$defProp(Object.prototype, "assert$SourceSpan", function() {
  $throw(new TypeError._internal$ctor(this, "SourceSpan"));
});
$defProp(Object.prototype, "assert$Statement", function() {
  $throw(new TypeError._internal$ctor(this, "Statement"));
});
$defProp(Object.prototype, "assert$StringBuffer", function() {
  $throw(new TypeError._internal$ctor(this, "StringBuffer"));
});
$defProp(Object.prototype, "assert$StringValue", function() {
  $throw(new TypeError._internal$ctor(this, "StringValue"));
});
$defProp(Object.prototype, "assert$TagState", function() {
  $throw(new TypeError._internal$ctor(this, "TagState"));
});
$defProp(Object.prototype, "assert$Token", function() {
  $throw(new TypeError._internal$ctor(this, "Token"));
});
$defProp(Object.prototype, "assert$Type", function() {
  $throw(new TypeError._internal$ctor(this, "Type"));
});
$defProp(Object.prototype, "assert$TypeParameter", function() {
  $throw(new TypeError._internal$ctor(this, "TypeParameter"));
});
$defProp(Object.prototype, "assert$TypeReference", function() {
  $throw(new TypeError._internal$ctor(this, "TypeReference"));
});
$defProp(Object.prototype, "assert$Value", function() {
  $throw(new TypeError._internal$ctor(this, "Value"));
});
$defProp(Object.prototype, "assert$VariableSlot", function() {
  $throw(new TypeError._internal$ctor(this, "VariableSlot"));
});
$defProp(Object.prototype, "assert$_ElementImpl", function() {
  $throw(new TypeError._internal$ctor(this, "_ElementImpl"));
});
$defProp(Object.prototype, "assert$_MeasurementRequest", function() {
  $throw(new TypeError._internal$ctor(this, "_MeasurementRequest"));
});
$defProp(Object.prototype, "assert$_NodeImpl", function() {
  $throw(new TypeError._internal$ctor(this, "_NodeImpl"));
});
$defProp(Object.prototype, "assert$_SharedBackingMap", function() {
  $throw(new TypeError._internal$ctor(this, "_SharedBackingMap"));
});
$defProp(Object.prototype, "assert$dart_core_Collection_Node", function() {
  $throw(new TypeError._internal$ctor(this, "Collection<html.Node>"));
});
$defProp(Object.prototype, "assert$html_ClientRect", function() {
  $throw(new TypeError._internal$ctor(this, "ClientRect"));
});
$defProp(Object.prototype, "assert$html_Element", function() {
  $throw(new TypeError._internal$ctor(this, "Element"));
});
$defProp(Object.prototype, "assert$html_File", function() {
  $throw(new TypeError._internal$ctor(this, "File"));
});
$defProp(Object.prototype, "assert$html_MutationRecord", function() {
  $throw(new TypeError._internal$ctor(this, "MutationRecord"));
});
$defProp(Object.prototype, "assert$html_Node", function() {
  $throw(new TypeError._internal$ctor(this, "Node"));
});
$defProp(Object.prototype, "assert$html_ScriptProfile", function() {
  $throw(new TypeError._internal$ctor(this, "ScriptProfile"));
});
$defProp(Object.prototype, "assert$html_ScriptProfileNode", function() {
  $throw(new TypeError._internal$ctor(this, "ScriptProfileNode"));
});
$defProp(Object.prototype, "assert$html_StyleSheet", function() {
  $throw(new TypeError._internal$ctor(this, "StyleSheet"));
});
$defProp(Object.prototype, "assert$html_Touch", function() {
  $throw(new TypeError._internal$ctor(this, "Touch"));
});
$defProp(Object.prototype, "assert$html_XMLHttpRequest", function() {
  $throw(new TypeError._internal$ctor(this, "XMLHttpRequest"));
});
$defProp(Object.prototype, "assert$markdown_Node", function() {
  $throw(new TypeError._internal$ctor(this, "Node"));
});
$defProp(Object.prototype, "clear$0", function() {
  return this.noSuchMethod("clear", []);
});
$defProp(Object.prototype, "compareTo$1", function($0) {
  return this.noSuchMethod("compareTo", [$0]);
});
$defProp(Object.prototype, "contains$1", function($0) {
  return this.noSuchMethod("contains", [$0]);
});
$defProp(Object.prototype, "containsKey$1", function($0) {
  return this.noSuchMethod("containsKey", [$0]);
});
$defProp(Object.prototype, "end$0", function() {
  return this.noSuchMethod("end", []);
});
$defProp(Object.prototype, "filter$1", function($0) {
  return this.noSuchMethod("filter", [$0]);
});
$defProp(Object.prototype, "forEach$1", function($0) {
  return this.noSuchMethod("forEach", [$0]);
});
$defProp(Object.prototype, "is$Collection", function() {
  return false;
});
$defProp(Object.prototype, "is$List", function() {
  return false;
});
$defProp(Object.prototype, "is$Map", function() {
  return false;
});
$defProp(Object.prototype, "is$RegExp", function() {
  return false;
});
$defProp(Object.prototype, "is$html_Element", function() {
  return false;
});
$defProp(Object.prototype, "open$3", function($0, $1, $2) {
  return this.noSuchMethod("open", [$0, $1, $2]);
});
$defProp(Object.prototype, "query$1", function($0) {
  return this.noSuchMethod("query", [$0]);
});
$defProp(Object.prototype, "remove$0", function() {
  return this.noSuchMethod("remove", []);
});
$defProp(Object.prototype, "remove$1", function($0) {
  return this.noSuchMethod("remove", [$0]);
});
$defProp(Object.prototype, "send$0", function() {
  return this.noSuchMethod("send", []);
});
$defProp(Object.prototype, "sort$1", function($0) {
  return this.noSuchMethod("sort", [$0]);
});
$defProp(Object.prototype, "start$0", function() {
  return this.noSuchMethod("start", []);
});
AssertionError._internal$ctor = function(failedAssertion, url, line, column) {
  this.failedAssertion = failedAssertion;
  this.url = url;
  this.line = line;
  this.column = column;
}
AssertionError._internal$ctor.prototype = AssertionError.prototype;
function AssertionError() {}
AssertionError.prototype.toString = function() {
  return $add$(("Failed assertion: '" + this.failedAssertion + "' is not true "), ("in " + this.url + " at line " + this.line + ", column " + this.column + "."));
}
TypeError._internal$ctor = function(src, dstType) {
  this.srcType = (src == null ? "Null" : src.$typeNameOf());
  this.dstType = dstType;
  this.toString = function() {
    return ("Failed type check: type " + this.srcType +
        " is not assignable to type " + this.dstType);
  }
}
TypeError._internal$ctor.prototype = TypeError.prototype;
function IndexOutOfRangeException(_index) {
  this._index = _index;
}
IndexOutOfRangeException.prototype.is$IndexOutOfRangeException = function(){return true};
IndexOutOfRangeException.prototype.toString = function() {
  return ("IndexOutOfRangeException: " + this._index);
}
function IllegalAccessException() {

}
IllegalAccessException.prototype.toString = function() {
  return "Attempt to modify an immutable object";
}
function NoSuchMethodException(_receiver, _functionName, _arguments, _existingArgumentNames) {
  this._receiver = _receiver;
  this._functionName = _functionName;
  this._arguments = _arguments;
  this._existingArgumentNames = _existingArgumentNames;
}
NoSuchMethodException.prototype.is$NoSuchMethodException = function(){return true};
NoSuchMethodException.prototype.toString = function() {
  var sb = new StringBufferImpl("");
  for (var i = (0);
   i < this._arguments.get$length(); i++) {
    if (i > (0)) {
      sb.add(", ");
    }
    sb.add(this._arguments.$index(i));
  }
  if (null == this._existingArgumentNames) {
    return (("NoSuchMethodException : method not found: '" + this._functionName + "'\n") + ("Receiver: " + this._receiver + "\n") + ("Arguments: [" + sb + "]"));
  }
  else {
    var actualParameters = sb.toString();
    sb = new StringBufferImpl("");
    for (var i = (0);
     i < this._existingArgumentNames.get$length(); i++) {
      if (i > (0)) {
        sb.add(", ");
      }
      sb.add(this._existingArgumentNames.$index(i));
    }
    var formalParameters = sb.toString();
    return ("NoSuchMethodException: incorrect number of arguments passed to " + ("method named '" + this._functionName + "'\nReceiver: " + this._receiver + "\n") + ("Tried calling: " + this._functionName + "(" + actualParameters + ")\n") + ("Found: " + this._functionName + "(" + formalParameters + ")"));
  }
}
function ClosureArgumentMismatchException() {

}
ClosureArgumentMismatchException.prototype.toString = function() {
  return "Closure argument mismatch";
}
function ObjectNotClosureException() {

}
ObjectNotClosureException.prototype.toString = function() {
  return "Object is not closure";
}
function IllegalArgumentException(arg) {
  this._arg = arg;
}
IllegalArgumentException.prototype.is$IllegalArgumentException = function(){return true};
IllegalArgumentException.prototype.toString = function() {
  return ("Illegal argument(s): " + this._arg);
}
function StackOverflowException() {

}
StackOverflowException.prototype.toString = function() {
  return "Stack Overflow";
}
function NullPointerException(functionName, arguments) {
  this.functionName = functionName;
  this.arguments = arguments;
}
NullPointerException.prototype.toString = function() {
  if (this.functionName == null) {
    return this.get$exceptionName();
  }
  else {
    return (("" + this.get$exceptionName() + " : method: '" + this.functionName + "'\n") + "Receiver: null\n" + ("Arguments: " + this.arguments));
  }
}
NullPointerException.prototype.get$exceptionName = function() {
  return "NullPointerException";
}
function NoMoreElementsException() {

}
NoMoreElementsException.prototype.toString = function() {
  return "NoMoreElementsException";
}
function EmptyQueueException() {

}
EmptyQueueException.prototype.toString = function() {
  return "EmptyQueueException";
}
function UnsupportedOperationException(_message) {
  this._message = _message;
}
UnsupportedOperationException.prototype.toString = function() {
  return ("UnsupportedOperationException: " + this._message);
}
function IntegerDivisionByZeroException() {

}
IntegerDivisionByZeroException.prototype.is$IntegerDivisionByZeroException = function(){return true};
IntegerDivisionByZeroException.prototype.toString = function() {
  return "IntegerDivisionByZeroException";
}
Function.prototype.to$call$0 = function() {
  this.call$0 = this._genStub(0);
  this.to$call$0 = function() { return this.call$0; };
  return this.call$0;
};
Function.prototype.call$0 = function() {
  return this.to$call$0()();
};
function to$call$0(f) { return f && f.to$call$0(); }
Function.prototype.to$call$1 = function() {
  this.call$1 = this._genStub(1);
  this.to$call$1 = function() { return this.call$1; };
  return this.call$1;
};
Function.prototype.call$1 = function($0) {
  return this.to$call$1()($0);
};
function to$call$1(f) { return f && f.to$call$1(); }
Function.prototype.to$call$2 = function() {
  this.call$2 = this._genStub(2);
  this.to$call$2 = function() { return this.call$2; };
  return this.call$2;
};
Function.prototype.call$2 = function($0, $1) {
  return this.to$call$2()($0, $1);
};
function to$call$2(f) { return f && f.to$call$2(); }
function $assert_Function(x) {
  if (x == null || typeof(x) == "function") return x;
  $throw(new TypeError._internal$ctor(x, "Function"))
}
function $assert_num(x) {
  if (x == null || typeof(x) == "number") return x;
  $throw(new TypeError._internal$ctor(x, "num"))
}
function $assert_String(x) {
  if (x == null || typeof(x) == "string") return x;
  $throw(new TypeError._internal$ctor(x, "String"))
}
function Strings() {}
Strings.String$fromCharCodes$factory = function(charCodes) {
  return StringBase.createFromCharCodes(charCodes);
}
Strings.join = function(strings, separator) {
  return StringBase.join(strings, separator);
}
function _assert(test, text, url, line, column) {
  if ((typeof(test) == 'function')) test = test.call$0();
  if (!$notnull_bool(test)) $throw(new AssertionError._internal$ctor(text, url, line, column));
}
function _toDartException(e) {
  function attachStack(dartEx) {
    // TODO(jmesserly): setting the stack property is not a long term solution.
    var stack = e.stack;
    // The stack contains the error message, and the stack is all that is
    // printed (the exception's toString() is never called).  Make the Dart
    // exception's toString() be the dominant message.
    if (typeof stack == 'string') {
      var message = dartEx.toString();
      if (/^(Type|Range)Error:/.test(stack)) {
        // Indent JS message (it can be helpful) so new message stands out.
        stack = '    (' + stack.substring(0, stack.indexOf('\n')) + ')\n' +
                stack.substring(stack.indexOf('\n') + 1);
      }
      stack = message + '\n' + stack;
    }
    dartEx.stack = stack;
    return dartEx;
  }

  if (e instanceof TypeError) {
    switch(e.type) {
      case 'property_not_function':
      case 'called_non_callable':
        if (e.arguments[0] == null) {
          return attachStack(new NullPointerException(null, []));
        } else {
          return attachStack(new ObjectNotClosureException());
        }
        break;
      case 'non_object_property_call':
      case 'non_object_property_load':
        return attachStack(new NullPointerException(null, []));
        break;
      case 'undefined_method':
        var mname = e.arguments[0];
        if (typeof(mname) == 'string' && (mname.indexOf('call$') == 0
            || mname == 'call' || mname == 'apply')) {
          return attachStack(new ObjectNotClosureException());
        } else {
          // TODO(jmesserly): fix noSuchMethod on operators so we don't hit this
          return attachStack(new NoSuchMethodException('', e.arguments[0], []));
        }
        break;
    }
  } else if (e instanceof RangeError) {
    if (e.message.indexOf('call stack') >= 0) {
      return attachStack(new StackOverflowException());
    }
  }
  return e;
}
function $assert_void(x) {
  if (x == null) return null;
  $throw(new TypeError._internal$ctor(x, "void"))
}
var ListFactory = Array;
$defProp(ListFactory.prototype, "assert$ListFactory", function(){return this});
$defProp(ListFactory.prototype, "is$List", function(){return true});
$defProp(ListFactory.prototype, "assert$List", function(){return this});
$defProp(ListFactory.prototype, "assert$List_int", function(){return this});
$defProp(ListFactory.prototype, "assert$List_Element", function(){return this});
$defProp(ListFactory.prototype, "is$Collection", function(){return true});
$defProp(ListFactory.prototype, "assert$Collection", function(){return this});
$defProp(ListFactory.prototype, "assert$Collection_Object", function(){return this});
$defProp(ListFactory.prototype, "assert$Collection_String", function(){return this});
$defProp(ListFactory.prototype, "assert$Collection_int", function(){return this});
$defProp(ListFactory.prototype, "assert$Collection_num", function(){return this});
$defProp(ListFactory.prototype, "assert$Collection_Element", function(){return this});
$defProp(ListFactory.prototype, "assert$Collection_File", function(){return this});
$defProp(ListFactory.prototype, "assert$dart_core_Collection_Node", function(){return this});
$defProp(ListFactory.prototype, "assert$Collection_StyleSheet", function(){return this});
$defProp(ListFactory.prototype, "assert$Collection_Touch", function(){return this});
$defProp(ListFactory.prototype, "assert$Collection__NodeImpl", function(){return this});
$defProp(ListFactory.prototype, "assert$Iterable", function(){return this});
ListFactory.ListFactory$from$factory = function(other) {
  var list = [];
  for (var $$i = other.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    list.add$1(e);
  }
  return (list == null ? null : list.assert$ListFactory());
}
$defProp(ListFactory.prototype, "get$length", function() { return this.length; });
$defProp(ListFactory.prototype, "set$length", function(value) { return this.length = value; });
$defProp(ListFactory.prototype, "add", function(value) {
  this.push(value);
});
$defProp(ListFactory.prototype, "addLast", function(value) {
  this.push(value);
});
$defProp(ListFactory.prototype, "addAll", function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var item = $$i.next();
    this.add(item);
  }
});
$defProp(ListFactory.prototype, "clear$_", function() {
  this.set$length((0));
});
$defProp(ListFactory.prototype, "removeLast", function() {
  return this.pop();
});
$defProp(ListFactory.prototype, "last", function() {
  return this.$index(this.get$length() - (1));
});
$defProp(ListFactory.prototype, "iterator", function() {
  return new ListIterator(this);
});
$defProp(ListFactory.prototype, "toString", function() {
  return Collections.collectionToString(this);
});
$defProp(ListFactory.prototype, "add$1", ListFactory.prototype.add);
$defProp(ListFactory.prototype, "addAll$1", function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection()));
});
$defProp(ListFactory.prototype, "addLast$1", ListFactory.prototype.addLast);
$defProp(ListFactory.prototype, "clear$0", ListFactory.prototype.clear$_);
$defProp(ListFactory.prototype, "filter$1", function($0) {
  return this.filter(to$call$1($0));
});
$defProp(ListFactory.prototype, "forEach$1", function($0) {
  return this.forEach(to$call$1($0));
});
$defProp(ListFactory.prototype, "sort$1", function($0) {
  return this.sort(to$call$2($0));
});
function ListIterator(array) {
  this._array = array;
  this._pos = (0);
}
ListIterator.prototype.assert$Iterator = function(){return this};
ListIterator.prototype.assert$Iterator_dart_core_String = function(){return this};
ListIterator.prototype.assert$Iterator_Element = function(){return this};
ListIterator.prototype.hasNext = function() {
  return this._array.get$length() > this._pos;
}
ListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._array.$index(this._pos++);
}
function ImmutableMap(keyValuePairs) {
  this._internal = _map(keyValuePairs);
}
ImmutableMap.prototype.is$Map = function(){return true};
ImmutableMap.prototype.assert$Map = function(){return this};
ImmutableMap.prototype.$index = function(key) {
  return this._internal.$index(key);
}
ImmutableMap.prototype.get$length = function() {
  return this._internal.get$length();
}
ImmutableMap.prototype.forEach = function(f) {
  this._internal.forEach$1(f);
}
ImmutableMap.prototype.getKeys = function() {
  var $0;
  return (($0 = this._internal.getKeys()) == null ? null : $0.assert$Collection());
}
ImmutableMap.prototype.containsKey = function(key) {
  return $notnull_bool(this._internal.containsKey$1(key));
}
ImmutableMap.prototype.$setindex = function(key, value) {
  $throw(const$0005);
}
ImmutableMap.prototype.clear$_ = function() {
  $throw(const$0005);
}
ImmutableMap.prototype.remove = function(key) {
  $throw(const$0005);
}
ImmutableMap.prototype.toString = function() {
  return Maps.mapToString(this);
}
ImmutableMap.prototype.clear$0 = ImmutableMap.prototype.clear$_;
ImmutableMap.prototype.containsKey$1 = ImmutableMap.prototype.containsKey;
ImmutableMap.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
ImmutableMap.prototype.remove$1 = ImmutableMap.prototype.remove;
function JSSyntaxRegExp(pattern, multiLine, ignoreCase) {
  JSSyntaxRegExp._create$ctor.call(this, pattern, $add$(($eq$(multiLine, true) ? "m" : ""), ($eq$(ignoreCase, true) ? "i" : "")));
}
JSSyntaxRegExp._create$ctor = function(pattern, flags) {
  this.re = new RegExp(pattern, flags);
      this.pattern = pattern;
      this.multiLine = this.re.multiline;
      this.ignoreCase = this.re.ignoreCase;
}
JSSyntaxRegExp._create$ctor.prototype = JSSyntaxRegExp.prototype;
JSSyntaxRegExp.prototype.is$RegExp = function(){return true};
JSSyntaxRegExp.prototype.assert$RegExp = function(){return this};
JSSyntaxRegExp.prototype.assert$Pattern = function(){return this};
JSSyntaxRegExp.prototype.firstMatch = function(str) {
  var $0;
  var m = this._exec(str);
  return (($0 = m == null ? null : new MatchImplementation(this.pattern, str, this._matchStart(m), this.get$_lastIndex(), m)) == null ? null : $0.assert$Match());
}
JSSyntaxRegExp.prototype._exec = function(str) {
  return this.re.exec(str);
}
JSSyntaxRegExp.prototype._matchStart = function(m) {
  return m.index;
}
JSSyntaxRegExp.prototype.get$_lastIndex = function() {
  return this.re.lastIndex;
}
JSSyntaxRegExp.prototype.hasMatch = function(str) {
  return this.re.test(str);
}
JSSyntaxRegExp.prototype.allMatches = function(str) {
  return new _AllMatchesIterable(this, str);
}
JSSyntaxRegExp.prototype.get$_global = function() {
  return new JSSyntaxRegExp._create$ctor(this.pattern, $add$($add$("g", (this.multiLine ? "m" : "")), (this.ignoreCase ? "i" : "")));
}
function MatchImplementation(pattern, str, _start, _end, _groups) {
  this.pattern = pattern;
  this.str = str;
  this._start = _start;
  this._end = _end;
  this._groups = _groups;
}
MatchImplementation.prototype.assert$Match = function(){return this};
MatchImplementation.prototype.start = function() {
  return this._start;
}
MatchImplementation.prototype.end = function() {
  return this._end;
}
MatchImplementation.prototype.$index = function(groupIndex) {
  return $assert_String(this._groups.$index(groupIndex));
}
MatchImplementation.prototype.end$0 = MatchImplementation.prototype.end;
MatchImplementation.prototype.start$0 = MatchImplementation.prototype.start;
function _AllMatchesIterable(_re, _str) {
  this._re = _re;
  this._str = _str;
}
_AllMatchesIterable.prototype.assert$Iterable = function(){return this};
_AllMatchesIterable.prototype.iterator = function() {
  return new _AllMatchesIterator(this._re, this._str);
}
function _AllMatchesIterator(re, _str) {
  this._str = _str;
  this._done = false;
  this._re = re.get$_global();
}
_AllMatchesIterator.prototype.assert$Iterator = function(){return this};
_AllMatchesIterator.prototype.assert$Iterator_dart_core_String = function(){$throw(new TypeError._internal$ctor(this, "Iterator<dart:core.String>"))};
_AllMatchesIterator.prototype.assert$Iterator_Element = function(){$throw(new TypeError._internal$ctor(this, "Iterator<html.Element>"))};
_AllMatchesIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  var result = this._next;
  this._next = null;
  return (result == null ? null : result.assert$Match());
}
_AllMatchesIterator.prototype.hasNext = function() {
  if (this._done) {
    return false;
  }
  else if (this._next != null) {
    return true;
  }
  this._next = this._re.firstMatch(this._str);
  if (this._next == null) {
    this._done = true;
    return false;
  }
  else {
    return true;
  }
}
var NumImplementation = Number;
NumImplementation.prototype.isNaN = function() {
  'use strict'; return isNaN(this);
}
NumImplementation.prototype.isNegative = function() {
  'use strict'; return this == 0 ? (1 / this) < 0 : this < 0;
}
NumImplementation.prototype.hashCode = function() {
  'use strict'; return this & 0x1FFFFFFF;
}
NumImplementation.prototype.toDouble = function() {
  'use strict'; return this + 0;
}
NumImplementation.prototype.compareTo = function(other) {
  var thisValue = this.toDouble();
  if (thisValue < other) {
    return (-1);
  }
  else if (thisValue > other) {
    return (1);
  }
  else if (thisValue == other) {
    if (thisValue == (0)) {
      var thisIsNegative = this.isNegative();
      var otherIsNegative = other.isNegative();
      if ($eq$(thisIsNegative, otherIsNegative)) return (0);
      if (thisIsNegative) return (-1);
      return (1);
    }
    return (0);
  }
  else if (this.isNaN()) {
    if (other.isNaN()) {
      return (0);
    }
    return (1);
  }
  else {
    return (-1);
  }
}
NumImplementation.prototype.compareTo$1 = function($0) {
  return this.compareTo($assert_num($0));
};
function Collections() {}
Collections.collectionToString = function(c) {
  var result = new StringBufferImpl("");
  Collections._emitCollection(c, (result == null ? null : result.assert$StringBuffer()), new Array());
  return $assert_String(result.toString());
}
Collections._emitCollection = function(c, result, visiting) {
  visiting.add$1(c);
  var isList = !!(c && c.is$List());
  result.add(isList ? "[" : "{");
  var first = true;
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(e, result, visiting);
  }
  result.add(isList ? "]" : "}");
  visiting.removeLast();
}
Collections._emitObject = function(o, result, visiting) {
  if (!!(o && o.is$Collection())) {
    if ($notnull_bool(Collections._containsRef(visiting, o))) {
      result.add(!!(o && o.is$List()) ? "[...]" : "{...}");
    }
    else {
      Collections._emitCollection((o == null ? null : o.assert$Collection()), result, visiting);
    }
  }
  else if (!!(o && o.is$Map())) {
    if ($notnull_bool(Collections._containsRef(visiting, o))) {
      result.add("{...}");
    }
    else {
      Maps._emitMap((o == null ? null : o.assert$Map()), result, visiting);
    }
  }
  else {
    result.add($eq$(o) ? "null" : o);
  }
}
Collections._containsRef = function(c, ref) {
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if ((null == e ? null == (ref) : e === ref)) return true;
  }
  return false;
}
function HashMapImplementation() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation.prototype.is$Map = function(){return true};
HashMapImplementation.prototype.assert$Map = function(){return this};
HashMapImplementation._computeLoadLimit = function(capacity) {
  return $truncdiv$((capacity * (3)), (4));
}
HashMapImplementation._firstProbe = function(hashCode, length) {
  return hashCode & (length - (1));
}
HashMapImplementation._nextProbe = function(currentProbe, numberOfProbes, length) {
  return (currentProbe + numberOfProbes) & (length - (1));
}
HashMapImplementation.prototype._probeForAdding = function(key) {
  var hash = HashMapImplementation._firstProbe(key.hashCode(), this._keys.get$length());
  var numberOfProbes = (1);
  var initialHash = hash;
  var insertionIndex = (-1);
  while (true) {
    var existingKey = this._keys.$index(hash);
    if (null == existingKey) {
      if (insertionIndex < (0)) return hash;
      return insertionIndex;
    }
    else if ($eq$(existingKey, key)) {
      return hash;
    }
    else if ((insertionIndex < (0)) && ((null == const$0000 ? null == (existingKey) : const$0000 === existingKey))) {
      insertionIndex = hash;
    }
    hash = HashMapImplementation._nextProbe(hash, numberOfProbes++, this._keys.get$length());
  }
}
HashMapImplementation.prototype._probeForLookup = function(key) {
  var hash = HashMapImplementation._firstProbe(key.hashCode(), this._keys.get$length());
  var numberOfProbes = (1);
  var initialHash = hash;
  while (true) {
    var existingKey = this._keys.$index(hash);
    if (null == existingKey) return (-1);
    if ($eq$(existingKey, key)) return hash;
    hash = HashMapImplementation._nextProbe(hash, numberOfProbes++, this._keys.get$length());
  }
}
HashMapImplementation.prototype._ensureCapacity = function() {
  var newNumberOfEntries = this._numberOfEntries + (1);
  if (newNumberOfEntries >= this._loadLimit) {
    this._grow(this._keys.get$length() * (2));
    return;
  }
  var capacity = this._keys.get$length();
  var numberOfFreeOrDeleted = capacity - newNumberOfEntries;
  var numberOfFree = numberOfFreeOrDeleted - this._numberOfDeleted;
  if (this._numberOfDeleted > numberOfFree) {
    this._grow(this._keys.get$length());
  }
}
HashMapImplementation._isPowerOfTwo = function(x) {
  return ((x & (x - (1))) == (0));
}
HashMapImplementation.prototype._grow = function(newCapacity) {
  _assert(HashMapImplementation._isPowerOfTwo(newCapacity), "_isPowerOfTwo(newCapacity)", "/Applications/dart/dart-sdk/lib/coreimpl/frog/hash_map_set.dart", (148), (12));
  var capacity = this._keys.get$length();
  this._loadLimit = HashMapImplementation._computeLoadLimit(newCapacity);
  var oldKeys = this._keys;
  var oldValues = this._values;
  this._keys = new Array(newCapacity);
  this._values = new Array(newCapacity);
  for (var i = (0);
   i < capacity; i++) {
    var key = oldKeys.$index(i);
    if (null == key || (null == key ? null == (const$0000) : key === const$0000)) {
      continue;
    }
    var value = oldValues.$index(i);
    var newIndex = this._probeForAdding(key);
    this._keys.$setindex(newIndex, key);
    this._values.$setindex(newIndex, value);
  }
  this._numberOfDeleted = (0);
}
HashMapImplementation.prototype.clear$_ = function() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  var length = this._keys.get$length();
  for (var i = (0);
   i < length; i++) {
    this._keys.$setindex(i);
    this._values.$setindex(i);
  }
}
HashMapImplementation.prototype.$setindex = function(key, value) {
  var $0;
  this._ensureCapacity();
  var index = this._probeForAdding(key);
  if ((null == this._keys.$index(index)) || ((($0 = this._keys.$index(index)) == null ? null == (const$0000) : $0 === const$0000))) {
    this._numberOfEntries++;
  }
  this._keys.$setindex(index, key);
  this._values.$setindex(index, value);
}
HashMapImplementation.prototype.$index = function(key) {
  var index = this._probeForLookup(key);
  if (index < (0)) return null;
  return this._values.$index(index);
}
HashMapImplementation.prototype.remove = function(key) {
  var index = this._probeForLookup(key);
  if (index >= (0)) {
    this._numberOfEntries--;
    var value = this._values.$index(index);
    this._values.$setindex(index);
    this._keys.$setindex(index, const$0000);
    this._numberOfDeleted++;
    return value;
  }
  return null;
}
HashMapImplementation.prototype.get$length = function() {
  return this._numberOfEntries;
}
HashMapImplementation.prototype.forEach = function(f) {
  var length = this._keys.get$length();
  for (var i = (0);
   i < length; i++) {
    var key = this._keys.$index(i);
    if ((null != key) && ((null == key ? null != (const$0000) : key !== const$0000))) {
      f(key, this._values.$index(i));
    }
  }
}
HashMapImplementation.prototype.getKeys = function() {
  var list = new Array(this.get$length());
  var i = (0);
  this.forEach(function _(key, value) {
    list.$setindex(i++, key);
  }
  );
  return list;
}
HashMapImplementation.prototype.containsKey = function(key) {
  return (this._probeForLookup(key) != (-1));
}
HashMapImplementation.prototype.toString = function() {
  return Maps.mapToString(this);
}
HashMapImplementation.prototype.clear$0 = HashMapImplementation.prototype.clear$_;
HashMapImplementation.prototype.containsKey$1 = HashMapImplementation.prototype.containsKey;
HashMapImplementation.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
HashMapImplementation.prototype.remove$1 = HashMapImplementation.prototype.remove;
$inherits(HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair, HashMapImplementation);
function HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.clear$0 = HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.clear$_;
HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.containsKey$1 = HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.containsKey;
HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.remove$1 = HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.remove;
$inherits(HashMapImplementation_dart_core_String$dart_core_String, HashMapImplementation);
function HashMapImplementation_dart_core_String$dart_core_String() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation_dart_core_String$dart_core_String.prototype.clear$0 = HashMapImplementation_dart_core_String$dart_core_String.prototype.clear$_;
HashMapImplementation_dart_core_String$dart_core_String.prototype.containsKey$1 = function($0) {
  return this.containsKey($assert_String($0));
};
HashMapImplementation_dart_core_String$dart_core_String.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
HashMapImplementation_dart_core_String$dart_core_String.prototype.remove$1 = function($0) {
  return this.remove($assert_String($0));
};
function HashSetImplementation() {
  this._backingMap = new HashMapImplementation();
}
HashSetImplementation.prototype.assert$Set_dart_core_String = function(){return this};
HashSetImplementation.prototype.is$Collection = function(){return true};
HashSetImplementation.prototype.assert$Collection = function(){return this};
HashSetImplementation.prototype.assert$Collection_Object = function(){return this};
HashSetImplementation.prototype.assert$Collection_String = function(){return this};
HashSetImplementation.prototype.assert$Collection_int = function(){return this};
HashSetImplementation.prototype.assert$Collection_num = function(){return this};
HashSetImplementation.prototype.assert$Collection_Element = function(){return this};
HashSetImplementation.prototype.assert$Collection_File = function(){return this};
HashSetImplementation.prototype.assert$dart_core_Collection_Node = function(){return this};
HashSetImplementation.prototype.assert$Collection_StyleSheet = function(){return this};
HashSetImplementation.prototype.assert$Collection_Touch = function(){return this};
HashSetImplementation.prototype.assert$Collection__NodeImpl = function(){return this};
HashSetImplementation.prototype.assert$Iterable = function(){return this};
HashSetImplementation.prototype.clear$_ = function() {
  this._backingMap.clear$_();
}
HashSetImplementation.prototype.add = function(value) {
  this._backingMap.$setindex(value, value);
}
HashSetImplementation.prototype.contains = function(value) {
  return this._backingMap.containsKey(value);
}
HashSetImplementation.prototype.remove = function(value) {
  if (!this._backingMap.containsKey(value)) return false;
  this._backingMap.remove(value);
  return true;
}
HashSetImplementation.prototype.addAll = function(collection) {
  var $this = this;
  collection.forEach$1(function _(value) {
    $this.add(value);
  }
  );
}
HashSetImplementation.prototype.forEach = function(f) {
  this._backingMap.forEach(function _(key, value) {
    f(key);
  }
  );
}
HashSetImplementation.prototype.filter = function(f) {
  var result = new HashSetImplementation();
  this._backingMap.forEach(function _(key, value) {
    if (f(key)) result.add$1(key);
  }
  );
  return result;
}
HashSetImplementation.prototype.get$length = function() {
  return this._backingMap.get$length();
}
HashSetImplementation.prototype.iterator = function() {
  return new HashSetIterator(this);
}
HashSetImplementation.prototype.toString = function() {
  return Collections.collectionToString(this);
}
HashSetImplementation.prototype.add$1 = HashSetImplementation.prototype.add;
HashSetImplementation.prototype.addAll$1 = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection()));
};
HashSetImplementation.prototype.clear$0 = HashSetImplementation.prototype.clear$_;
HashSetImplementation.prototype.contains$1 = HashSetImplementation.prototype.contains;
HashSetImplementation.prototype.filter$1 = function($0) {
  return this.filter(to$call$1($0));
};
HashSetImplementation.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$1($0));
};
HashSetImplementation.prototype.remove$1 = HashSetImplementation.prototype.remove;
$inherits(HashSetImplementation_dart_core_String, HashSetImplementation);
function HashSetImplementation_dart_core_String() {
  this._backingMap = new HashMapImplementation_dart_core_String$dart_core_String();
}
HashSetImplementation_dart_core_String.prototype.assert$Collection_int = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
HashSetImplementation_dart_core_String.prototype.assert$Collection_num = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
HashSetImplementation_dart_core_String.prototype.assert$Collection_Element = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
HashSetImplementation_dart_core_String.prototype.assert$Collection_File = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
HashSetImplementation_dart_core_String.prototype.assert$dart_core_Collection_Node = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
HashSetImplementation_dart_core_String.prototype.assert$Collection_StyleSheet = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
HashSetImplementation_dart_core_String.prototype.assert$Collection_Touch = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
HashSetImplementation_dart_core_String.prototype.assert$Collection__NodeImpl = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
HashSetImplementation_dart_core_String.prototype.contains$1 = function($0) {
  return this.contains($assert_String($0));
};
function HashSetIterator(set_) {
  this._nextValidIndex = (-1);
  this._entries = set_._backingMap._keys;
  this._advance();
}
HashSetIterator.prototype.assert$Iterator = function(){return this};
HashSetIterator.prototype.assert$Iterator_dart_core_String = function(){return this};
HashSetIterator.prototype.assert$Iterator_Element = function(){return this};
HashSetIterator.prototype.hasNext = function() {
  var $0;
  if (this._nextValidIndex >= this._entries.get$length()) return false;
  if ((($0 = this._entries.$index(this._nextValidIndex)) == null ? null == (const$0000) : $0 === const$0000)) {
    this._advance();
  }
  return this._nextValidIndex < this._entries.get$length();
}
HashSetIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  var res = this._entries.$index(this._nextValidIndex);
  this._advance();
  return res;
}
HashSetIterator.prototype._advance = function() {
  var length = this._entries.get$length();
  var entry;
  var deletedKey = const$0000;
  do {
    if (++this._nextValidIndex >= length) break;
    entry = this._entries.$index(this._nextValidIndex);
  }
  while ((null == entry) || ((null == entry ? null == (deletedKey) : entry === deletedKey)))
}
function _DeletedKeySentinel() {

}
function KeyValuePair(key, value) {
  this.key$_ = key;
  this.value = value;
}
KeyValuePair.prototype.assert$KeyValuePair = function(){return this};
KeyValuePair.prototype.get$value = function() { return this.value; };
KeyValuePair.prototype.set$value = function(value) { return this.value = value; };
function LinkedHashMapImplementation() {
  this._map = new HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair();
  this._list = new DoubleLinkedQueue_KeyValuePair();
}
LinkedHashMapImplementation.prototype.is$Map = function(){return true};
LinkedHashMapImplementation.prototype.assert$Map = function(){return this};
LinkedHashMapImplementation.prototype.$setindex = function(key, value) {
  if ($notnull_bool(this._map.containsKey$1(key))) {
    this._map.$index(key).get$element().set$value(value);
  }
  else {
    this._list.addLast(new KeyValuePair(key, value));
    this._map.$setindex(key, this._list.lastEntry());
  }
}
LinkedHashMapImplementation.prototype.$index = function(key) {
  var $0;
  var entry = (($0 = this._map.$index(key)) == null ? null : $0.assert$DoubleLinkedQueueEntry_KeyValuePair());
  if (null == entry) return null;
  return entry.get$element().get$value();
}
LinkedHashMapImplementation.prototype.remove = function(key) {
  var $0;
  var entry = (($0 = this._map.remove$1(key)) == null ? null : $0.assert$DoubleLinkedQueueEntry_KeyValuePair());
  if (null == entry) return null;
  entry.remove();
  return entry.get$element().get$value();
}
LinkedHashMapImplementation.prototype.getKeys = function() {
  var list = new Array(this.get$length());
  var index = (0);
  this._list.forEach(function _(entry) {
    list.$setindex(index++, entry.key$_);
  }
  );
  _assert(index == this.get$length(), "index == length", "/Applications/dart/dart-sdk/lib/coreimpl/frog/linked_hash_map.dart", (74), (12));
  return list;
}
LinkedHashMapImplementation.prototype.forEach = function(f) {
  this._list.forEach(function _(entry) {
    f(entry.key$_, entry.value);
  }
  );
}
LinkedHashMapImplementation.prototype.containsKey = function(key) {
  return $notnull_bool(this._map.containsKey$1(key));
}
LinkedHashMapImplementation.prototype.get$length = function() {
  return this._map.get$length();
}
LinkedHashMapImplementation.prototype.clear$_ = function() {
  this._map.clear$_();
  this._list.clear$_();
}
LinkedHashMapImplementation.prototype.toString = function() {
  return Maps.mapToString(this);
}
LinkedHashMapImplementation.prototype.clear$0 = LinkedHashMapImplementation.prototype.clear$_;
LinkedHashMapImplementation.prototype.containsKey$1 = LinkedHashMapImplementation.prototype.containsKey;
LinkedHashMapImplementation.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
LinkedHashMapImplementation.prototype.remove$1 = LinkedHashMapImplementation.prototype.remove;
function Maps() {}
Maps.mapToString = function(m) {
  var result = new StringBufferImpl("");
  Maps._emitMap(m, (result == null ? null : result.assert$StringBuffer()), new Array());
  return $assert_String(result.toString());
}
Maps._emitMap = function(m, result, visiting) {
  visiting.add$1(m);
  result.add("{");
  var first = true;
  m.forEach$1((function (k, v) {
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(k, result, visiting);
    result.add(": ");
    Collections._emitObject(v, result, visiting);
  })
  );
  result.add("}");
  visiting.removeLast();
}
function DoubleLinkedQueueEntry(e) {
  this._element = e;
}
DoubleLinkedQueueEntry.prototype.assert$DoubleLinkedQueueEntry_KeyValuePair = function(){return this};
DoubleLinkedQueueEntry.prototype._link = function(p, n) {
  this._next = n;
  this._previous = p;
  p._next = this;
  n._previous = this;
}
DoubleLinkedQueueEntry.prototype.prepend = function(e) {
  new DoubleLinkedQueueEntry(e)._link(this._previous, this);
}
DoubleLinkedQueueEntry.prototype.remove = function() {
  this._previous._next = this._next;
  this._next._previous = this._previous;
  this._next = null;
  this._previous = null;
  return this._element;
}
DoubleLinkedQueueEntry.prototype._asNonSentinelEntry = function() {
  return this;
}
DoubleLinkedQueueEntry.prototype.previousEntry = function() {
  return this._previous._asNonSentinelEntry();
}
DoubleLinkedQueueEntry.prototype.get$element = function() {
  return this._element;
}
DoubleLinkedQueueEntry.prototype.remove$0 = DoubleLinkedQueueEntry.prototype.remove;
$inherits(DoubleLinkedQueueEntry_KeyValuePair, DoubleLinkedQueueEntry);
function DoubleLinkedQueueEntry_KeyValuePair(e) {
  this._element = e;
}
DoubleLinkedQueueEntry_KeyValuePair.prototype.remove$0 = DoubleLinkedQueueEntry_KeyValuePair.prototype.remove;
$inherits(_DoubleLinkedQueueEntrySentinel, DoubleLinkedQueueEntry);
function _DoubleLinkedQueueEntrySentinel() {
  DoubleLinkedQueueEntry.call(this, null);
  this._link(this, this);
}
_DoubleLinkedQueueEntrySentinel.prototype.remove = function() {
  $throw(const$0002);
}
_DoubleLinkedQueueEntrySentinel.prototype._asNonSentinelEntry = function() {
  return null;
}
_DoubleLinkedQueueEntrySentinel.prototype.get$element = function() {
  $throw(const$0002);
}
_DoubleLinkedQueueEntrySentinel.prototype.remove$0 = _DoubleLinkedQueueEntrySentinel.prototype.remove;
$inherits(_DoubleLinkedQueueEntrySentinel_KeyValuePair, _DoubleLinkedQueueEntrySentinel);
function _DoubleLinkedQueueEntrySentinel_KeyValuePair() {
  DoubleLinkedQueueEntry_KeyValuePair.call(this, null);
  this._link(this, this);
}
function DoubleLinkedQueue() {
  this._sentinel = new _DoubleLinkedQueueEntrySentinel();
}
DoubleLinkedQueue.prototype.is$Collection = function(){return true};
DoubleLinkedQueue.prototype.assert$Collection = function(){return this};
DoubleLinkedQueue.prototype.assert$Collection_Object = function(){return this};
DoubleLinkedQueue.prototype.assert$Collection_String = function(){return this};
DoubleLinkedQueue.prototype.assert$Collection_int = function(){return this};
DoubleLinkedQueue.prototype.assert$Collection_num = function(){return this};
DoubleLinkedQueue.prototype.assert$Collection_Element = function(){return this};
DoubleLinkedQueue.prototype.assert$Collection_File = function(){return this};
DoubleLinkedQueue.prototype.assert$dart_core_Collection_Node = function(){return this};
DoubleLinkedQueue.prototype.assert$Collection_StyleSheet = function(){return this};
DoubleLinkedQueue.prototype.assert$Collection_Touch = function(){return this};
DoubleLinkedQueue.prototype.assert$Collection__NodeImpl = function(){return this};
DoubleLinkedQueue.prototype.assert$Iterable = function(){return this};
DoubleLinkedQueue.prototype.addLast = function(value) {
  this._sentinel.prepend(value);
}
DoubleLinkedQueue.prototype.add = function(value) {
  this.addLast(value);
}
DoubleLinkedQueue.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    this.add(e);
  }
}
DoubleLinkedQueue.prototype.lastEntry = function() {
  return this._sentinel.previousEntry();
}
DoubleLinkedQueue.prototype.get$length = function() {
  var counter = (0);
  this.forEach(function _(element) {
    counter++;
  }
  );
  return counter;
}
DoubleLinkedQueue.prototype.clear$_ = function() {
  this._sentinel._next = this._sentinel;
  this._sentinel._previous = this._sentinel;
}
DoubleLinkedQueue.prototype.forEach = function(f) {
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    f(entry._element);
    entry = nextEntry;
  }
}
DoubleLinkedQueue.prototype.filter = function(f) {
  var other = new DoubleLinkedQueue();
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    if (f(entry._element)) other.addLast$1(entry._element);
    entry = nextEntry;
  }
  return other;
}
DoubleLinkedQueue.prototype.iterator = function() {
  return new _DoubleLinkedQueueIterator(this._sentinel);
}
DoubleLinkedQueue.prototype.toString = function() {
  return Collections.collectionToString(this);
}
DoubleLinkedQueue.prototype.add$1 = DoubleLinkedQueue.prototype.add;
DoubleLinkedQueue.prototype.addAll$1 = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection()));
};
DoubleLinkedQueue.prototype.addLast$1 = DoubleLinkedQueue.prototype.addLast;
DoubleLinkedQueue.prototype.clear$0 = DoubleLinkedQueue.prototype.clear$_;
DoubleLinkedQueue.prototype.filter$1 = function($0) {
  return this.filter(to$call$1($0));
};
DoubleLinkedQueue.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$1($0));
};
$inherits(DoubleLinkedQueue_KeyValuePair, DoubleLinkedQueue);
function DoubleLinkedQueue_KeyValuePair() {
  this._sentinel = new _DoubleLinkedQueueEntrySentinel_KeyValuePair();
}
DoubleLinkedQueue_KeyValuePair.prototype.assert$Collection_String = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
DoubleLinkedQueue_KeyValuePair.prototype.assert$Collection_int = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
DoubleLinkedQueue_KeyValuePair.prototype.assert$Collection_num = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
DoubleLinkedQueue_KeyValuePair.prototype.assert$Collection_Element = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
DoubleLinkedQueue_KeyValuePair.prototype.assert$Collection_File = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
DoubleLinkedQueue_KeyValuePair.prototype.assert$dart_core_Collection_Node = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
DoubleLinkedQueue_KeyValuePair.prototype.assert$Collection_StyleSheet = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
DoubleLinkedQueue_KeyValuePair.prototype.assert$Collection_Touch = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
DoubleLinkedQueue_KeyValuePair.prototype.assert$Collection__NodeImpl = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
DoubleLinkedQueue_KeyValuePair.prototype.addLast$1 = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$KeyValuePair()));
};
DoubleLinkedQueue_KeyValuePair.prototype.clear$0 = DoubleLinkedQueue_KeyValuePair.prototype.clear$_;
function _DoubleLinkedQueueIterator(_sentinel) {
  this._sentinel = _sentinel;
  this._currentEntry = this._sentinel;
}
_DoubleLinkedQueueIterator.prototype.assert$Iterator = function(){return this};
_DoubleLinkedQueueIterator.prototype.assert$Iterator_dart_core_String = function(){return this};
_DoubleLinkedQueueIterator.prototype.assert$Iterator_Element = function(){return this};
_DoubleLinkedQueueIterator.prototype.hasNext = function() {
  var $0;
  return (($0 = this._currentEntry._next) == null ? null != (this._sentinel) : $0 !== this._sentinel);
}
_DoubleLinkedQueueIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  this._currentEntry = this._currentEntry._next;
  return this._currentEntry.get$element();
}
function StringBufferImpl(content) {
  this.clear$_();
  this.add(content);
}
StringBufferImpl.prototype.assert$StringBuffer = function(){return this};
StringBufferImpl.prototype.get$length = function() {
  return this._length;
}
StringBufferImpl.prototype.add = function(obj) {
  var str = $assert_String(obj.toString());
  if (null == str || str.isEmpty()) return this;
  this._buffer.add(str);
  this._length = this._length + str.length;
  return this;
}
StringBufferImpl.prototype.addAll = function(objects) {
  for (var $$i = objects.iterator(); $$i.hasNext(); ) {
    var obj = $$i.next();
    this.add(obj);
  }
  return this;
}
StringBufferImpl.prototype.clear$_ = function() {
  this._buffer = new Array();
  this._length = (0);
  return this;
}
StringBufferImpl.prototype.toString = function() {
  if (this._buffer.get$length() == (0)) return "";
  if (this._buffer.get$length() == (1)) return $assert_String(this._buffer.$index((0)));
  var result = StringBase.concatAll(this._buffer);
  this._buffer.clear$_();
  this._buffer.add(result);
  return result;
}
StringBufferImpl.prototype.add$1 = StringBufferImpl.prototype.add;
StringBufferImpl.prototype.addAll$1 = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_Object()));
};
StringBufferImpl.prototype.clear$0 = StringBufferImpl.prototype.clear$_;
function StringBase() {}
StringBase.createFromCharCodes = function(charCodes) {
  if (Object.getPrototypeOf(charCodes) !== Array.prototype) {
    charCodes = new ListFactory.ListFactory$from$factory(charCodes);
  }
  return String.fromCharCode.apply(null, charCodes);
}
StringBase.join = function(strings, separator) {
  if (strings.get$length() == (0)) return "";
  var s = $assert_String(strings.$index((0)));
  for (var i = (1);
   i < strings.get$length(); i++) {
    s = $add$($add$(s, separator), strings.$index(i));
  }
  return s;
}
StringBase.concatAll = function(strings) {
  return StringBase.join(strings, "");
}
var StringImplementation = String;
StringImplementation.prototype.assert$Pattern = function(){return String(this)};
StringImplementation.prototype.get$length = function() { return this.length; };
StringImplementation.prototype.endsWith = function(other) {
    'use strict';
    if (other.length > this.length) return false;
    return other == this.substring(this.length - other.length);
}
StringImplementation.prototype.startsWith = function(other) {
    'use strict';
    if (other.length > this.length) return false;
    return other == this.substring(0, other.length);
}
StringImplementation.prototype.isEmpty = function() {
  return this.length == (0);
}
StringImplementation.prototype.contains = function(pattern, startIndex) {
  'use strict'; return this.indexOf(pattern, startIndex) >= 0;
}
StringImplementation.prototype._replaceRegExp = function(from, to) {
  'use strict';return this.replace(from.re, to);
}
StringImplementation.prototype._replaceAll = function(from, to) {
  'use strict';
  from = new RegExp(from.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'g');
  to = to.replace(/\$/g, '$$$$'); // Escape sequences are fun!
  return this.replace(from, to);
}
StringImplementation.prototype.replaceAll = function(from, to) {
  if ((typeof(from) == 'string')) return this._replaceAll($assert_String(from), to);
  if (!!(from && from.is$RegExp())) return this._replaceRegExp(from.get$dynamic().get$_global(), to);
  var buffer = new StringBufferImpl("");
  var lastMatchEnd = (0);
  var $$list = from.allMatches(this);
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var match = $$i.next();
    buffer.add$1(this.substring($assert_num(lastMatchEnd), $assert_num(match.start$0())));
    buffer.add$1(to);
    lastMatchEnd = match.end$0();
  }
  buffer.add$1(this.substring($assert_num(lastMatchEnd)));
}
StringImplementation.prototype.split$_ = function(pattern) {
  if ((typeof(pattern) == 'string')) return this._split($assert_String(pattern));
  if (!!(pattern && pattern.is$RegExp())) return this._splitRegExp((pattern == null ? null : pattern.assert$RegExp()));
  $throw("String.split(Pattern) unimplemented.");
}
StringImplementation.prototype._split = function(pattern) {
  'use strict'; return this.split(pattern);
}
StringImplementation.prototype._splitRegExp = function(pattern) {
  'use strict'; return this.split(pattern.re);
}
StringImplementation.prototype.allMatches = function(str) {
  $throw("String.allMatches(String str) unimplemented.");
}
StringImplementation.prototype.hashCode = function() {
      'use strict';
      var hash = 0;
      for (var i = 0; i < this.length; i++) {
        hash = 0x1fffffff & (hash + this.charCodeAt(i));
        hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
        hash ^= hash >> 6;
      }

      hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
      hash ^= hash >> 11;
      return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
}
StringImplementation.prototype.compareTo = function(other) {
  'use strict'; return this == other ? 0 : this < other ? -1 : 1;
}
StringImplementation.prototype.compareTo$1 = function($0) {
  return this.compareTo($assert_String($0));
};
StringImplementation.prototype.contains$1 = function($0) {
  return this.contains(($0 == null ? null : $0.assert$Pattern()));
};
$inherits(_ArgumentMismatchException, ClosureArgumentMismatchException);
function _ArgumentMismatchException(_message) {
  this._dart_coreimpl_message = _message;
  ClosureArgumentMismatchException.call(this);
}
_ArgumentMismatchException.prototype.toString = function() {
  return ("Closure argument mismatch: " + this._dart_coreimpl_message);
}
var _FunctionImplementation = Function;
_FunctionImplementation.prototype._genStub = function(argsLength, names) {
      // Fast path #1: if no named arguments and arg count matches.
      var thisLength = this.$length || this.length;
      if (thisLength == argsLength && !names) {
        return this;
      }

      var paramsNamed = this.$optional ? (this.$optional.length / 2) : 0;
      var paramsBare = thisLength - paramsNamed;
      var argsNamed = names ? names.length : 0;
      var argsBare = argsLength - argsNamed;

      // Check we got the right number of arguments
      if (argsBare < paramsBare || argsLength > thisLength ||
          argsNamed > paramsNamed) {
        return function() {
          $throw(new _ArgumentMismatchException(
            'Wrong number of arguments to function. Expected ' + paramsBare +
            ' positional arguments and at most ' + paramsNamed +
            ' named arguments, but got ' + argsBare +
            ' positional arguments and ' + argsNamed + ' named arguments.'));
        };
      }

      // First, fill in all of the default values
      var p = new Array(paramsBare);
      if (paramsNamed) {
        p = p.concat(this.$optional.slice(paramsNamed));
      }
      // Fill in positional args
      var a = new Array(argsLength);
      for (var i = 0; i < argsBare; i++) {
        p[i] = a[i] = '$' + i;
      }
      // Then overwrite with supplied values for optional args
      var lastParameterIndex;
      var namesInOrder = true;
      for (var i = 0; i < argsNamed; i++) {
        var name = names[i];
        a[i + argsBare] = name;
        var j = this.$optional.indexOf(name);
        if (j < 0 || j >= paramsNamed) {
          return function() {
            $throw(new _ArgumentMismatchException(
              'Named argument "' + name + '" was not expected by function.' +
              ' Did you forget to mark the function parameter [optional]?'));
          };
        } else if (lastParameterIndex && lastParameterIndex > j) {
          namesInOrder = false;
        }
        p[j + paramsBare] = name;
        lastParameterIndex = j;
      }

      if (thisLength == argsLength && namesInOrder) {
        // Fast path #2: named arguments, but they're in order and all supplied.
        return this;
      }

      // Note: using Function instead of 'eval' to get a clean scope.
      // TODO(jmesserly): evaluate the performance of these stubs.
      var f = 'function(' + a.join(',') + '){return $f(' + p.join(',') + ');}';
      return new Function('$f', 'return ' + f + '').call(null, this);
    
}
function _map(itemsAndKeys) {
  var ret = new LinkedHashMapImplementation();
  for (var i = (0);
   i < itemsAndKeys.get$length(); ) {
    ret.$setindex(itemsAndKeys.$index(i++), itemsAndKeys.$index(i++));
  }
  return ret;
}
function _constMap(itemsAndKeys) {
  return new ImmutableMap(itemsAndKeys);
}
$dynamic("get$on").EventTarget = function() {
  return new _EventsImpl(this);
}
$dynamic("$dom_addEventListener$3").EventTarget = function($0, $1, $2) {
  if (Object.getPrototypeOf(this).hasOwnProperty("$dom_addEventListener$3")) {
    return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
  }
  return Object.prototype.$dom_addEventListener$3.call(this, $0, $1, $2);
};
$dynamic("$dom_removeEventListener$3").EventTarget = function($0, $1, $2) {
  if (Object.getPrototypeOf(this).hasOwnProperty("$dom_removeEventListener$3")) {
    return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
  }
  return Object.prototype.$dom_removeEventListener$3.call(this, $0, $1, $2);
};
$dynamic("assert$_NodeImpl").Node = function(){return this};
$dynamic("assert$html_Node").Node = function(){return this};
$dynamic("get$nodes").Node = function() {
  return new _ChildNodeListLazy(this);
}
$dynamic("remove").Node = function() {
  var $0;
  if ($ne$(this.get$parent())) {
    var parent = (($0 = this.get$parent()) == null ? null : $0.assert$_NodeImpl());
    parent.removeChild(this);
  }
  return this;
}
$dynamic("replaceWith").Node = function(otherNode) {
  var $0;
  try {
    var parent = (($0 = this.get$parent()) == null ? null : $0.assert$_NodeImpl());
    parent.replaceChild((otherNode == null ? null : otherNode.assert$_NodeImpl()), this);
  } catch (e) {
    e = _toDartException(e);
  }
  ;
  return this;
}
$dynamic("get$$$dom_attributes").Node = function() {
  return this.attributes;
}
$dynamic("get$$$dom_childNodes").Node = function() {
  return this.childNodes;
}
$dynamic("get$parent").Node = function() {
  return this.parentNode;
}
$dynamic("get$text").Node = function() {
  return this.textContent;
}
$dynamic("set$text").Node = function(value) {
  this.textContent = value;
}
$dynamic("$dom_addEventListener$3").Node = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").Node = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("contains$1").Node = function($0) {
  return this.contains(($0 == null ? null : $0.assert$_NodeImpl()));
};
$dynamic("remove$0").Node = function() {
  return this.remove();
};
$dynamic("assert$_ElementImpl").Element = function(){return this};
$dynamic("is$html_Element").Element = function(){return true};
$dynamic("assert$html_Element").Element = function(){return this};
$dynamic("get$attributes").Element = function() {
  return new _ElementAttributeMap(this);
}
$dynamic("get$elements").Element = function() {
  return new _ChildrenElementList._wrap$ctor(this);
}
$dynamic("queryAll").Element = function(selectors) {
  return new _FrozenElementList._wrap$ctor(this.querySelectorAll(selectors));
}
$dynamic("get$classes").Element = function() {
  return new _CssClassSet(this);
}
$dynamic("get$dataAttributes").Element = function() {
  return new _DataAttributeMap(this.get$attributes());
}
$dynamic("get$on").Element = function() {
  return new _ElementEventsImpl(this);
}
$dynamic("get$$$dom_children").Element = function() {
  return this.children;
}
$dynamic("get$$$dom_className").Element = function() {
  return this.className;
}
$dynamic("set$$$dom_className").Element = function(value) {
  this.className = value;
}
$dynamic("get$$$dom_firstElementChild").Element = function() {
  return this.firstElementChild;
}
$dynamic("set$innerHTML").Element = function(value) { return this.innerHTML = value; };
$dynamic("get$$$dom_lastElementChild").Element = function() {
  return this.lastElementChild;
}
$dynamic("get$click").Element = function() {
  return this.click.bind(this);
}
$dynamic("query$1").Element = function($0) {
  return this.querySelector($assert_String($0));
};
$dynamic("get$on").AbstractWorker = function() {
  return new _AbstractWorkerEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").AbstractWorker = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").AbstractWorker = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
function _EventsImpl(_ptr) {
  this._ptr = _ptr;
}
_EventsImpl.prototype.get$_ptr = function() { return this._ptr; };
_EventsImpl.prototype.$index = function(type) {
  return this._get(type.toLowerCase());
}
_EventsImpl.prototype._get = function(type) {
  return new _EventListenerListImpl(this._ptr, type);
}
$inherits(_AbstractWorkerEventsImpl, _EventsImpl);
function _AbstractWorkerEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLAnchorElement = function() { return this.name; };
$dynamic("get$name").WebKitAnimation = function() { return this.name; };
$dynamic("get$length").WebKitAnimationList = function() { return this.length; };
$dynamic("get$name").HTMLAppletElement = function() { return this.name; };
$dynamic("get$name").Attr = function() { return this.name; };
$dynamic("get$value").Attr = function() { return this.value; };
$dynamic("set$value").Attr = function(value) { return this.value = value; };
$dynamic("get$length").AudioBuffer = function() { return this.length; };
$dynamic("get$on").AudioContext = function() {
  return new _AudioContextEventsImpl(this);
}
$inherits(_AudioContextEventsImpl, _EventsImpl);
function _AudioContextEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").HTMLMediaElement = function() {
  return new _MediaElementEventsImpl(this);
}
$dynamic("get$readyState").HTMLMediaElement = function() { return this.readyState; };
$dynamic("get$name").AudioParam = function() { return this.name; };
$dynamic("get$value").AudioParam = function() { return this.value; };
$dynamic("set$value").AudioParam = function(value) { return this.value = value; };
$dynamic("get$on").BatteryManager = function() {
  return new _BatteryManagerEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").BatteryManager = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").BatteryManager = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_BatteryManagerEventsImpl, _EventsImpl);
function _BatteryManagerEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").HTMLBodyElement = function() {
  return new _BodyElementEventsImpl(this);
}
$inherits(_ElementEventsImpl, _EventsImpl);
function _ElementEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_ElementEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
$inherits(_BodyElementEventsImpl, _ElementEventsImpl);
function _BodyElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLButtonElement = function() { return this.name; };
$dynamic("get$value").HTMLButtonElement = function() { return this.value; };
$dynamic("set$value").HTMLButtonElement = function(value) { return this.value = value; };
$dynamic("get$length").CharacterData = function() { return this.length; };
$dynamic("get$name").WebKitCSSKeyframesRule = function() { return this.name; };
$dynamic("get$length").CSSRuleList = function() { return this.length; };
$dynamic("get$length").CSSStyleDeclaration = function() { return this.length; };
$dynamic("assert$html_StyleSheet").StyleSheet = function(){return this};
$dynamic("get$length").CSSValueList = function() { return this.length; };
$dynamic("assert$html_ClientRect").ClientRect = function(){return this};
$dynamic("get$length").ClientRectList = function() { return this.length; };
var _ConsoleImpl = (typeof console == 'undefined' ? {} : console);
$dynamic("get$on").DOMApplicationCache = function() {
  return new _DOMApplicationCacheEventsImpl(this);
}
$dynamic("get$status").DOMApplicationCache = function() { return this.status; };
$dynamic("$dom_addEventListener$3").DOMApplicationCache = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").DOMApplicationCache = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_DOMApplicationCacheEventsImpl, _EventsImpl);
function _DOMApplicationCacheEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").DOMException = function() { return this.name; };
$dynamic("get$name").DOMFileSystem = function() { return this.name; };
$dynamic("get$name").DOMFileSystemSync = function() { return this.name; };
$dynamic("get$length").DOMMimeTypeArray = function() { return this.length; };
$dynamic("get$length").DOMPlugin = function() { return this.length; };
$dynamic("get$name").DOMPlugin = function() { return this.name; };
$dynamic("get$length").DOMPluginArray = function() { return this.length; };
$dynamic("get$length").DOMTokenList = function() { return this.length; };
$dynamic("add$1").DOMTokenList = function($0) {
  return this.add($assert_String($0));
};
$dynamic("contains$1").DOMTokenList = function($0) {
  return this.contains($assert_String($0));
};
$dynamic("remove$1").DOMTokenList = function($0) {
  return this.remove($assert_String($0));
};
$dynamic("get$value").DOMSettableTokenList = function() { return this.value; };
$dynamic("set$value").DOMSettableTokenList = function(value) { return this.value = value; };
$dynamic("is$List").DOMStringList = function(){return true};
$dynamic("assert$List").DOMStringList = function(){return this};
$dynamic("assert$List_int").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").DOMStringList = function(){return true};
$dynamic("assert$Collection").DOMStringList = function(){return this};
$dynamic("assert$Collection_Object").DOMStringList = function(){return this};
$dynamic("assert$Collection_String").DOMStringList = function(){return this};
$dynamic("assert$Collection_int").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
$dynamic("assert$Collection_Element").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").DOMStringList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").DOMStringList = function(){return this};
$dynamic("get$length").DOMStringList = function() { return this.length; };
$dynamic("$index").DOMStringList = function(index) {
  return this[index];
}
$dynamic("$setindex").DOMStringList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").DOMStringList = function() {
  return new _FixedSizeListIterator_dart_core_String(this);
}
$dynamic("add").DOMStringList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").DOMStringList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").DOMStringList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").DOMStringList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").DOMStringList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").DOMStringList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").DOMStringList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").DOMStringList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").DOMStringList = function($0) {
  return this.add($assert_String($0));
};
$dynamic("addAll$1").DOMStringList = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_String()));
};
$dynamic("addLast$1").DOMStringList = function($0) {
  return this.addLast($assert_String($0));
};
$dynamic("contains$1").DOMStringList = function($0) {
  return this.contains($assert_String($0));
};
$dynamic("filter$1").DOMStringList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").DOMStringList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").DOMStringList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$kind").DataTransferItem = function() { return this.kind; };
$dynamic("get$length").DataTransferItemList = function() { return this.length; };
$dynamic("add$1").DataTransferItemList = function($0) {
  return this.add($0);
};
$dynamic("clear$0").DataTransferItemList = function() {
  return this.clear();
};
$dynamic("get$on").WorkerContext = function() {
  return new _WorkerContextEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").WorkerContext = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").WorkerContext = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("get$on").DedicatedWorkerContext = function() {
  return new _DedicatedWorkerContextEventsImpl(this);
}
$inherits(_WorkerContextEventsImpl, _EventsImpl);
function _WorkerContextEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$inherits(_DedicatedWorkerContextEventsImpl, _WorkerContextEventsImpl);
function _DedicatedWorkerContextEventsImpl(_ptr) {
  _WorkerContextEventsImpl.call(this, _ptr);
}
$dynamic("get$on").DeprecatedPeerConnection = function() {
  return new _DeprecatedPeerConnectionEventsImpl(this);
}
$dynamic("get$readyState").DeprecatedPeerConnection = function() { return this.readyState; };
$dynamic("$dom_addEventListener$3").DeprecatedPeerConnection = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").DeprecatedPeerConnection = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_DeprecatedPeerConnectionEventsImpl, _EventsImpl);
function _DeprecatedPeerConnectionEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").Entry = function() { return this.name; };
$dynamic("remove$1").Entry = function($0) {
  return this.remove($wrap_call$0(to$call$0($0)), $wrap_call$1(to$call$1(null)));
};
$dynamic("get$name").EntrySync = function() { return this.name; };
$dynamic("remove$0").EntrySync = function() {
  return this.remove();
};
$dynamic("is$html_Element").HTMLDocument = function(){return true};
$dynamic("assert$html_Element").HTMLDocument = function(){return this};
$dynamic("get$on").HTMLDocument = function() {
  return new _DocumentEventsImpl(this);
}
$dynamic("get$readyState").HTMLDocument = function() { return this.readyState; };
$dynamic("query").HTMLDocument = function(selectors) {
  if (const$0004.hasMatch(selectors)) {
    return this.getElementById(selectors.substring((1)));
  }
  return this.$dom_querySelector(selectors);
}
$dynamic("$dom_querySelector").HTMLDocument = function(selectors) {
  return this.querySelector(selectors);
}
$dynamic("queryAll").HTMLDocument = function(selectors) {
  if (const$0010.hasMatch(selectors)) {
    var mutableMatches = this.getElementsByName(selectors.substring((7), selectors.length - (2)));
    var len = mutableMatches.get$length();
    var copyOfMatches = new Array(len);
    for (var i = (0);
     i < len; ++i) {
      copyOfMatches.$setindex(i, mutableMatches.$index(i));
    }
    return new _FrozenElementList._wrap$ctor(copyOfMatches);
  }
  else if (const$0011.hasMatch(selectors)) {
    var mutableMatches = this.getElementsByTagName(selectors);
    var len = mutableMatches.get$length();
    var copyOfMatches = new Array(len);
    for (var i = (0);
     i < len; ++i) {
      copyOfMatches.$setindex(i, mutableMatches.$index(i));
    }
    return new _FrozenElementList._wrap$ctor(copyOfMatches);
  }
  else {
    return new _FrozenElementList._wrap$ctor(this.querySelectorAll(selectors));
  }
}
$dynamic("query$1").HTMLDocument = function($0) {
  return this.query($assert_String($0));
};
$inherits(_DocumentEventsImpl, _ElementEventsImpl);
function _DocumentEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
_DocumentEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
_DocumentEventsImpl.prototype.get$readyStateChange = function() {
  return this._get("readystatechange");
}
function FilteredElementList(node) {
  this._childNodes = node.get$nodes();
  this._node = node;
}
FilteredElementList.prototype.assert$ElementList = function(){return this};
FilteredElementList.prototype.is$List = function(){return true};
FilteredElementList.prototype.assert$List = function(){return this};
FilteredElementList.prototype.assert$List_int = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
FilteredElementList.prototype.assert$List_Element = function(){return this};
FilteredElementList.prototype.is$Collection = function(){return true};
FilteredElementList.prototype.assert$Collection = function(){return this};
FilteredElementList.prototype.assert$Collection_Object = function(){return this};
FilteredElementList.prototype.assert$Collection_String = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
FilteredElementList.prototype.assert$Collection_int = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
FilteredElementList.prototype.assert$Collection_num = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
FilteredElementList.prototype.assert$Collection_Element = function(){return this};
FilteredElementList.prototype.assert$Collection_File = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
FilteredElementList.prototype.assert$dart_core_Collection_Node = function(){return this};
FilteredElementList.prototype.assert$Collection_StyleSheet = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
FilteredElementList.prototype.assert$Collection_Touch = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
FilteredElementList.prototype.assert$Collection__NodeImpl = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
FilteredElementList.prototype.assert$Iterable = function(){return this};
FilteredElementList.prototype.get$_filtered = function() {
  var $0;
  return ListFactory.ListFactory$from$factory((($0 = this._childNodes.filter$1((function (n) {
    return !!(n && n.is$html_Element());
  })
  )) == null ? null : $0.assert$Iterable()));
}
FilteredElementList.prototype.get$first = function() {
  var $$list = this._childNodes;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    if (!!(node && node.is$html_Element())) {
      return (node == null ? null : node.assert$html_Element());
    }
  }
  return null;
}
FilteredElementList.prototype.forEach = function(f) {
  this.get$_filtered().forEach$1(f);
}
FilteredElementList.prototype.$setindex = function(index, value) {
  this.$index(index).replaceWith(value);
}
FilteredElementList.prototype.add = function(value) {
  this._childNodes.add$1(value);
}
FilteredElementList.prototype.get$add = function() {
  return this.add.bind(this);
}
FilteredElementList.prototype.addAll = function(collection) {
  collection.forEach$1(this.get$add());
}
FilteredElementList.prototype.addLast = function(value) {
  this.add(value);
}
FilteredElementList.prototype.sort = function(compare) {
  $throw(const$0012);
}
FilteredElementList.prototype.clear$_ = function() {
  this._childNodes.clear$_();
}
FilteredElementList.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    result.remove$0();
  }
  return (result == null ? null : result.assert$html_Element());
}
FilteredElementList.prototype.filter = function(f) {
  var $0;
  return (($0 = this.get$_filtered().filter$1(f)) == null ? null : $0.assert$Collection_Element());
}
FilteredElementList.prototype.get$length = function() {
  return this.get$_filtered().get$length();
}
FilteredElementList.prototype.$index = function(index) {
  var $0;
  return (($0 = this.get$_filtered().$index(index)) == null ? null : $0.assert$html_Element());
}
FilteredElementList.prototype.iterator = function() {
  var $0;
  return (($0 = this.get$_filtered().iterator()) == null ? null : $0.assert$Iterator_Element());
}
FilteredElementList.prototype.last = function() {
  return this.get$_filtered().last();
}
FilteredElementList.prototype.add$1 = function($0) {
  return this.add(($0 == null ? null : $0.assert$html_Element()));
};
FilteredElementList.prototype.addAll$1 = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_Element()));
};
FilteredElementList.prototype.addLast$1 = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$html_Element()));
};
FilteredElementList.prototype.clear$0 = FilteredElementList.prototype.clear$_;
FilteredElementList.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
FilteredElementList.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
FilteredElementList.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
function EmptyElementRect() {}
$dynamic("is$html_Element").DocumentFragment = function(){return true};
$dynamic("assert$html_Element").DocumentFragment = function(){return this};
$dynamic("get$elements").DocumentFragment = function() {
  if (this._elements == null) {
    this._elements = new FilteredElementList(this);
  }
  return this._elements;
}
$dynamic("queryAll").DocumentFragment = function(selectors) {
  return new _FrozenElementList._wrap$ctor(this.querySelectorAll(selectors));
}
$dynamic("set$innerHTML").DocumentFragment = function(value) {
  var $0;
  this.get$nodes().clear$_();
  var e = _ElementFactoryProvider.Element$tag$factory("div");
  e.set$innerHTML(value);
  var nodes = ListFactory.ListFactory$from$factory((($0 = e.get$nodes()) == null ? null : $0.assert$Iterable()));
  this.get$nodes().addAll(nodes);
}
$dynamic("get$parent").DocumentFragment = function() {
  return null;
}
$dynamic("get$classes").DocumentFragment = function() {
  return new HashSetImplementation_dart_core_String();
}
$dynamic("get$dataAttributes").DocumentFragment = function() {
  return const$0006;
}
$dynamic("click").DocumentFragment = function() {

}
$dynamic("get$click").DocumentFragment = function() {
  return this.click.bind(this);
}
$dynamic("get$on").DocumentFragment = function() {
  return new _ElementEventsImpl(this);
}
$dynamic("query$1").DocumentFragment = function($0) {
  return this.querySelector($assert_String($0));
};
$dynamic("get$name").DocumentType = function() { return this.name; };
_ChildrenElementList._wrap$ctor = function(element) {
  this._childElements = element.get$$$dom_children();
  this._html_element = element;
}
_ChildrenElementList._wrap$ctor.prototype = _ChildrenElementList.prototype;
function _ChildrenElementList() {}
_ChildrenElementList.prototype.assert$ElementList = function(){return this};
_ChildrenElementList.prototype.is$List = function(){return true};
_ChildrenElementList.prototype.assert$List = function(){return this};
_ChildrenElementList.prototype.assert$List_int = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
_ChildrenElementList.prototype.assert$List_Element = function(){return this};
_ChildrenElementList.prototype.is$Collection = function(){return true};
_ChildrenElementList.prototype.assert$Collection = function(){return this};
_ChildrenElementList.prototype.assert$Collection_Object = function(){return this};
_ChildrenElementList.prototype.assert$Collection_String = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
_ChildrenElementList.prototype.assert$Collection_int = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
_ChildrenElementList.prototype.assert$Collection_num = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
_ChildrenElementList.prototype.assert$Collection_Element = function(){return this};
_ChildrenElementList.prototype.assert$Collection_File = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
_ChildrenElementList.prototype.assert$dart_core_Collection_Node = function(){return this};
_ChildrenElementList.prototype.assert$Collection_StyleSheet = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
_ChildrenElementList.prototype.assert$Collection_Touch = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
_ChildrenElementList.prototype.assert$Collection__NodeImpl = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
_ChildrenElementList.prototype.assert$Iterable = function(){return this};
_ChildrenElementList.prototype._toList = function() {
  var output = new Array(this._childElements.get$length());
  for (var i = (0), len = this._childElements.get$length();
   i < len; i++) {
    output.$setindex(i, this._childElements.$index(i));
  }
  return (output == null ? null : output.assert$List_Element());
}
_ChildrenElementList.prototype.get$first = function() {
  return this._html_element.get$$$dom_firstElementChild();
}
_ChildrenElementList.prototype.forEach = function(f) {
  var $$list = this._childElements;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    f(element);
  }
}
_ChildrenElementList.prototype.filter = function(f) {
  var output = [];
  this.forEach((function (element) {
    if (f(element)) {
      output.add$1(element);
    }
  })
  );
  return new _FrozenElementList._wrap$ctor(output);
}
_ChildrenElementList.prototype.get$length = function() {
  return this._childElements.get$length();
}
_ChildrenElementList.prototype.$index = function(index) {
  var $0;
  return (($0 = this._childElements.$index(index)) == null ? null : $0.assert$_ElementImpl());
}
_ChildrenElementList.prototype.$setindex = function(index, value) {
  this._html_element.replaceChild(value, this._childElements.$index(index));
}
_ChildrenElementList.prototype.add = function(value) {
  this._html_element.appendChild(value);
  return value;
}
_ChildrenElementList.prototype.addLast = function(value) {
  return this.add(value);
}
_ChildrenElementList.prototype.iterator = function() {
  var $0;
  return (($0 = this._toList().iterator()) == null ? null : $0.assert$Iterator_Element());
}
_ChildrenElementList.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    this._html_element.appendChild(element);
  }
}
_ChildrenElementList.prototype.sort = function(compare) {
  $throw(const$0012);
}
_ChildrenElementList.prototype.clear$_ = function() {
  this._html_element.set$text("");
}
_ChildrenElementList.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._html_element.removeChild((result == null ? null : result.assert$_NodeImpl()));
  }
  return (result == null ? null : result.assert$html_Element());
}
_ChildrenElementList.prototype.last = function() {
  return this._html_element.get$$$dom_lastElementChild();
}
_ChildrenElementList.prototype.add$1 = function($0) {
  return this.add(($0 == null ? null : $0.assert$_ElementImpl()));
};
_ChildrenElementList.prototype.addAll$1 = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_Element()));
};
_ChildrenElementList.prototype.addLast$1 = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$_ElementImpl()));
};
_ChildrenElementList.prototype.clear$0 = _ChildrenElementList.prototype.clear$_;
_ChildrenElementList.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_ChildrenElementList.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_ChildrenElementList.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
_FrozenElementList._wrap$ctor = function(_nodeList) {
  this._nodeList = _nodeList;
}
_FrozenElementList._wrap$ctor.prototype = _FrozenElementList.prototype;
function _FrozenElementList() {}
_FrozenElementList.prototype.assert$ElementList = function(){return this};
_FrozenElementList.prototype.is$List = function(){return true};
_FrozenElementList.prototype.assert$List = function(){return this};
_FrozenElementList.prototype.assert$List_int = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
_FrozenElementList.prototype.assert$List_Element = function(){return this};
_FrozenElementList.prototype.is$Collection = function(){return true};
_FrozenElementList.prototype.assert$Collection = function(){return this};
_FrozenElementList.prototype.assert$Collection_Object = function(){return this};
_FrozenElementList.prototype.assert$Collection_String = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
_FrozenElementList.prototype.assert$Collection_int = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
_FrozenElementList.prototype.assert$Collection_num = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
_FrozenElementList.prototype.assert$Collection_Element = function(){return this};
_FrozenElementList.prototype.assert$Collection_File = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
_FrozenElementList.prototype.assert$dart_core_Collection_Node = function(){return this};
_FrozenElementList.prototype.assert$Collection_StyleSheet = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
_FrozenElementList.prototype.assert$Collection_Touch = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
_FrozenElementList.prototype.assert$Collection__NodeImpl = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
_FrozenElementList.prototype.assert$Iterable = function(){return this};
_FrozenElementList.prototype.get$first = function() {
  var $0;
  return (($0 = this._nodeList.$index((0))) == null ? null : $0.assert$html_Element());
}
_FrozenElementList.prototype.forEach = function(f) {
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var el = $$i.next();
    f(el);
  }
}
_FrozenElementList.prototype.filter = function(f) {
  var out = new _ElementList([]);
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var el = $$i.next();
    if (f(el)) out.add$1(el);
  }
  return (out == null ? null : out.assert$ElementList());
}
_FrozenElementList.prototype.get$length = function() {
  return this._nodeList.get$length();
}
_FrozenElementList.prototype.$index = function(index) {
  var $0;
  return (($0 = this._nodeList.$index(index)) == null ? null : $0.assert$html_Element());
}
_FrozenElementList.prototype.$setindex = function(index, value) {
  $throw(const$0003);
}
_FrozenElementList.prototype.add = function(value) {
  $throw(const$0003);
}
_FrozenElementList.prototype.addLast = function(value) {
  $throw(const$0003);
}
_FrozenElementList.prototype.iterator = function() {
  return new _FrozenElementListIterator(this);
}
_FrozenElementList.prototype.addAll = function(collection) {
  $throw(const$0003);
}
_FrozenElementList.prototype.sort = function(compare) {
  $throw(const$0003);
}
_FrozenElementList.prototype.clear$_ = function() {
  $throw(const$0003);
}
_FrozenElementList.prototype.removeLast = function() {
  $throw(const$0003);
}
_FrozenElementList.prototype.last = function() {
  var $0;
  return (($0 = this._nodeList.last()) == null ? null : $0.assert$html_Element());
}
_FrozenElementList.prototype.add$1 = function($0) {
  return this.add(($0 == null ? null : $0.assert$html_Element()));
};
_FrozenElementList.prototype.addAll$1 = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_Element()));
};
_FrozenElementList.prototype.addLast$1 = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$html_Element()));
};
_FrozenElementList.prototype.clear$0 = _FrozenElementList.prototype.clear$_;
_FrozenElementList.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_FrozenElementList.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_FrozenElementList.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
function _FrozenElementListIterator(_list) {
  this._html_index = (0);
  this._html_list = _list;
}
_FrozenElementListIterator.prototype.assert$Iterator = function(){return this};
_FrozenElementListIterator.prototype.assert$Iterator_dart_core_String = function(){$throw(new TypeError._internal$ctor(this, "Iterator<dart:core.String>"))};
_FrozenElementListIterator.prototype.assert$Iterator_Element = function(){return this};
_FrozenElementListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._html_list.$index(this._html_index++);
}
_FrozenElementListIterator.prototype.hasNext = function() {
  return this._html_index < this._html_list.get$length();
}
function _ListWrapper() {}
_ListWrapper.prototype.is$List = function(){return true};
_ListWrapper.prototype.assert$List = function(){return this};
_ListWrapper.prototype.assert$List_int = function(){return this};
_ListWrapper.prototype.assert$List_Element = function(){return this};
_ListWrapper.prototype.is$Collection = function(){return true};
_ListWrapper.prototype.assert$Collection = function(){return this};
_ListWrapper.prototype.assert$Collection_Object = function(){return this};
_ListWrapper.prototype.assert$Collection_String = function(){return this};
_ListWrapper.prototype.assert$Collection_int = function(){return this};
_ListWrapper.prototype.assert$Collection_num = function(){return this};
_ListWrapper.prototype.assert$Collection_Element = function(){return this};
_ListWrapper.prototype.assert$Collection_File = function(){return this};
_ListWrapper.prototype.assert$dart_core_Collection_Node = function(){return this};
_ListWrapper.prototype.assert$Collection_StyleSheet = function(){return this};
_ListWrapper.prototype.assert$Collection_Touch = function(){return this};
_ListWrapper.prototype.assert$Collection__NodeImpl = function(){return this};
_ListWrapper.prototype.assert$Iterable = function(){return this};
_ListWrapper.prototype.iterator = function() {
  var $0;
  return (($0 = this._html_list.iterator()) == null ? null : $0.assert$Iterator());
}
_ListWrapper.prototype.forEach = function(f) {
  return $assert_void(this._html_list.forEach$1(f));
}
_ListWrapper.prototype.filter = function(f) {
  var $0;
  return (($0 = this._html_list.filter$1(f)) == null ? null : $0.assert$List());
}
_ListWrapper.prototype.get$length = function() {
  return this._html_list.get$length();
}
_ListWrapper.prototype.$index = function(index) {
  return this._html_list.$index(index);
}
_ListWrapper.prototype.$setindex = function(index, value) {
  this._html_list.$setindex(index, value);
}
_ListWrapper.prototype.add = function(value) {
  return $assert_void(this._html_list.add$1(value));
}
_ListWrapper.prototype.addLast = function(value) {
  return $assert_void(this._html_list.addLast$1(value));
}
_ListWrapper.prototype.addAll = function(collection) {
  return this._html_list.addAll(collection);
}
_ListWrapper.prototype.sort = function(compare) {
  return $assert_void(this._html_list.sort$1(compare));
}
_ListWrapper.prototype.clear$_ = function() {
  return this._html_list.clear$_();
}
_ListWrapper.prototype.removeLast = function() {
  return this._html_list.removeLast();
}
_ListWrapper.prototype.last = function() {
  return this._html_list.last();
}
_ListWrapper.prototype.get$first = function() {
  return this._html_list.$index((0));
}
_ListWrapper.prototype.add$1 = _ListWrapper.prototype.add;
_ListWrapper.prototype.addAll$1 = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection()));
};
_ListWrapper.prototype.addLast$1 = _ListWrapper.prototype.addLast;
_ListWrapper.prototype.clear$0 = _ListWrapper.prototype.clear$_;
_ListWrapper.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_ListWrapper.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_ListWrapper.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_ListWrapper_Element, _ListWrapper);
function _ListWrapper_Element(_list) {
  this._html_list = _list;
}
_ListWrapper_Element.prototype.assert$List_int = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
_ListWrapper_Element.prototype.assert$Collection_String = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
_ListWrapper_Element.prototype.assert$Collection_int = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
_ListWrapper_Element.prototype.assert$Collection_num = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
_ListWrapper_Element.prototype.assert$Collection_File = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
_ListWrapper_Element.prototype.assert$Collection_StyleSheet = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
_ListWrapper_Element.prototype.assert$Collection_Touch = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
_ListWrapper_Element.prototype.assert$Collection__NodeImpl = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
_ListWrapper_Element.prototype.add$1 = function($0) {
  return this.add(($0 == null ? null : $0.assert$html_Element()));
};
_ListWrapper_Element.prototype.clear$0 = _ListWrapper_Element.prototype.clear$_;
_ListWrapper_Element.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_ElementList, _ListWrapper_Element);
function _ElementList(list) {
  _ListWrapper_Element.call(this, list);
}
_ElementList.prototype.assert$ElementList = function(){return this};
_ElementList.prototype.filter = function(f) {
  return new _ElementList(_ListWrapper_Element.prototype.filter.call(this, f));
}
_ElementList.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
function _ElementAttributeMap(_element) {
  this._html_element = _element;
}
_ElementAttributeMap.prototype.is$Map = function(){return true};
_ElementAttributeMap.prototype.assert$Map = function(){return this};
_ElementAttributeMap.prototype.containsKey = function(key) {
  return this._html_element.hasAttribute(key);
}
_ElementAttributeMap.prototype.$index = function(key) {
  return this._html_element.getAttribute(key);
}
_ElementAttributeMap.prototype.$setindex = function(key, value) {
  this._html_element.setAttribute(key, ("" + value));
}
_ElementAttributeMap.prototype.remove = function(key) {
  var value = this._html_element.getAttribute(key);
  this._html_element.removeAttribute(key);
  return value;
}
_ElementAttributeMap.prototype.clear$_ = function() {
  var attributes = this._html_element.get$$$dom_attributes();
  for (var i = attributes.get$length() - (1);
   i >= (0); i--) {
    this.remove($assert_String(attributes.$index(i).get$name()));
  }
}
_ElementAttributeMap.prototype.forEach = function(f) {
  var attributes = this._html_element.get$$$dom_attributes();
  for (var i = (0), len = attributes.get$length();
   i < len; i++) {
    var item = attributes.$index(i);
    f($assert_String(item.get$name()), $assert_String(item.get$value()));
  }
}
_ElementAttributeMap.prototype.getKeys = function() {
  var attributes = this._html_element.get$$$dom_attributes();
  var keys = new Array(attributes.get$length());
  for (var i = (0), len = attributes.get$length();
   i < len; i++) {
    keys.$setindex(i, attributes.$index(i).get$name());
  }
  return (keys == null ? null : keys.assert$Collection_String());
}
_ElementAttributeMap.prototype.get$length = function() {
  return this._html_element.get$$$dom_attributes().length;
}
_ElementAttributeMap.prototype.clear$0 = _ElementAttributeMap.prototype.clear$_;
_ElementAttributeMap.prototype.containsKey$1 = function($0) {
  return this.containsKey($assert_String($0));
};
_ElementAttributeMap.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$2(to$call$2($0)));
};
_ElementAttributeMap.prototype.remove$1 = function($0) {
  return this.remove($assert_String($0));
};
function _DataAttributeMap($dom_attributes) {
  this.$$dom_attributes = $dom_attributes;
}
_DataAttributeMap.prototype.is$Map = function(){return true};
_DataAttributeMap.prototype.assert$Map = function(){return this};
_DataAttributeMap.prototype.containsKey = function(key) {
  return this.$$dom_attributes.containsKey(this._attr(key));
}
_DataAttributeMap.prototype.$index = function(key) {
  return $assert_String(this.$$dom_attributes.$index(this._attr(key)));
}
_DataAttributeMap.prototype.$setindex = function(key, value) {
  this.$$dom_attributes.$setindex(this._attr(key), ("" + value));
}
_DataAttributeMap.prototype.remove = function(key) {
  return $assert_String(this.$$dom_attributes.remove(this._attr(key)));
}
_DataAttributeMap.prototype.clear$_ = function() {
  var $$list = this.getKeys();
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var key = $$i.next();
    this.remove(key);
  }
}
_DataAttributeMap.prototype.forEach = function(f) {
  var $this = this;
  this.$$dom_attributes.forEach$1((function (key, value) {
    if ($this._matches(key)) {
      f($this._strip(key), value);
    }
  })
  );
}
_DataAttributeMap.prototype.getKeys = function() {
  var $this = this;
  var keys = new Array();
  this.$$dom_attributes.forEach$1((function (key, value) {
    if ($this._matches(key)) {
      keys.add$1($this._strip(key));
    }
  })
  );
  return (keys == null ? null : keys.assert$Collection_String());
}
_DataAttributeMap.prototype.get$length = function() {
  return this.getKeys().get$length();
}
_DataAttributeMap.prototype._attr = function(key) {
  return ("data-" + key);
}
_DataAttributeMap.prototype._matches = function(key) {
  return key.startsWith("data-");
}
_DataAttributeMap.prototype._strip = function(key) {
  return key.substring((5));
}
_DataAttributeMap.prototype.clear$0 = _DataAttributeMap.prototype.clear$_;
_DataAttributeMap.prototype.containsKey$1 = function($0) {
  return this.containsKey($assert_String($0));
};
_DataAttributeMap.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$2(to$call$2($0)));
};
_DataAttributeMap.prototype.remove$1 = function($0) {
  return this.remove($assert_String($0));
};
function _CssClassSet(_element) {
  this._html_element = _element;
}
_CssClassSet.prototype.assert$Set_dart_core_String = function(){return this};
_CssClassSet.prototype.is$Collection = function(){return true};
_CssClassSet.prototype.assert$Collection = function(){return this};
_CssClassSet.prototype.assert$Collection_Object = function(){return this};
_CssClassSet.prototype.assert$Collection_String = function(){return this};
_CssClassSet.prototype.assert$Collection_int = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
_CssClassSet.prototype.assert$Collection_num = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
_CssClassSet.prototype.assert$Collection_Element = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
_CssClassSet.prototype.assert$Collection_File = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
_CssClassSet.prototype.assert$dart_core_Collection_Node = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
_CssClassSet.prototype.assert$Collection_StyleSheet = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
_CssClassSet.prototype.assert$Collection_Touch = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
_CssClassSet.prototype.assert$Collection__NodeImpl = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
_CssClassSet.prototype.assert$Iterable = function(){return this};
_CssClassSet.prototype.toString = function() {
  return this._formatSet(this._read());
}
_CssClassSet.prototype.iterator = function() {
  var $0;
  return (($0 = this._read().iterator()) == null ? null : $0.assert$Iterator_dart_core_String());
}
_CssClassSet.prototype.forEach = function(f) {
  this._read().forEach$1(f);
}
_CssClassSet.prototype.filter = function(f) {
  var $0;
  return (($0 = this._read().filter$1(f)) == null ? null : $0.assert$Collection_String());
}
_CssClassSet.prototype.get$length = function() {
  return this._read().get$length();
}
_CssClassSet.prototype.contains = function(value) {
  return this._read().contains(value);
}
_CssClassSet.prototype.add = function(value) {
  this._modify((function (s) {
    return s.add$1(value);
  })
  );
}
_CssClassSet.prototype.remove = function(value) {
  var s = this._read();
  var result = s.remove(value);
  this._write(s);
  return result;
}
_CssClassSet.prototype.addAll = function(collection) {
  this._modify((function (s) {
    return s.addAll$1(collection);
  })
  );
}
_CssClassSet.prototype.clear$_ = function() {
  this._modify((function (s) {
    return s.clear$0();
  })
  );
}
_CssClassSet.prototype._modify = function(f) {
  var s = this._read();
  f(s);
  this._write(s);
}
_CssClassSet.prototype._read = function() {
  var s = new HashSetImplementation_dart_core_String();
  var $$list = this._classname().split$_(" ");
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var name = $$i.next();
    var trimmed = name.trim();
    if (!trimmed.isEmpty()) {
      s.add(trimmed);
    }
  }
  return s;
}
_CssClassSet.prototype._classname = function() {
  return this._html_element.get$$$dom_className();
}
_CssClassSet.prototype._write = function(s) {
  this._html_element.set$$$dom_className(this._formatSet(s));
}
_CssClassSet.prototype._formatSet = function(s) {
  var list = ListFactory.ListFactory$from$factory(s);
  return Strings.join(list, " ");
}
_CssClassSet.prototype.add$1 = function($0) {
  return this.add($assert_String($0));
};
_CssClassSet.prototype.addAll$1 = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_String()));
};
_CssClassSet.prototype.clear$0 = _CssClassSet.prototype.clear$_;
_CssClassSet.prototype.contains$1 = function($0) {
  return this.contains($assert_String($0));
};
_CssClassSet.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_CssClassSet.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_CssClassSet.prototype.remove$1 = function($0) {
  return this.remove($assert_String($0));
};
function _SimpleClientRect() {}
_SimpleClientRect.prototype.assert$html_ClientRect = function(){return this};
_SimpleClientRect.prototype.$eq = function(other) {
  return null != other && this.left == other.left && this.top == other.top && this.width == other.width && this.height == other.height;
}
_SimpleClientRect.prototype.toString = function() {
  return ("(" + this.left + ", " + this.top + ", " + this.width + ", " + this.height + ")");
}
function _ElementRectImpl() {}
function _ElementFactoryProvider() {}
_ElementFactoryProvider.Element$tag$factory = function(tag) {
  return document.createElement(tag)
}
$dynamic("get$name").HTMLEmbedElement = function() { return this.name; };
$dynamic("get$length").EntryArray = function() { return this.length; };
$dynamic("get$length").EntryArraySync = function() { return this.length; };
$dynamic("get$name").EventException = function() { return this.name; };
$dynamic("get$on").EventSource = function() {
  return new _EventSourceEventsImpl(this);
}
$dynamic("get$readyState").EventSource = function() { return this.readyState; };
$dynamic("$dom_addEventListener$3").EventSource = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").EventSource = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_EventSourceEventsImpl, _EventsImpl);
function _EventSourceEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
function _EventListenerListImpl(_ptr, _type) {
  this._ptr = _ptr;
  this._type = _type;
}
_EventListenerListImpl.prototype.get$_ptr = function() { return this._ptr; };
_EventListenerListImpl.prototype.add = function(listener, useCapture) {
  this._add(listener, useCapture);
  return this;
}
_EventListenerListImpl.prototype.remove = function(listener, useCapture) {
  this._remove(listener, useCapture);
  return this;
}
_EventListenerListImpl.prototype._add = function(listener, useCapture) {
  this._ptr.$dom_addEventListener$3(this._type, listener, useCapture);
}
_EventListenerListImpl.prototype._remove = function(listener, useCapture) {
  this._ptr.$dom_removeEventListener$3(this._type, listener, useCapture);
}
_EventListenerListImpl.prototype.add$1 = function($0) {
  return this.add($wrap_call$1(to$call$1($0)), false);
};
_EventListenerListImpl.prototype.remove$1 = function($0) {
  return this.remove($wrap_call$1(to$call$1($0)), false);
};
$dynamic("get$name").HTMLFieldSetElement = function() { return this.name; };
$dynamic("assert$html_File").File = function(){return this};
$dynamic("get$name").File = function() { return this.name; };
$dynamic("get$name").FileException = function() { return this.name; };
$dynamic("is$List").FileList = function(){return true};
$dynamic("assert$List").FileList = function(){return this};
$dynamic("assert$List_int").FileList = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").FileList = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").FileList = function(){return true};
$dynamic("assert$Collection").FileList = function(){return this};
$dynamic("assert$Collection_Object").FileList = function(){return this};
$dynamic("assert$Collection_String").FileList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").FileList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").FileList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
$dynamic("assert$Collection_Element").FileList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").FileList = function(){return this};
$dynamic("assert$dart_core_Collection_Node").FileList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").FileList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").FileList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").FileList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").FileList = function(){return this};
$dynamic("get$length").FileList = function() { return this.length; };
$dynamic("$index").FileList = function(index) {
  return this[index];
}
$dynamic("$setindex").FileList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").FileList = function() {
  return new _FixedSizeListIterator_html_File(this);
}
$dynamic("add").FileList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").FileList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").FileList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").FileList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").FileList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").FileList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").FileList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").FileList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").FileList = function($0) {
  return this.add(($0 == null ? null : $0.assert$html_File()));
};
$dynamic("addAll$1").FileList = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_File()));
};
$dynamic("addLast$1").FileList = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$html_File()));
};
$dynamic("filter$1").FileList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").FileList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").FileList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$on").FileReader = function() {
  return new _FileReaderEventsImpl(this);
}
$dynamic("get$readyState").FileReader = function() { return this.readyState; };
$dynamic("$dom_addEventListener$3").FileReader = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").FileReader = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_FileReaderEventsImpl, _EventsImpl);
function _FileReaderEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").FileWriter = function() {
  return new _FileWriterEventsImpl(this);
}
$dynamic("get$length").FileWriter = function() { return this.length; };
$dynamic("get$readyState").FileWriter = function() { return this.readyState; };
$dynamic("$dom_addEventListener$3").FileWriter = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").FileWriter = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_FileWriterEventsImpl, _EventsImpl);
function _FileWriterEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").FileWriterSync = function() { return this.length; };
$dynamic("is$List").Float32Array = function(){return true};
$dynamic("assert$List").Float32Array = function(){return this};
$dynamic("assert$List_int").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").Float32Array = function(){return true};
$dynamic("assert$Collection").Float32Array = function(){return this};
$dynamic("assert$Collection_Object").Float32Array = function(){return this};
$dynamic("assert$Collection_String").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").Float32Array = function(){return this};
$dynamic("assert$Collection_Element").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").Float32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").Float32Array = function(){return this};
$dynamic("get$length").Float32Array = function() { return this.length; };
$dynamic("$index").Float32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float32Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").Float32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Float32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Float32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Float32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").Float32Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Float32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Float32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Float32Array = function($0) {
  return this.add($assert_num($0));
};
$dynamic("addAll$1").Float32Array = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_num()));
};
$dynamic("addLast$1").Float32Array = function($0) {
  return this.addLast($assert_num($0));
};
$dynamic("filter$1").Float32Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Float32Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Float32Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Float64Array = function(){return true};
$dynamic("assert$List").Float64Array = function(){return this};
$dynamic("assert$List_int").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").Float64Array = function(){return true};
$dynamic("assert$Collection").Float64Array = function(){return this};
$dynamic("assert$Collection_Object").Float64Array = function(){return this};
$dynamic("assert$Collection_String").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").Float64Array = function(){return this};
$dynamic("assert$Collection_Element").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").Float64Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").Float64Array = function(){return this};
$dynamic("get$length").Float64Array = function() { return this.length; };
$dynamic("$index").Float64Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float64Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float64Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float64Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").Float64Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Float64Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Float64Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Float64Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").Float64Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Float64Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Float64Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Float64Array = function($0) {
  return this.add($assert_num($0));
};
$dynamic("addAll$1").Float64Array = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_num()));
};
$dynamic("addLast$1").Float64Array = function($0) {
  return this.addLast($assert_num($0));
};
$dynamic("filter$1").Float64Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Float64Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Float64Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$length").HTMLFormElement = function() { return this.length; };
$dynamic("get$name").HTMLFormElement = function() { return this.name; };
$dynamic("get$name").HTMLFrameElement = function() { return this.name; };
$dynamic("get$on").HTMLFrameSetElement = function() {
  return new _FrameSetElementEventsImpl(this);
}
$inherits(_FrameSetElementEventsImpl, _ElementEventsImpl);
function _FrameSetElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("get$length").HTMLAllCollection = function() { return this.length; };
$dynamic("is$List").HTMLCollection = function(){return true};
$dynamic("assert$List").HTMLCollection = function(){return this};
$dynamic("assert$List_int").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").HTMLCollection = function(){return true};
$dynamic("assert$Collection").HTMLCollection = function(){return this};
$dynamic("assert$Collection_Object").HTMLCollection = function(){return this};
$dynamic("assert$Collection_String").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
$dynamic("assert$Collection_Element").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").HTMLCollection = function(){return this};
$dynamic("assert$Collection_StyleSheet").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").HTMLCollection = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").HTMLCollection = function(){return this};
$dynamic("get$length").HTMLCollection = function() { return this.length; };
$dynamic("$index").HTMLCollection = function(index) {
  return this[index];
}
$dynamic("$setindex").HTMLCollection = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").HTMLCollection = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").HTMLCollection = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").HTMLCollection = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").HTMLCollection = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").HTMLCollection = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").HTMLCollection = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").HTMLCollection = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").HTMLCollection = function() {
  return this.$index(this.get$length() - (1));
}
$dynamic("removeLast").HTMLCollection = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").HTMLCollection = function($0) {
  return this.add(($0 == null ? null : $0.assert$html_Node()));
};
$dynamic("addAll$1").HTMLCollection = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$dart_core_Collection_Node()));
};
$dynamic("addLast$1").HTMLCollection = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$html_Node()));
};
$dynamic("filter$1").HTMLCollection = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").HTMLCollection = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").HTMLCollection = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$length").HTMLOptionsCollection = function() {
  return this.length;
}
$dynamic("remove$1").HTMLOptionsCollection = function($0) {
  return this.remove($assert_num($0));
};
$dynamic("get$length").History = function() { return this.length; };
$dynamic("get$value").IDBCursorWithValue = function() { return this.value; };
$dynamic("get$on").IDBDatabase = function() {
  return new _IDBDatabaseEventsImpl(this);
}
$dynamic("get$name").IDBDatabase = function() { return this.name; };
$dynamic("$dom_addEventListener$3").IDBDatabase = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").IDBDatabase = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_IDBDatabaseEventsImpl, _EventsImpl);
function _IDBDatabaseEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").IDBDatabaseException = function() { return this.name; };
$dynamic("get$name").IDBIndex = function() { return this.name; };
$dynamic("get$name").IDBObjectStore = function() { return this.name; };
$dynamic("add$1").IDBObjectStore = function($0) {
  return this.add($0);
};
$dynamic("clear$0").IDBObjectStore = function() {
  return this.clear();
};
$dynamic("get$on").IDBRequest = function() {
  return new _IDBRequestEventsImpl(this);
}
$dynamic("get$readyState").IDBRequest = function() { return this.readyState; };
$dynamic("$dom_addEventListener$3").IDBRequest = function($0, $1, $2) {
  if (Object.getPrototypeOf(this).hasOwnProperty("$dom_addEventListener$3")) {
    return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
  }
  return Object.prototype.$dom_addEventListener$3.call(this, $0, $1, $2);
};
$dynamic("$dom_removeEventListener$3").IDBRequest = function($0, $1, $2) {
  if (Object.getPrototypeOf(this).hasOwnProperty("$dom_removeEventListener$3")) {
    return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
  }
  return Object.prototype.$dom_removeEventListener$3.call(this, $0, $1, $2);
};
$inherits(_IDBRequestEventsImpl, _EventsImpl);
function _IDBRequestEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").IDBTransaction = function() {
  return new _IDBTransactionEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").IDBTransaction = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").IDBTransaction = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_IDBTransactionEventsImpl, _EventsImpl);
function _IDBTransactionEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").IDBVersionChangeRequest = function() {
  return new _IDBVersionChangeRequestEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").IDBVersionChangeRequest = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").IDBVersionChangeRequest = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_IDBVersionChangeRequestEventsImpl, _IDBRequestEventsImpl);
function _IDBVersionChangeRequestEventsImpl(_ptr) {
  _IDBRequestEventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLIFrameElement = function() { return this.name; };
$dynamic("get$name").HTMLImageElement = function() { return this.name; };
$dynamic("get$on").HTMLInputElement = function() {
  return new _InputElementEventsImpl(this);
}
$dynamic("get$name").HTMLInputElement = function() { return this.name; };
$dynamic("get$value").HTMLInputElement = function() { return this.value; };
$dynamic("set$value").HTMLInputElement = function(value) { return this.value = value; };
$inherits(_InputElementEventsImpl, _ElementEventsImpl);
function _InputElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("is$List").Int16Array = function(){return true};
$dynamic("assert$List").Int16Array = function(){return this};
$dynamic("assert$List_int").Int16Array = function(){return this};
$dynamic("assert$List_Element").Int16Array = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").Int16Array = function(){return true};
$dynamic("assert$Collection").Int16Array = function(){return this};
$dynamic("assert$Collection_Object").Int16Array = function(){return this};
$dynamic("assert$Collection_String").Int16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").Int16Array = function(){return this};
$dynamic("assert$Collection_num").Int16Array = function(){return this};
$dynamic("assert$Collection_Element").Int16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").Int16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").Int16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").Int16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").Int16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").Int16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").Int16Array = function(){return this};
$dynamic("get$length").Int16Array = function() { return this.length; };
$dynamic("$index").Int16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").Int16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int16Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int16Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int16Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").Int16Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Int16Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Int16Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Int16Array = function($0) {
  return this.add($assert_num($0));
};
$dynamic("addAll$1").Int16Array = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_int()));
};
$dynamic("addLast$1").Int16Array = function($0) {
  return this.addLast($assert_num($0));
};
$dynamic("filter$1").Int16Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Int16Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Int16Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Int32Array = function(){return true};
$dynamic("assert$List").Int32Array = function(){return this};
$dynamic("assert$List_int").Int32Array = function(){return this};
$dynamic("assert$List_Element").Int32Array = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").Int32Array = function(){return true};
$dynamic("assert$Collection").Int32Array = function(){return this};
$dynamic("assert$Collection_Object").Int32Array = function(){return this};
$dynamic("assert$Collection_String").Int32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").Int32Array = function(){return this};
$dynamic("assert$Collection_num").Int32Array = function(){return this};
$dynamic("assert$Collection_Element").Int32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").Int32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").Int32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").Int32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").Int32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").Int32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").Int32Array = function(){return this};
$dynamic("get$length").Int32Array = function() { return this.length; };
$dynamic("$index").Int32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").Int32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").Int32Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Int32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Int32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Int32Array = function($0) {
  return this.add($assert_num($0));
};
$dynamic("addAll$1").Int32Array = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_int()));
};
$dynamic("addLast$1").Int32Array = function($0) {
  return this.addLast($assert_num($0));
};
$dynamic("filter$1").Int32Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Int32Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Int32Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Int8Array = function(){return true};
$dynamic("assert$List").Int8Array = function(){return this};
$dynamic("assert$List_int").Int8Array = function(){return this};
$dynamic("assert$List_Element").Int8Array = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").Int8Array = function(){return true};
$dynamic("assert$Collection").Int8Array = function(){return this};
$dynamic("assert$Collection_Object").Int8Array = function(){return this};
$dynamic("assert$Collection_String").Int8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").Int8Array = function(){return this};
$dynamic("assert$Collection_num").Int8Array = function(){return this};
$dynamic("assert$Collection_Element").Int8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").Int8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").Int8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").Int8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").Int8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").Int8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").Int8Array = function(){return this};
$dynamic("get$length").Int8Array = function() { return this.length; };
$dynamic("$index").Int8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").Int8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int8Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int8Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int8Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").Int8Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Int8Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Int8Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Int8Array = function($0) {
  return this.add($assert_num($0));
};
$dynamic("addAll$1").Int8Array = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_int()));
};
$dynamic("addLast$1").Int8Array = function($0) {
  return this.addLast($assert_num($0));
};
$dynamic("filter$1").Int8Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Int8Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Int8Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$on").JavaScriptAudioNode = function() {
  return new _JavaScriptAudioNodeEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").JavaScriptAudioNode = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").JavaScriptAudioNode = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_JavaScriptAudioNodeEventsImpl, _EventsImpl);
function _JavaScriptAudioNodeEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLKeygenElement = function() { return this.name; };
$dynamic("get$value").HTMLLIElement = function() { return this.value; };
$dynamic("set$value").HTMLLIElement = function(value) { return this.value = value; };
$dynamic("get$on").MediaStream = function() {
  return new _MediaStreamEventsImpl(this);
}
$dynamic("get$readyState").MediaStream = function() { return this.readyState; };
$dynamic("$dom_addEventListener$3").MediaStream = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").MediaStream = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("get$name").HTMLMapElement = function() { return this.name; };
$dynamic("start$0").HTMLMarqueeElement = function() {
  return this.start();
};
$dynamic("$dom_addEventListener$3").MediaController = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").MediaController = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_MediaElementEventsImpl, _ElementEventsImpl);
function _MediaElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("is$List").MediaList = function(){return true};
$dynamic("assert$List").MediaList = function(){return this};
$dynamic("assert$List_int").MediaList = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").MediaList = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").MediaList = function(){return true};
$dynamic("assert$Collection").MediaList = function(){return this};
$dynamic("assert$Collection_Object").MediaList = function(){return this};
$dynamic("assert$Collection_String").MediaList = function(){return this};
$dynamic("assert$Collection_int").MediaList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").MediaList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
$dynamic("assert$Collection_Element").MediaList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").MediaList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").MediaList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").MediaList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").MediaList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").MediaList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").MediaList = function(){return this};
$dynamic("get$length").MediaList = function() { return this.length; };
$dynamic("$index").MediaList = function(index) {
  return this[index];
}
$dynamic("$setindex").MediaList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").MediaList = function() {
  return new _FixedSizeListIterator_dart_core_String(this);
}
$dynamic("add").MediaList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").MediaList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").MediaList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").MediaList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").MediaList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").MediaList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").MediaList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").MediaList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").MediaList = function($0) {
  return this.add($assert_String($0));
};
$dynamic("addAll$1").MediaList = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_String()));
};
$dynamic("addLast$1").MediaList = function($0) {
  return this.addLast($assert_String($0));
};
$dynamic("filter$1").MediaList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").MediaList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").MediaList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_MediaStreamEventsImpl, _EventsImpl);
function _MediaStreamEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").MediaStreamList = function() { return this.length; };
$dynamic("get$kind").MediaStreamTrack = function() { return this.kind; };
$dynamic("get$length").MediaStreamTrackList = function() { return this.length; };
$dynamic("get$on").MessagePort = function() {
  return new _MessagePortEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").MessagePort = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").MessagePort = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("start$0").MessagePort = function() {
  return this.start();
};
$inherits(_MessagePortEventsImpl, _EventsImpl);
function _MessagePortEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLMetaElement = function() { return this.name; };
$dynamic("get$value").HTMLMeterElement = function() { return this.value; };
$dynamic("set$value").HTMLMeterElement = function(value) { return this.value = value; };
$dynamic("assert$html_MutationRecord").MutationRecord = function(){return this};
$dynamic("is$List").NamedNodeMap = function(){return true};
$dynamic("assert$List").NamedNodeMap = function(){return this};
$dynamic("assert$List_int").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").NamedNodeMap = function(){return true};
$dynamic("assert$Collection").NamedNodeMap = function(){return this};
$dynamic("assert$Collection_Object").NamedNodeMap = function(){return this};
$dynamic("assert$Collection_String").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
$dynamic("assert$Collection_Element").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").NamedNodeMap = function(){return this};
$dynamic("assert$Collection_StyleSheet").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").NamedNodeMap = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").NamedNodeMap = function(){return this};
$dynamic("get$length").NamedNodeMap = function() { return this.length; };
$dynamic("$index").NamedNodeMap = function(index) {
  return this[index];
}
$dynamic("$setindex").NamedNodeMap = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").NamedNodeMap = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NamedNodeMap = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").NamedNodeMap = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").NamedNodeMap = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").NamedNodeMap = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").NamedNodeMap = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").NamedNodeMap = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").NamedNodeMap = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").NamedNodeMap = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").NamedNodeMap = function($0) {
  return this.add(($0 == null ? null : $0.assert$html_Node()));
};
$dynamic("addAll$1").NamedNodeMap = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$dart_core_Collection_Node()));
};
$dynamic("addLast$1").NamedNodeMap = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$html_Node()));
};
$dynamic("filter$1").NamedNodeMap = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").NamedNodeMap = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").NamedNodeMap = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
function _ChildNodeListLazy(_this) {
  this._this = _this;
}
_ChildNodeListLazy.prototype.is$List = function(){return true};
_ChildNodeListLazy.prototype.assert$List = function(){return this};
_ChildNodeListLazy.prototype.assert$List_int = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
_ChildNodeListLazy.prototype.assert$List_Element = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
_ChildNodeListLazy.prototype.is$Collection = function(){return true};
_ChildNodeListLazy.prototype.assert$Collection = function(){return this};
_ChildNodeListLazy.prototype.assert$Collection_Object = function(){return this};
_ChildNodeListLazy.prototype.assert$Collection_String = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
_ChildNodeListLazy.prototype.assert$Collection_int = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
_ChildNodeListLazy.prototype.assert$Collection_num = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
_ChildNodeListLazy.prototype.assert$Collection_Element = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
_ChildNodeListLazy.prototype.assert$Collection_File = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
_ChildNodeListLazy.prototype.assert$dart_core_Collection_Node = function(){return this};
_ChildNodeListLazy.prototype.assert$Collection_StyleSheet = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
_ChildNodeListLazy.prototype.assert$Collection_Touch = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
_ChildNodeListLazy.prototype.assert$Collection__NodeImpl = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
_ChildNodeListLazy.prototype.assert$Iterable = function(){return this};
_ChildNodeListLazy.prototype.last = function() {
  return this._this.lastChild;
}
_ChildNodeListLazy.prototype.add = function(value) {
  this._this.appendChild(value);
}
_ChildNodeListLazy.prototype.addLast = function(value) {
  this._this.appendChild(value);
}
_ChildNodeListLazy.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    this._this.appendChild(node);
  }
}
_ChildNodeListLazy.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._this.removeChild((result == null ? null : result.assert$_NodeImpl()));
  }
  return (result == null ? null : result.assert$_NodeImpl());
}
_ChildNodeListLazy.prototype.clear$_ = function() {
  this._this.set$text("");
}
_ChildNodeListLazy.prototype.$setindex = function(index, value) {
  this._this.replaceChild(value, this.$index(index));
}
_ChildNodeListLazy.prototype.iterator = function() {
  return this._this.get$$$dom_childNodes().iterator();
}
_ChildNodeListLazy.prototype.forEach = function(f) {
  return _Collections.forEach(this, f);
}
_ChildNodeListLazy.prototype.filter = function(f) {
  return new _NodeListWrapper(_Collections.filter(this, [], f));
}
_ChildNodeListLazy.prototype.sort = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
_ChildNodeListLazy.prototype.get$length = function() {
  return this._this.get$$$dom_childNodes().length;
}
_ChildNodeListLazy.prototype.$index = function(index) {
  return this._this.get$$$dom_childNodes().$index(index);
}
_ChildNodeListLazy.prototype.add$1 = function($0) {
  return this.add(($0 == null ? null : $0.assert$_NodeImpl()));
};
_ChildNodeListLazy.prototype.addAll$1 = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection__NodeImpl()));
};
_ChildNodeListLazy.prototype.addLast$1 = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$_NodeImpl()));
};
_ChildNodeListLazy.prototype.clear$0 = _ChildNodeListLazy.prototype.clear$_;
_ChildNodeListLazy.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_ChildNodeListLazy.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_ChildNodeListLazy.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_ListWrapper_Node, _ListWrapper);
function _ListWrapper_Node(_list) {
  this._html_list = _list;
}
_ListWrapper_Node.prototype.assert$List_int = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
_ListWrapper_Node.prototype.assert$List_Element = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
_ListWrapper_Node.prototype.assert$Collection_String = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
_ListWrapper_Node.prototype.assert$Collection_int = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
_ListWrapper_Node.prototype.assert$Collection_num = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
_ListWrapper_Node.prototype.assert$Collection_Element = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
_ListWrapper_Node.prototype.assert$Collection_File = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
_ListWrapper_Node.prototype.assert$Collection_StyleSheet = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
_ListWrapper_Node.prototype.assert$Collection_Touch = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
_ListWrapper_Node.prototype.assert$Collection__NodeImpl = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
_ListWrapper_Node.prototype.add$1 = function($0) {
  return this.add(($0 == null ? null : $0.assert$html_Node()));
};
_ListWrapper_Node.prototype.clear$0 = _ListWrapper_Node.prototype.clear$_;
_ListWrapper_Node.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_NodeListWrapper, _ListWrapper_Node);
function _NodeListWrapper(list) {
  _ListWrapper_Node.call(this, list);
}
_NodeListWrapper.prototype.filter = function(f) {
  var $0;
  return new _NodeListWrapper((($0 = this._html_list.filter$1(f)) == null ? null : $0.assert$List()));
}
_NodeListWrapper.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("is$List").NodeList = function(){return true};
$dynamic("assert$List").NodeList = function(){return this};
$dynamic("assert$List_int").NodeList = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").NodeList = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").NodeList = function(){return true};
$dynamic("assert$Collection").NodeList = function(){return this};
$dynamic("assert$Collection_Object").NodeList = function(){return this};
$dynamic("assert$Collection_String").NodeList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").NodeList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").NodeList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
$dynamic("assert$Collection_Element").NodeList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").NodeList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").NodeList = function(){return this};
$dynamic("assert$Collection_StyleSheet").NodeList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").NodeList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").NodeList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").NodeList = function(){return this};
$dynamic("iterator").NodeList = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NodeList = function(value) {
  this._parent.appendChild(value);
}
$dynamic("addLast").NodeList = function(value) {
  this._parent.appendChild(value);
}
$dynamic("addAll").NodeList = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    this._parent.appendChild(node);
  }
}
$dynamic("removeLast").NodeList = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._parent.removeChild((result == null ? null : result.assert$_NodeImpl()));
  }
  return (result == null ? null : result.assert$_NodeImpl());
}
$dynamic("clear$_").NodeList = function() {
  this._parent.set$text("");
}
$dynamic("$setindex").NodeList = function(index, value) {
  this._parent.replaceChild(value, this.$index(index));
}
$dynamic("forEach").NodeList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").NodeList = function(f) {
  return new _NodeListWrapper(_Collections.filter(this, [], f));
}
$dynamic("sort").NodeList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").NodeList = function() {
  return this.$index(this.length - (1));
}
$dynamic("get$length").NodeList = function() { return this.length; };
$dynamic("$index").NodeList = function(index) {
  return this[index];
}
$dynamic("add$1").NodeList = function($0) {
  return this.add(($0 == null ? null : $0.assert$_NodeImpl()));
};
$dynamic("addAll$1").NodeList = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection__NodeImpl()));
};
$dynamic("addLast$1").NodeList = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$_NodeImpl()));
};
$dynamic("clear$0").NodeList = function() {
  return this.clear$_();
};
$dynamic("filter$1").NodeList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").NodeList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").NodeList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("query$1").NodeSelector = function($0) {
  return this.querySelector($assert_String($0));
};
$dynamic("get$on").Notification = function() {
  return new _NotificationEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").Notification = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").Notification = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_NotificationEventsImpl, _EventsImpl);
function _NotificationEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_NotificationEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
$dynamic("get$name").HTMLObjectElement = function() { return this.name; };
$dynamic("get$name").OperationNotAllowedException = function() { return this.name; };
$dynamic("get$value").HTMLOptionElement = function() { return this.value; };
$dynamic("set$value").HTMLOptionElement = function(value) { return this.value = value; };
$dynamic("get$name").HTMLOutputElement = function() { return this.name; };
$dynamic("get$value").HTMLOutputElement = function() { return this.value; };
$dynamic("set$value").HTMLOutputElement = function(value) { return this.value = value; };
$dynamic("get$name").HTMLParamElement = function() { return this.name; };
$dynamic("get$value").HTMLParamElement = function() { return this.value; };
$dynamic("set$value").HTMLParamElement = function(value) { return this.value = value; };
$dynamic("get$on").PeerConnection00 = function() {
  return new _PeerConnection00EventsImpl(this);
}
$dynamic("get$readyState").PeerConnection00 = function() { return this.readyState; };
$dynamic("$dom_addEventListener$3").PeerConnection00 = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").PeerConnection00 = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_PeerConnection00EventsImpl, _EventsImpl);
function _PeerConnection00EventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$value").HTMLProgressElement = function() { return this.value; };
$dynamic("set$value").HTMLProgressElement = function(value) { return this.value = value; };
$dynamic("get$value").RadioNodeList = function() { return this.value; };
$dynamic("set$value").RadioNodeList = function(value) { return this.value = value; };
$dynamic("get$name").RangeException = function() { return this.name; };
$dynamic("get$length").SQLResultSetRowList = function() { return this.length; };
$dynamic("get$classes").SVGElement = function() {
  var $0;
  if (null == this.noSuchMethod("get:_cssClassSet", [])) {
    this.noSuchMethod("set:_cssClassSet", [new _AttributeClassSet(this.get$_ptr())]);
  }
  return (($0 = this.noSuchMethod("get:_cssClassSet", [])) == null ? null : $0.assert$Set_dart_core_String());
}
$dynamic("get$elements").SVGElement = function() {
  return new FilteredElementList(this);
}
$dynamic("set$elements").SVGElement = function(value) {
  var elements = this.get$elements();
  elements.clear$0();
  elements.addAll$1(value);
}
$dynamic("set$innerHTML").SVGElement = function(svg) {
  var container = _ElementFactoryProvider.Element$tag$factory("div");
  container.set$innerHTML(("<svg version=\"1.1\">" + svg + "</svg>"));
  this.set$elements(container.get$elements().get$first().get$elements());
}
$dynamic("get$value").SVGAngle = function() { return this.value; };
$dynamic("set$value").SVGAngle = function(value) { return this.value = value; };
$inherits(_AttributeClassSet, _CssClassSet);
function _AttributeClassSet(element) {
  _CssClassSet.call(this, element);
}
_AttributeClassSet.prototype._write = function(s) {
  this._html_element.get$attributes().$setindex("class", this._formatSet(s));
}
$dynamic("get$on").SVGElementInstance = function() {
  return new _SVGElementInstanceEventsImpl(this);
}
$inherits(_SVGElementInstanceEventsImpl, _EventsImpl);
function _SVGElementInstanceEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_SVGElementInstanceEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
$dynamic("get$length").SVGElementInstanceList = function() { return this.length; };
$dynamic("get$name").SVGException = function() { return this.name; };
$dynamic("get$value").SVGLength = function() { return this.value; };
$dynamic("set$value").SVGLength = function(value) { return this.value = value; };
$dynamic("clear$0").SVGLengthList = function() {
  return this.clear();
};
$dynamic("get$value").SVGNumber = function() { return this.value; };
$dynamic("set$value").SVGNumber = function(value) { return this.value = value; };
$dynamic("clear$0").SVGNumberList = function() {
  return this.clear();
};
$dynamic("clear$0").SVGPathSegList = function() {
  return this.clear();
};
$dynamic("clear$0").SVGPointList = function() {
  return this.clear();
};
$dynamic("clear$0").SVGStringList = function() {
  return this.clear();
};
$dynamic("clear$0").SVGTransformList = function() {
  return this.clear();
};
$dynamic("assert$html_ScriptProfile").ScriptProfile = function(){return this};
$dynamic("assert$html_ScriptProfileNode").ScriptProfileNode = function(){return this};
$dynamic("get$length").HTMLSelectElement = function() { return this.length; };
$dynamic("get$name").HTMLSelectElement = function() { return this.name; };
$dynamic("get$value").HTMLSelectElement = function() { return this.value; };
$dynamic("set$value").HTMLSelectElement = function(value) { return this.value = value; };
$dynamic("set$innerHTML").ShadowRoot = function(value) { return this.innerHTML = value; };
$dynamic("get$on").SharedWorkerContext = function() {
  return new _SharedWorkerContextEventsImpl(this);
}
$dynamic("get$name").SharedWorkerContext = function() { return this.name; };
$inherits(_SharedWorkerContextEventsImpl, _WorkerContextEventsImpl);
function _SharedWorkerContextEventsImpl(_ptr) {
  _WorkerContextEventsImpl.call(this, _ptr);
}
$dynamic("get$length").SpeechGrammarList = function() { return this.length; };
$dynamic("get$length").SpeechInputResultList = function() { return this.length; };
$dynamic("get$on").SpeechRecognition = function() {
  return new _SpeechRecognitionEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").SpeechRecognition = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").SpeechRecognition = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("start$0").SpeechRecognition = function() {
  return this.start();
};
$inherits(_SpeechRecognitionEventsImpl, _EventsImpl);
function _SpeechRecognitionEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").SpeechRecognitionResult = function() { return this.length; };
$dynamic("get$length").SpeechRecognitionResultList = function() { return this.length; };
$dynamic("is$Map").Storage = function(){return true};
$dynamic("assert$Map").Storage = function(){return this};
$dynamic("containsKey").Storage = function(key) {
  return this.getItem(key) != null;
}
$dynamic("$index").Storage = function(key) {
  return this.getItem(key);
}
$dynamic("$setindex").Storage = function(key, value) {
  return this.setItem(key, value);
}
$dynamic("remove").Storage = function(key) {
  var value = this.$index(key);
  this.removeItem(key);
  return $assert_String(value);
}
$dynamic("clear$_").Storage = function() {
  return this.clear();
}
$dynamic("forEach").Storage = function(f) {
  for (var i = (0);
   true; i = $add$(i, (1))) {
    var key = this.key($assert_num(i));
    if ($eq$(key)) return;
    f($assert_String(key), this.$index($assert_String(key)));
  }
}
$dynamic("getKeys").Storage = function() {
  var keys = [];
  this.forEach((function (k, v) {
    return keys.add$1(k);
  })
  );
  return (keys == null ? null : keys.assert$Collection_String());
}
$dynamic("get$length").Storage = function() {
  return this.get$$$dom_length();
}
$dynamic("get$$$dom_length").Storage = function() {
  return this.length;
}
$dynamic("clear$0").Storage = function() {
  return this.clear$_();
};
$dynamic("containsKey$1").Storage = function($0) {
  return this.containsKey($assert_String($0));
};
$dynamic("forEach$1").Storage = function($0) {
  return this.forEach($wrap_call$2(to$call$2($0)));
};
$dynamic("remove$1").Storage = function($0) {
  return this.remove($assert_String($0));
};
$dynamic("is$List").StyleSheetList = function(){return true};
$dynamic("assert$List").StyleSheetList = function(){return this};
$dynamic("assert$List_int").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").StyleSheetList = function(){return true};
$dynamic("assert$Collection").StyleSheetList = function(){return this};
$dynamic("assert$Collection_Object").StyleSheetList = function(){return this};
$dynamic("assert$Collection_String").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
$dynamic("assert$Collection_Element").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").StyleSheetList = function(){return this};
$dynamic("assert$Collection_Touch").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").StyleSheetList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").StyleSheetList = function(){return this};
$dynamic("get$length").StyleSheetList = function() { return this.length; };
$dynamic("$index").StyleSheetList = function(index) {
  return this[index];
}
$dynamic("$setindex").StyleSheetList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").StyleSheetList = function() {
  return new _FixedSizeListIterator_html_StyleSheet(this);
}
$dynamic("add").StyleSheetList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").StyleSheetList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").StyleSheetList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").StyleSheetList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").StyleSheetList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").StyleSheetList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").StyleSheetList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").StyleSheetList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").StyleSheetList = function($0) {
  return this.add(($0 == null ? null : $0.assert$html_StyleSheet()));
};
$dynamic("addAll$1").StyleSheetList = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_StyleSheet()));
};
$dynamic("addLast$1").StyleSheetList = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$html_StyleSheet()));
};
$dynamic("filter$1").StyleSheetList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").StyleSheetList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").StyleSheetList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$name").HTMLTextAreaElement = function() { return this.name; };
$dynamic("get$value").HTMLTextAreaElement = function() { return this.value; };
$dynamic("set$value").HTMLTextAreaElement = function(value) { return this.value = value; };
$dynamic("get$on").TextTrack = function() {
  return new _TextTrackEventsImpl(this);
}
$dynamic("get$kind").TextTrack = function() { return this.kind; };
$dynamic("$dom_addEventListener$3").TextTrack = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").TextTrack = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_TextTrackEventsImpl, _EventsImpl);
function _TextTrackEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").TextTrackCue = function() {
  return new _TextTrackCueEventsImpl(this);
}
$dynamic("get$text").TextTrackCue = function() { return this.text; };
$dynamic("$dom_addEventListener$3").TextTrackCue = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").TextTrackCue = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_TextTrackCueEventsImpl, _EventsImpl);
function _TextTrackCueEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").TextTrackCueList = function() { return this.length; };
$dynamic("get$on").TextTrackList = function() {
  return new _TextTrackListEventsImpl(this);
}
$dynamic("get$length").TextTrackList = function() { return this.length; };
$dynamic("$dom_addEventListener$3").TextTrackList = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").TextTrackList = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_TextTrackListEventsImpl, _EventsImpl);
function _TextTrackListEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").TimeRanges = function() { return this.length; };
$dynamic("assert$html_Touch").Touch = function(){return this};
$dynamic("is$List").TouchList = function(){return true};
$dynamic("assert$List").TouchList = function(){return this};
$dynamic("assert$List_int").TouchList = function(){$throw(new TypeError._internal$ctor(this, "List<dart:core.int>"))};
$dynamic("assert$List_Element").TouchList = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").TouchList = function(){return true};
$dynamic("assert$Collection").TouchList = function(){return this};
$dynamic("assert$Collection_Object").TouchList = function(){return this};
$dynamic("assert$Collection_String").TouchList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").TouchList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.int>"))};
$dynamic("assert$Collection_num").TouchList = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.num>"))};
$dynamic("assert$Collection_Element").TouchList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").TouchList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").TouchList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").TouchList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").TouchList = function(){return this};
$dynamic("assert$Collection__NodeImpl").TouchList = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").TouchList = function(){return this};
$dynamic("get$length").TouchList = function() { return this.length; };
$dynamic("$index").TouchList = function(index) {
  return this[index];
}
$dynamic("$setindex").TouchList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").TouchList = function() {
  return new _FixedSizeListIterator_html_Touch(this);
}
$dynamic("add").TouchList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").TouchList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").TouchList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").TouchList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").TouchList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").TouchList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").TouchList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").TouchList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").TouchList = function($0) {
  return this.add(($0 == null ? null : $0.assert$html_Touch()));
};
$dynamic("addAll$1").TouchList = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_Touch()));
};
$dynamic("addLast$1").TouchList = function($0) {
  return this.addLast(($0 == null ? null : $0.assert$html_Touch()));
};
$dynamic("filter$1").TouchList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").TouchList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").TouchList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$kind").HTMLTrackElement = function() { return this.kind; };
$dynamic("get$readyState").HTMLTrackElement = function() { return this.readyState; };
$dynamic("is$List").Uint16Array = function(){return true};
$dynamic("assert$List").Uint16Array = function(){return this};
$dynamic("assert$List_int").Uint16Array = function(){return this};
$dynamic("assert$List_Element").Uint16Array = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").Uint16Array = function(){return true};
$dynamic("assert$Collection").Uint16Array = function(){return this};
$dynamic("assert$Collection_Object").Uint16Array = function(){return this};
$dynamic("assert$Collection_String").Uint16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").Uint16Array = function(){return this};
$dynamic("assert$Collection_num").Uint16Array = function(){return this};
$dynamic("assert$Collection_Element").Uint16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").Uint16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").Uint16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").Uint16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").Uint16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").Uint16Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").Uint16Array = function(){return this};
$dynamic("get$length").Uint16Array = function() { return this.length; };
$dynamic("$index").Uint16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").Uint16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint16Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint16Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint16Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").Uint16Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Uint16Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Uint16Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Uint16Array = function($0) {
  return this.add($assert_num($0));
};
$dynamic("addAll$1").Uint16Array = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_int()));
};
$dynamic("addLast$1").Uint16Array = function($0) {
  return this.addLast($assert_num($0));
};
$dynamic("filter$1").Uint16Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Uint16Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Uint16Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Uint32Array = function(){return true};
$dynamic("assert$List").Uint32Array = function(){return this};
$dynamic("assert$List_int").Uint32Array = function(){return this};
$dynamic("assert$List_Element").Uint32Array = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").Uint32Array = function(){return true};
$dynamic("assert$Collection").Uint32Array = function(){return this};
$dynamic("assert$Collection_Object").Uint32Array = function(){return this};
$dynamic("assert$Collection_String").Uint32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").Uint32Array = function(){return this};
$dynamic("assert$Collection_num").Uint32Array = function(){return this};
$dynamic("assert$Collection_Element").Uint32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").Uint32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").Uint32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").Uint32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").Uint32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").Uint32Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").Uint32Array = function(){return this};
$dynamic("get$length").Uint32Array = function() { return this.length; };
$dynamic("$index").Uint32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").Uint32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").Uint32Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Uint32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Uint32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Uint32Array = function($0) {
  return this.add($assert_num($0));
};
$dynamic("addAll$1").Uint32Array = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_int()));
};
$dynamic("addLast$1").Uint32Array = function($0) {
  return this.addLast($assert_num($0));
};
$dynamic("filter$1").Uint32Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Uint32Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Uint32Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Uint8Array = function(){return true};
$dynamic("assert$List").Uint8Array = function(){return this};
$dynamic("assert$List_int").Uint8Array = function(){return this};
$dynamic("assert$List_Element").Uint8Array = function(){$throw(new TypeError._internal$ctor(this, "List<html.Element>"))};
$dynamic("is$Collection").Uint8Array = function(){return true};
$dynamic("assert$Collection").Uint8Array = function(){return this};
$dynamic("assert$Collection_Object").Uint8Array = function(){return this};
$dynamic("assert$Collection_String").Uint8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<dart:core.String>"))};
$dynamic("assert$Collection_int").Uint8Array = function(){return this};
$dynamic("assert$Collection_num").Uint8Array = function(){return this};
$dynamic("assert$Collection_Element").Uint8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Element>"))};
$dynamic("assert$Collection_File").Uint8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.File>"))};
$dynamic("assert$dart_core_Collection_Node").Uint8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Node>"))};
$dynamic("assert$Collection_StyleSheet").Uint8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.StyleSheet>"))};
$dynamic("assert$Collection_Touch").Uint8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html.Touch>"))};
$dynamic("assert$Collection__NodeImpl").Uint8Array = function(){$throw(new TypeError._internal$ctor(this, "Collection<html._NodeImpl>"))};
$dynamic("assert$Iterable").Uint8Array = function(){return this};
$dynamic("get$length").Uint8Array = function() { return this.length; };
$dynamic("$index").Uint8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addLast").Uint8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint8Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint8Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint8Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("sort").Uint8Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Uint8Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Uint8Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Uint8Array = function($0) {
  return this.add($assert_num($0));
};
$dynamic("addAll$1").Uint8Array = function($0) {
  return this.addAll(($0 == null ? null : $0.assert$Collection_int()));
};
$dynamic("addLast$1").Uint8Array = function($0) {
  return this.addLast($assert_num($0));
};
$dynamic("filter$1").Uint8Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Uint8Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Uint8Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$name").WebGLActiveInfo = function() { return this.name; };
$dynamic("get$on").WebSocket = function() {
  return new _WebSocketEventsImpl(this);
}
$dynamic("get$readyState").WebSocket = function() { return this.readyState; };
$dynamic("$dom_addEventListener$3").WebSocket = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").WebSocket = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_WebSocketEventsImpl, _EventsImpl);
function _WebSocketEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").DOMWindow = function() {
  return new _WindowEventsImpl(this);
}
$dynamic("get$length").DOMWindow = function() { return this.length; };
$dynamic("get$name").DOMWindow = function() { return this.name; };
$dynamic("get$status").DOMWindow = function() { return this.status; };
$dynamic("$dom_addEventListener$3").DOMWindow = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").DOMWindow = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("open$3").DOMWindow = function($0, $1, $2) {
  return this.open($assert_String($0), $assert_String($1), $assert_String($2));
};
$inherits(_WindowEventsImpl, _EventsImpl);
function _WindowEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_WindowEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
$dynamic("get$on").Worker = function() {
  return new _WorkerEventsImpl(this);
}
$inherits(_WorkerEventsImpl, _AbstractWorkerEventsImpl);
function _WorkerEventsImpl(_ptr) {
  _AbstractWorkerEventsImpl.call(this, _ptr);
}
$dynamic("assert$html_XMLHttpRequest").XMLHttpRequest = function(){return this};
$dynamic("get$on").XMLHttpRequest = function() {
  return new _XMLHttpRequestEventsImpl(this);
}
$dynamic("get$readyState").XMLHttpRequest = function() { return this.readyState; };
$dynamic("get$responseText").XMLHttpRequest = function() { return this.responseText; };
$dynamic("get$status").XMLHttpRequest = function() { return this.status; };
$dynamic("set$withCredentials").XMLHttpRequest = function(value) { return this.withCredentials = value; };
$dynamic("$dom_addEventListener$3").XMLHttpRequest = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").XMLHttpRequest = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("open$3").XMLHttpRequest = function($0, $1, $2) {
  return this.open($assert_String($0), $assert_String($1), $notnull_bool($2));
};
$dynamic("send$0").XMLHttpRequest = function() {
  return this.send();
};
$inherits(_XMLHttpRequestEventsImpl, _EventsImpl);
function _XMLHttpRequestEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_XMLHttpRequestEventsImpl.prototype.get$readyStateChange = function() {
  return this._get("readystatechange");
}
$dynamic("get$name").XMLHttpRequestException = function() { return this.name; };
$dynamic("get$on").XMLHttpRequestUpload = function() {
  return new _XMLHttpRequestUploadEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").XMLHttpRequestUpload = function($0, $1, $2) {
  return this.addEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$dynamic("$dom_removeEventListener$3").XMLHttpRequestUpload = function($0, $1, $2) {
  return this.removeEventListener($assert_String($0), $wrap_call$1(to$call$1($1)), $notnull_bool($2));
};
$inherits(_XMLHttpRequestUploadEventsImpl, _EventsImpl);
function _XMLHttpRequestUploadEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").XPathException = function() { return this.name; };
function _AudioElementFactoryProvider() {}
function _CSSMatrixFactoryProvider() {}
function _DOMParserFactoryProvider() {}
function _DOMURLFactoryProvider() {}
function _DeprecatedPeerConnectionFactoryProvider() {}
function _EventSourceFactoryProvider() {}
function _FileReaderFactoryProvider() {}
function _FileReaderSyncFactoryProvider() {}
function _IceCandidateFactoryProvider() {}
function _MediaControllerFactoryProvider() {}
function _MediaStreamFactoryProvider() {}
function _MessageChannelFactoryProvider() {}
function _NotificationFactoryProvider() {}
function _OptionElementFactoryProvider() {}
function _PeerConnection00FactoryProvider() {}
function _SessionDescriptionFactoryProvider() {}
function _ShadowRootFactoryProvider() {}
function _SharedWorkerFactoryProvider() {}
function _SpeechGrammarFactoryProvider() {}
function _SpeechGrammarListFactoryProvider() {}
function _SpeechRecognitionFactoryProvider() {}
function _TextTrackCueFactoryProvider() {}
function _WorkerFactoryProvider() {}
function _XMLHttpRequestFactoryProvider() {}
_XMLHttpRequestFactoryProvider.XMLHttpRequest$factory = function() {
  return new XMLHttpRequest();
}
_XMLHttpRequestFactoryProvider.XMLHttpRequest$get$factory = function(url, onSuccess) {
  return _XMLHttpRequestUtils.get(url, onSuccess);
}
function _XMLSerializerFactoryProvider() {}
function _XPathEvaluatorFactoryProvider() {}
function _XSLTProcessorFactoryProvider() {}
function _Elements() {}
function _Collections() {}
_Collections.forEach = function(iterable, f) {
  for (var $$i = iterable.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    f(e);
  }
}
_Collections.filter = function(source, destination, f) {
  for (var $$i = source.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (f(e)) destination.add$1(e);
  }
  return destination;
}
function _XMLHttpRequestUtils() {}
_XMLHttpRequestUtils.get = function(url, onSuccess) {
  var request = _XMLHttpRequestFactoryProvider.XMLHttpRequest$factory();
  request.open$3("GET", url, true);
  request.set$withCredentials(true);
  request.get$on().get$readyStateChange().add((function (e) {
    if ($eq$(request.get$readyState(), (4)) && ($eq$(request.get$status(), (200)) || $eq$(request.get$status(), (0)))) {
      onSuccess((request == null ? null : request.assert$html_XMLHttpRequest()));
    }
  })
  , false);
  request.send$0();
  return (request == null ? null : request.assert$html_XMLHttpRequest());
}
function _MeasurementRequest() {}
_MeasurementRequest.prototype.assert$_MeasurementRequest = function(){return this};
_MeasurementRequest.prototype.get$value = function() { return this.value; };
_MeasurementRequest.prototype.set$value = function(value) { return this.value = value; };
function _EventFactoryProvider() {}
function _MouseEventFactoryProvider() {}
function _CSSStyleDeclarationFactoryProvider() {}
function _DocumentFragmentFactoryProvider() {}
function _SVGElementFactoryProvider() {}
function _SVGSVGElementFactoryProvider() {}
function _DOMWindowCrossFrameImpl() {}
_DOMWindowCrossFrameImpl.prototype.get$length = function() {
  return this._window.length;
}
function _AudioContextFactoryProvider() {}
function _PointFactoryProvider() {}
function _WebSocketFactoryProvider() {}
function _TextFactoryProvider() {}
function _IDBKeyRangeFactoryProvider() {}
function _TypedArrayFactoryProvider() {}
function Testing() {}
function _Device() {}
function _VariableSizeListIterator() {}
_VariableSizeListIterator.prototype.assert$Iterator = function(){return this};
_VariableSizeListIterator.prototype.assert$Iterator_dart_core_String = function(){return this};
_VariableSizeListIterator.prototype.assert$Iterator_Element = function(){return this};
_VariableSizeListIterator.prototype.hasNext = function() {
  return this._html_array.get$length() > this._html_pos;
}
_VariableSizeListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._html_array.$index(this._html_pos++);
}
$inherits(_FixedSizeListIterator, _VariableSizeListIterator);
function _FixedSizeListIterator() {}
_FixedSizeListIterator.prototype.hasNext = function() {
  return this._html_length > this._html_pos;
}
$inherits(_VariableSizeListIterator_dart_core_String, _VariableSizeListIterator);
function _VariableSizeListIterator_dart_core_String(array) {
  this._html_array = array;
  this._html_pos = (0);
}
_VariableSizeListIterator_dart_core_String.prototype.assert$Iterator_Element = function(){$throw(new TypeError._internal$ctor(this, "Iterator<html.Element>"))};
$inherits(_FixedSizeListIterator_dart_core_String, _FixedSizeListIterator);
function _FixedSizeListIterator_dart_core_String(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_dart_core_String.call(this, array);
}
$inherits(_VariableSizeListIterator_int, _VariableSizeListIterator);
function _VariableSizeListIterator_int(array) {
  this._html_array = array;
  this._html_pos = (0);
}
_VariableSizeListIterator_int.prototype.assert$Iterator_dart_core_String = function(){$throw(new TypeError._internal$ctor(this, "Iterator<dart:core.String>"))};
_VariableSizeListIterator_int.prototype.assert$Iterator_Element = function(){$throw(new TypeError._internal$ctor(this, "Iterator<html.Element>"))};
$inherits(_FixedSizeListIterator_int, _FixedSizeListIterator);
function _FixedSizeListIterator_int(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_int.call(this, array);
}
$inherits(_VariableSizeListIterator_num, _VariableSizeListIterator);
function _VariableSizeListIterator_num(array) {
  this._html_array = array;
  this._html_pos = (0);
}
_VariableSizeListIterator_num.prototype.assert$Iterator_dart_core_String = function(){$throw(new TypeError._internal$ctor(this, "Iterator<dart:core.String>"))};
_VariableSizeListIterator_num.prototype.assert$Iterator_Element = function(){$throw(new TypeError._internal$ctor(this, "Iterator<html.Element>"))};
$inherits(_FixedSizeListIterator_num, _FixedSizeListIterator);
function _FixedSizeListIterator_num(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_num.call(this, array);
}
$inherits(_VariableSizeListIterator_html_File, _VariableSizeListIterator);
function _VariableSizeListIterator_html_File(array) {
  this._html_array = array;
  this._html_pos = (0);
}
_VariableSizeListIterator_html_File.prototype.assert$Iterator_dart_core_String = function(){$throw(new TypeError._internal$ctor(this, "Iterator<dart:core.String>"))};
_VariableSizeListIterator_html_File.prototype.assert$Iterator_Element = function(){$throw(new TypeError._internal$ctor(this, "Iterator<html.Element>"))};
$inherits(_FixedSizeListIterator_html_File, _FixedSizeListIterator);
function _FixedSizeListIterator_html_File(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_File.call(this, array);
}
$inherits(_VariableSizeListIterator_html_Node, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Node(array) {
  this._html_array = array;
  this._html_pos = (0);
}
_VariableSizeListIterator_html_Node.prototype.assert$Iterator_dart_core_String = function(){$throw(new TypeError._internal$ctor(this, "Iterator<dart:core.String>"))};
_VariableSizeListIterator_html_Node.prototype.assert$Iterator_Element = function(){$throw(new TypeError._internal$ctor(this, "Iterator<html.Element>"))};
$inherits(_FixedSizeListIterator_html_Node, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Node(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Node.call(this, array);
}
$inherits(_VariableSizeListIterator_html_StyleSheet, _VariableSizeListIterator);
function _VariableSizeListIterator_html_StyleSheet(array) {
  this._html_array = array;
  this._html_pos = (0);
}
_VariableSizeListIterator_html_StyleSheet.prototype.assert$Iterator_dart_core_String = function(){$throw(new TypeError._internal$ctor(this, "Iterator<dart:core.String>"))};
_VariableSizeListIterator_html_StyleSheet.prototype.assert$Iterator_Element = function(){$throw(new TypeError._internal$ctor(this, "Iterator<html.Element>"))};
$inherits(_FixedSizeListIterator_html_StyleSheet, _FixedSizeListIterator);
function _FixedSizeListIterator_html_StyleSheet(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_StyleSheet.call(this, array);
}
$inherits(_VariableSizeListIterator_html_Touch, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Touch(array) {
  this._html_array = array;
  this._html_pos = (0);
}
_VariableSizeListIterator_html_Touch.prototype.assert$Iterator_dart_core_String = function(){$throw(new TypeError._internal$ctor(this, "Iterator<dart:core.String>"))};
_VariableSizeListIterator_html_Touch.prototype.assert$Iterator_Element = function(){$throw(new TypeError._internal$ctor(this, "Iterator<html.Element>"))};
$inherits(_FixedSizeListIterator_html_Touch, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Touch(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Touch.call(this, array);
}
function _Lists() {}
function get$$document() {
  return document;
}
var _cachedBrowserPrefix;
var _pendingRequests;
var _pendingMeasurementFrameCallbacks;
var _JSON = JSON;
function json_JSON() {}
json_JSON.parse = function(str) {
  return _JSON.parse(str, (function (_, obj) {
    var keys = _jsKeys(obj);
    if ($eq$(keys)) return obj;
    var map = new HashMapImplementation();
    for (var $$i = keys.iterator(); $$i.hasNext(); ) {
      var key = $$i.next();
      map.$setindex(key, _getValue(obj, key));
    }
    return map;
  })
  );
}
function _getValue(obj, key) {
  return obj[key]
}
function _jsKeys(obj) {
  if (obj != null && typeof obj == 'object' && !(obj instanceof Array)) {
  return Object.keys(obj);
  }
  return null;
}
function Token(kind, source, start, end) {
  this.kind = kind;
  this.source = source;
  this.start = start;
  this.end = end;
}
Token.prototype.assert$Token = function(){return this};
Token.prototype.get$kind = function() { return this.kind; };
Token.prototype.get$text = function() {
  return this.source.get$text().substring(this.start, this.end);
}
Token.prototype.toString = function() {
  var kindText = TokenKind.kindToString(this.kind);
  var actualText = this.get$text();
  if ($ne$(kindText, actualText)) {
    if (actualText.get$length() > (10)) {
      actualText = $add$(actualText.substring((0), (8)), "...");
    }
    return ("" + kindText + "(" + actualText + ")");
  }
  else {
    return $assert_String(kindText);
  }
}
$inherits(LiteralToken, Token);
function LiteralToken(kind, source, start, end, value) {
  this.value = value;
  Token.call(this, kind, source, start, end);
}
LiteralToken.prototype.get$value = function() { return this.value; };
LiteralToken.prototype.set$value = function(value) { return this.value = value; };
$inherits(ErrorToken, Token);
function ErrorToken(kind, source, start, end, message) {
  this.message = message;
  Token.call(this, kind, source, start, end);
}
function SourceFile(filename, _text) {
  this.filename = filename;
  this._text = _text;
}
SourceFile.prototype.assert$SourceFile = function(){return this};
SourceFile.prototype.get$text = function() {
  return this._text;
}
SourceFile.prototype.compareTo = function(other) {
  if (this.orderInLibrary != null && other.orderInLibrary != null) {
    return this.orderInLibrary - other.orderInLibrary;
  }
  else {
    return $assert_num(this.filename.compareTo$1(other.filename));
  }
}
SourceFile.prototype.compareTo$1 = function($0) {
  return this.compareTo(($0 == null ? null : $0.assert$SourceFile()));
};
function InterpStack(previous, quote, isMultiline) {
  this.previous = previous;
  this.quote = quote;
  this.isMultiline = isMultiline;
  this.depth = (-1);
}
InterpStack.prototype.assert$InterpStack = function(){return this};
InterpStack.prototype.set$previous = function(value) { return this.previous = value; };
InterpStack.prototype.get$quote = function() { return this.quote; };
InterpStack.prototype.get$isMultiline = function() { return this.isMultiline; };
InterpStack.prototype.pop = function() {
  return this.previous;
}
InterpStack.push = function(stack, quote, isMultiline) {
  var newStack = new InterpStack(stack, quote, isMultiline);
  if (stack != null) newStack.set$previous(stack);
  return (newStack == null ? null : newStack.assert$InterpStack());
}
function TokenizerHelpers() {

}
TokenizerHelpers.isIdentifierStart = function(c) {
  return ((c >= (97) && c <= (122)) || (c >= (65) && c <= (90)) || c == (95));
}
TokenizerHelpers.isDigit = function(c) {
  return (c >= (48) && c <= (57));
}
TokenizerHelpers.isIdentifierPart = function(c) {
  return (TokenizerHelpers.isIdentifierStart(c) || TokenizerHelpers.isDigit(c) || c == (36));
}
TokenizerHelpers.isInterpIdentifierPart = function(c) {
  return (TokenizerHelpers.isIdentifierStart(c) || TokenizerHelpers.isDigit(c));
}
$inherits(TokenizerBase, TokenizerHelpers);
function TokenizerBase(_source, _skipWhitespace, index) {
  this._source = _source;
  this._skipWhitespace = _skipWhitespace;
  this._lang_index = index;
  TokenizerHelpers.call(this);
  this._text = this._source.get$text();
}
TokenizerBase.prototype._nextChar = function() {
  if (this._lang_index < this._text.length) {
    return this._text.charCodeAt(this._lang_index++);
  }
  else {
    return (0);
  }
}
TokenizerBase.prototype._peekChar = function() {
  if (this._lang_index < this._text.length) {
    return this._text.charCodeAt(this._lang_index);
  }
  else {
    return (0);
  }
}
TokenizerBase.prototype._maybeEatChar = function(ch) {
  if (this._lang_index < this._text.length) {
    if (this._text.charCodeAt(this._lang_index) == ch) {
      this._lang_index++;
      return true;
    }
    else {
      return false;
    }
  }
  else {
    return false;
  }
}
TokenizerBase.prototype._finishToken = function(kind) {
  return new Token(kind, this._source, this._startIndex, this._lang_index);
}
TokenizerBase.prototype._errorToken = function(message) {
  return new ErrorToken((65), this._source, this._startIndex, this._lang_index, message);
}
TokenizerBase.prototype.finishWhitespace = function() {
  this._lang_index--;
  while (this._lang_index < this._text.length) {
    var ch = this._text.charCodeAt(this._lang_index++);
    if ($eq$(ch, (32)) || $eq$(ch, (9)) || $eq$(ch, (13))) {
    }
    else if ($eq$(ch, (10))) {
      if (!this._skipWhitespace) {
        return this._finishToken((63));
      }
    }
    else {
      this._lang_index--;
      if (this._skipWhitespace) {
        return this.next();
      }
      else {
        return this._finishToken((63));
      }
    }
  }
  return this._finishToken((1));
}
TokenizerBase.prototype.finishHashBang = function() {
  while (true) {
    var ch = this._nextChar();
    if (ch == (0) || ch == (10) || ch == (13)) {
      return this._finishToken((13));
    }
  }
}
TokenizerBase.prototype.finishSingleLineComment = function() {
  while (true) {
    var ch = this._nextChar();
    if (ch == (0) || ch == (10) || ch == (13)) {
      if (this._skipWhitespace) {
        return this.next();
      }
      else {
        return this._finishToken((64));
      }
    }
  }
}
TokenizerBase.prototype.finishMultiLineComment = function() {
  var nesting = (1);
  do {
    var ch = this._nextChar();
    if (ch == (0)) {
      return this._errorToken();
    }
    else if (ch == (42)) {
      if (this._maybeEatChar((47))) {
        nesting--;
      }
    }
    else if (ch == (47)) {
      if (this._maybeEatChar((42))) {
        nesting++;
      }
    }
  }
  while (nesting > (0))
  if (this._skipWhitespace) {
    return this.next();
  }
  else {
    return this._finishToken((64));
  }
}
TokenizerBase.prototype.eatDigits = function() {
  while (this._lang_index < this._text.length) {
    if (TokenizerHelpers.isDigit(this._text.charCodeAt(this._lang_index))) {
      this._lang_index++;
    }
    else {
      return;
    }
  }
}
TokenizerBase._hexDigit = function(c) {
  if (c >= (48) && c <= (57)) {
    return c - (48);
  }
  else if (c >= (97) && c <= (102)) {
    return c - (87);
  }
  else if (c >= (65) && c <= (70)) {
    return c - (55);
  }
  else {
    return (-1);
  }
}
TokenizerBase.prototype.readHex = function(hexLength) {
  var maxIndex;
  if (null == hexLength) {
    maxIndex = this._text.length - (1);
  }
  else {
    maxIndex = this._lang_index + hexLength;
    if (maxIndex >= this._text.length) return (-1);
  }
  var result = (0);
  while (this._lang_index < maxIndex) {
    var digit = TokenizerBase._hexDigit(this._text.charCodeAt(this._lang_index));
    if ($eq$(digit, (-1))) {
      if (null == hexLength) {
        return $assert_num(result);
      }
      else {
        return (-1);
      }
    }
    TokenizerBase._hexDigit(this._text.charCodeAt(this._lang_index));
    result = $add$(($mul$(result, (16))), $assert_num(digit));
    this._lang_index++;
  }
  return $assert_num(result);
}
TokenizerBase.prototype.finishHex = function() {
  var value = this.readHex();
  return new LiteralToken((61), this._source, this._startIndex, this._lang_index, value);
}
TokenizerBase.prototype.finishNumber = function() {
  this.eatDigits();
  if (this._peekChar() == (46)) {
    this._nextChar();
    if (TokenizerHelpers.isDigit(this._peekChar())) {
      this.eatDigits();
      return this.finishNumberExtra((62));
    }
    else {
      this._lang_index--;
    }
  }
  return this.finishNumberExtra((60));
}
TokenizerBase.prototype.finishNumberExtra = function(kind) {
  if (this._maybeEatChar((101)) || this._maybeEatChar((69))) {
    kind = (62);
    this._maybeEatChar((45));
    this._maybeEatChar((43));
    this.eatDigits();
  }
  if (this._peekChar() != (0) && TokenizerHelpers.isIdentifierStart(this._peekChar())) {
    this._nextChar();
    return this._errorToken("illegal character in number");
  }
  return this._finishToken(kind);
}
TokenizerBase.prototype._makeStringToken = function(buf, isPart) {
  var s = Strings.String$fromCharCodes$factory(buf);
  var kind = isPart ? (59) : (58);
  return new LiteralToken(kind, this._source, this._startIndex, this._lang_index, s);
}
TokenizerBase.prototype._makeRawStringToken = function(isMultiline) {
  var s;
  if (isMultiline) {
    var start = this._startIndex + (4);
    if (this._source.get$text()[start] == "\n") start++;
    s = this._source.get$text().substring(start, this._lang_index - (3));
  }
  else {
    s = this._source.get$text().substring(this._startIndex + (2), this._lang_index - (1));
  }
  return new LiteralToken((58), this._source, this._startIndex, this._lang_index, s);
}
TokenizerBase.prototype.finishMultilineString = function(quote) {
  var buf = [];
  while (true) {
    var ch = this._nextChar();
    if (ch == (0)) {
      return this._errorToken();
    }
    else if (ch == quote) {
      if (this._maybeEatChar(quote)) {
        if (this._maybeEatChar(quote)) {
          return this._makeStringToken((buf == null ? null : buf.assert$List_int()), false);
        }
        buf.add$1(quote);
      }
      buf.add$1(quote);
    }
    else if (ch == (36)) {
      this._interpStack = InterpStack.push(this._interpStack, quote, true);
      return this._makeStringToken((buf == null ? null : buf.assert$List_int()), true);
    }
    else if (ch == (92)) {
      var escapeVal = this.readEscapeSequence();
      if ($eq$(escapeVal, (-1))) {
        return this._errorToken("invalid hex escape sequence");
      }
      else {
        buf.add$1(escapeVal);
      }
    }
    else {
      buf.add$1(ch);
    }
  }
}
TokenizerBase.prototype._finishOpenBrace = function() {
  var $0;
  if (this._interpStack != null) {
    if (this._interpStack.depth == (-1)) {
      this._interpStack.depth = (1);
    }
    else {
      _assert(this._interpStack.depth >= (0), "_interpStack.depth >= 0", "/Applications/dart/dart-sdk/lib/frog/tokenizer.dart", (314), (16));
      ($0 = this._interpStack).depth = $0.depth + (1);
    }
  }
  return this._finishToken((6));
}
TokenizerBase.prototype._finishCloseBrace = function() {
  var $0;
  if (this._interpStack != null) {
    ($0 = this._interpStack).depth = $0.depth - (1);
    _assert(this._interpStack.depth >= (0), "_interpStack.depth >= 0", "/Applications/dart/dart-sdk/lib/frog/tokenizer.dart", (324), (14));
  }
  return this._finishToken((7));
}
TokenizerBase.prototype.finishString = function(quote) {
  if (this._maybeEatChar(quote)) {
    if (this._maybeEatChar(quote)) {
      this._maybeEatChar((10));
      return this.finishMultilineString(quote);
    }
    else {
      return this._makeStringToken(new Array(), false);
    }
  }
  return this.finishStringBody(quote);
}
TokenizerBase.prototype.finishRawString = function(quote) {
  if (this._maybeEatChar(quote)) {
    if (this._maybeEatChar(quote)) {
      return this.finishMultilineRawString(quote);
    }
    else {
      return this._makeStringToken([], false);
    }
  }
  while (true) {
    var ch = this._nextChar();
    if (ch == quote) {
      return this._makeRawStringToken(false);
    }
    else if (ch == (0)) {
      return this._errorToken();
    }
  }
}
TokenizerBase.prototype.finishMultilineRawString = function(quote) {
  while (true) {
    var ch = this._nextChar();
    if (ch == (0)) {
      return this._errorToken();
    }
    else if (ch == quote && this._maybeEatChar(quote) && this._maybeEatChar(quote)) {
      return this._makeRawStringToken(true);
    }
  }
}
TokenizerBase.prototype.finishStringBody = function(quote) {
  var buf = new Array();
  while (true) {
    var ch = this._nextChar();
    if (ch == quote) {
      return this._makeStringToken((buf == null ? null : buf.assert$List_int()), false);
    }
    else if (ch == (36)) {
      this._interpStack = InterpStack.push(this._interpStack, quote, false);
      return this._makeStringToken((buf == null ? null : buf.assert$List_int()), true);
    }
    else if (ch == (0)) {
      return this._errorToken();
    }
    else if (ch == (92)) {
      var escapeVal = this.readEscapeSequence();
      if ($eq$(escapeVal, (-1))) {
        return this._errorToken("invalid hex escape sequence");
      }
      else {
        buf.add$1(escapeVal);
      }
    }
    else {
      buf.add$1(ch);
    }
  }
}
TokenizerBase.prototype.readEscapeSequence = function() {
  var ch = this._nextChar();
  var hexValue;
  switch (ch) {
    case (110):

      return (10);

    case (114):

      return (13);

    case (102):

      return (12);

    case (98):

      return (8);

    case (116):

      return (9);

    case (118):

      return (11);

    case (120):

      hexValue = this.readHex((2));
      break;

    case (117):

      if (this._maybeEatChar((123))) {
        hexValue = this.readHex();
        if (!this._maybeEatChar((125))) {
          return (-1);
        }
        else {
          break;
        }
      }
      else {
        hexValue = this.readHex((4));
        break;
      }

    default:

      return $assert_num(ch);

  }
  if (hexValue == (-1)) return (-1);
  if (hexValue < (55296) || hexValue > (57343) && hexValue <= (65535)) {
    return hexValue;
  }
  else if (hexValue <= (1114111)) {
    $globals.world.fatal("unicode values greater than 2 bytes not implemented yet");
    return (-1);
  }
  else {
    return (-1);
  }
}
TokenizerBase.prototype.finishDot = function() {
  if (TokenizerHelpers.isDigit(this._peekChar())) {
    this.eatDigits();
    return this.finishNumberExtra((62));
  }
  else {
    return this._finishToken((14));
  }
}
TokenizerBase.prototype.finishIdentifier = function(ch) {
  if (this._interpStack != null && this._interpStack.depth == (-1)) {
    this._interpStack.depth = (0);
    if (ch == (36)) {
      return this._errorToken("illegal character after $ in string interpolation");
    }
    while (this._lang_index < this._text.length) {
      if (!TokenizerHelpers.isInterpIdentifierPart(this._text.charCodeAt(this._lang_index++))) {
        this._lang_index--;
        break;
      }
    }
  }
  else {
    while (this._lang_index < this._text.length) {
      if (!TokenizerHelpers.isIdentifierPart(this._text.charCodeAt(this._lang_index++))) {
        this._lang_index--;
        break;
      }
    }
  }
  var kind = this.getIdentifierKind();
  if (kind == (70)) {
    return this._finishToken((70));
  }
  else {
    return this._finishToken(kind);
  }
}
$inherits(Tokenizer, TokenizerBase);
function Tokenizer(source, skipWhitespace, index) {
  TokenizerBase.call(this, source, skipWhitespace, index);
}
Tokenizer.prototype.next = function() {
  this._startIndex = this._lang_index;
  if (this._interpStack != null && this._interpStack.depth == (0)) {
    var istack = this._interpStack;
    this._interpStack = this._interpStack.pop();
    if (istack.get$isMultiline()) {
      return this.finishMultilineString(istack.get$quote());
    }
    else {
      return this.finishStringBody(istack.get$quote());
    }
  }
  var ch;
  ch = this._nextChar();
  switch (ch) {
    case (0):

      return this._finishToken((1));

    case (32):
    case (9):
    case (10):
    case (13):

      return this.finishWhitespace();

    case (33):

      if (this._maybeEatChar((61))) {
        if (this._maybeEatChar((61))) {
          return this._finishToken((51));
        }
        else {
          return this._finishToken((49));
        }
      }
      else {
        return this._finishToken((19));
      }

    case (34):

      return this.finishString((34));

    case (35):

      if (this._maybeEatChar((33))) {
        return this.finishHashBang();
      }
      else {
        return this._finishToken((12));
      }

    case (36):

      if (this._maybeEatChar((34))) {
        return this.finishString((34));
      }
      else if (this._maybeEatChar((39))) {
        return this.finishString((39));
      }
      else {
        return this.finishIdentifier((36));
      }

    case (37):

      if (this._maybeEatChar((61))) {
        return this._finishToken((32));
      }
      else {
        return this._finishToken((47));
      }

    case (38):

      if (this._maybeEatChar((38))) {
        return this._finishToken((35));
      }
      else if (this._maybeEatChar((61))) {
        return this._finishToken((23));
      }
      else {
        return this._finishToken((38));
      }

    case (39):

      return this.finishString((39));

    case (40):

      return this._finishToken((2));

    case (41):

      return this._finishToken((3));

    case (42):

      if (this._maybeEatChar((61))) {
        return this._finishToken((29));
      }
      else {
        return this._finishToken((44));
      }

    case (43):

      if (this._maybeEatChar((43))) {
        return this._finishToken((16));
      }
      else if (this._maybeEatChar((61))) {
        return this._finishToken((27));
      }
      else {
        return this._finishToken((42));
      }

    case (44):

      return this._finishToken((11));

    case (45):

      if (this._maybeEatChar((45))) {
        return this._finishToken((17));
      }
      else if (this._maybeEatChar((61))) {
        return this._finishToken((28));
      }
      else {
        return this._finishToken((43));
      }

    case (46):

      if (this._maybeEatChar((46))) {
        if (this._maybeEatChar((46))) {
          return this._finishToken((15));
        }
        else {
          return this._errorToken();
        }
      }
      else {
        return this.finishDot();
      }

    case (47):

      if (this._maybeEatChar((42))) {
        return this.finishMultiLineComment();
      }
      else if (this._maybeEatChar((47))) {
        return this.finishSingleLineComment();
      }
      else if (this._maybeEatChar((61))) {
        return this._finishToken((30));
      }
      else {
        return this._finishToken((45));
      }

    case (48):

      if (this._maybeEatChar((88))) {
        return this.finishHex();
      }
      else if (this._maybeEatChar((120))) {
        return this.finishHex();
      }
      else {
        return this.finishNumber();
      }

    case (58):

      return this._finishToken((8));

    case (59):

      return this._finishToken((10));

    case (60):

      if (this._maybeEatChar((60))) {
        if (this._maybeEatChar((61))) {
          return this._finishToken((24));
        }
        else {
          return this._finishToken((39));
        }
      }
      else if (this._maybeEatChar((61))) {
        return this._finishToken((54));
      }
      else {
        return this._finishToken((52));
      }

    case (61):

      if (this._maybeEatChar((61))) {
        if (this._maybeEatChar((61))) {
          return this._finishToken((50));
        }
        else {
          return this._finishToken((48));
        }
      }
      else if (this._maybeEatChar((62))) {
        return this._finishToken((9));
      }
      else {
        return this._finishToken((20));
      }

    case (62):

      if (this._maybeEatChar((61))) {
        return this._finishToken((55));
      }
      else if (this._maybeEatChar((62))) {
        if (this._maybeEatChar((61))) {
          return this._finishToken((25));
        }
        else if (this._maybeEatChar((62))) {
          if (this._maybeEatChar((61))) {
            return this._finishToken((26));
          }
          else {
            return this._finishToken((41));
          }
        }
        else {
          return this._finishToken((40));
        }
      }
      else {
        return this._finishToken((53));
      }

    case (63):

      return this._finishToken((33));

    case (64):

      if (this._maybeEatChar((34))) {
        return this.finishRawString((34));
      }
      else if (this._maybeEatChar((39))) {
        return this.finishRawString((39));
      }
      else {
        return this._errorToken();
      }

    case (91):

      if (this._maybeEatChar((93))) {
        if (this._maybeEatChar((61))) {
          return this._finishToken((57));
        }
        else {
          return this._finishToken((56));
        }
      }
      else {
        return this._finishToken((4));
      }

    case (93):

      return this._finishToken((5));

    case (94):

      if (this._maybeEatChar((61))) {
        return this._finishToken((22));
      }
      else {
        return this._finishToken((37));
      }

    case (123):

      return this._finishOpenBrace();

    case (124):

      if (this._maybeEatChar((61))) {
        return this._finishToken((21));
      }
      else if (this._maybeEatChar((124))) {
        return this._finishToken((34));
      }
      else {
        return this._finishToken((36));
      }

    case (125):

      return this._finishCloseBrace();

    case (126):

      if (this._maybeEatChar((47))) {
        if (this._maybeEatChar((61))) {
          return this._finishToken((31));
        }
        else {
          return this._finishToken((46));
        }
      }
      else {
        return this._finishToken((18));
      }

    default:

      if (TokenizerHelpers.isIdentifierStart(ch)) {
        return this.finishIdentifier(ch);
      }
      else if (TokenizerHelpers.isDigit(ch)) {
        return this.finishNumber();
      }
      else {
        return this._errorToken();
      }

  }
}
Tokenizer.prototype.getIdentifierKind = function() {
  var i0 = this._startIndex;
  var ch;
  switch ($sub$(this._lang_index, $assert_num(i0))) {
    case (2):

      ch = this._text.charCodeAt($assert_num(i0));
      if (ch == (100)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (111)) return (95);
      }
      else if (ch == (105)) {
        ch = this._text.charCodeAt($assert_num($add$(i0, (1))));
        if (ch == (102)) {
          return (102);
        }
        else if (ch == (110)) {
          return (103);
        }
        else if (ch == (115)) {
          return (104);
        }
      }
      return (70);

    case (3):

      ch = this._text.charCodeAt($assert_num(i0));
      if (ch == (102)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (111) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (114)) return (101);
      }
      else if (ch == (103)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (116)) return (75);
      }
      else if (ch == (110)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (119)) return (105);
      }
      else if (ch == (115)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (116)) return (83);
      }
      else if (ch == (116)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (121)) return (113);
      }
      else if (ch == (118)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (114)) return (114);
      }
      return (70);

    case (4):

      ch = this._text.charCodeAt($assert_num(i0));
      if (ch == (99)) {
        ch = this._text.charCodeAt($assert_num($add$(i0, (1))));
        if (ch == (97)) {
          ch = this._text.charCodeAt($assert_num($add$(i0, (2))));
          if (ch == (108)) {
            if (this._text.charCodeAt($assert_num($add$(i0, (3)))) == (108)) return (73);
          }
          else if (ch == (115)) {
            if (this._text.charCodeAt($assert_num($add$(i0, (3)))) == (101)) return (89);
          }
        }
      }
      else if (ch == (101)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (108) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (115) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (101)) return (96);
      }
      else if (ch == (110)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (117) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (108) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (108)) return (106);
      }
      else if (ch == (116)) {
        ch = this._text.charCodeAt($assert_num($add$(i0, (1))));
        if (ch == (104)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (105) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (115)) return (110);
        }
        else if (ch == (114)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (117) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (101)) return (112);
        }
      }
      else if (ch == (118)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (111) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (105) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (100)) return (115);
      }
      return (70);

    case (5):

      ch = this._text.charCodeAt($assert_num(i0));
      if (ch == (97)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (119) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (105) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (116)) return (87);
      }
      else if (ch == (98)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (107)) return (88);
      }
      else if (ch == (99)) {
        ch = this._text.charCodeAt($assert_num($add$(i0, (1))));
        if (ch == (97)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (99) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (104)) return (90);
        }
        else if (ch == (108)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (115) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (115)) return (91);
        }
        else if (ch == (111)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (110) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (115) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (116)) return (92);
        }
      }
      else if (ch == (102)) {
        ch = this._text.charCodeAt($assert_num($add$(i0, (1))));
        if (ch == (97)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (108) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (115) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (101)) return (98);
        }
        else if (ch == (105)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (110) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (108)) return (99);
        }
      }
      else if (ch == (115)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (117) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (112) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (114)) return (108);
      }
      else if (ch == (116)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (104) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (111) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (119)) return (111);
      }
      else if (ch == (119)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (104) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (105) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (108) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (101)) return (116);
      }
      return (70);

    case (6):

      ch = this._text.charCodeAt($assert_num(i0));
      if (ch == (97)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (115) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (115) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (116)) return (72);
      }
      else if (ch == (105)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (109) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (112) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (111) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (116)) return (77);
      }
      else if (ch == (110)) {
        ch = this._text.charCodeAt($assert_num($add$(i0, (1))));
        if (ch == (97)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (105) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (118) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (101)) return (80);
        }
        else if (ch == (101)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (103) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (101)) return (81);
        }
      }
      else if (ch == (114)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (117) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (110)) return (107);
      }
      else if (ch == (115)) {
        ch = this._text.charCodeAt($assert_num($add$(i0, (1))));
        if (ch == (111)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (117) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (99) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (101)) return (84);
        }
        else if (ch == (116)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (105) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (99)) return (85);
        }
        else if (ch == (119)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (105) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (99) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (104)) return (109);
        }
      }
      return (70);

    case (7):

      ch = this._text.charCodeAt($assert_num(i0));
      if (ch == (100)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (102) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (117) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (108) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (116)) return (94);
      }
      else if (ch == (101)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (120) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (110) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (100) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (115)) return (97);
      }
      else if (ch == (102)) {
        ch = this._text.charCodeAt($assert_num($add$(i0, (1))));
        if (ch == (97)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (99) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (111) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (121)) return (74);
        }
        else if (ch == (105)) {
          if (this._text.charCodeAt($assert_num($add$(i0, (2)))) == (110) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (108) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (108) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (121)) return (100);
        }
      }
      else if (ch == (108)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (105) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (98) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (121)) return (79);
      }
      else if (ch == (116)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (121) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (112) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (100) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (102)) return (86);
      }
      return (70);

    case (8):

      ch = this._text.charCodeAt($assert_num(i0));
      if (ch == (97)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (98) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (115) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (99) && this._text.charCodeAt($assert_num($add$(i0, (7)))) == (116)) return (71);
      }
      else if (ch == (99)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (111) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (110) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (105) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (110) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (117) && this._text.charCodeAt($assert_num($add$(i0, (7)))) == (101)) return (93);
      }
      else if (ch == (111)) {
        if (this._text.charCodeAt($assert_num($add$(i0, (1)))) == (112) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (111) && this._text.charCodeAt($assert_num($add$(i0, (7)))) == (114)) return (82);
      }
      return (70);

    case (9):

      if (this._text.charCodeAt($assert_num(i0)) == (105) && this._text.charCodeAt($assert_num($add$(i0, (1)))) == (110) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (114) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (102) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (97) && this._text.charCodeAt($assert_num($add$(i0, (7)))) == (99) && this._text.charCodeAt($assert_num($add$(i0, (8)))) == (101)) return (78);
      return (70);

    case (10):

      if (this._text.charCodeAt($assert_num(i0)) == (105) && this._text.charCodeAt($assert_num($add$(i0, (1)))) == (109) && this._text.charCodeAt($assert_num($add$(i0, (2)))) == (112) && this._text.charCodeAt($assert_num($add$(i0, (3)))) == (108) && this._text.charCodeAt($assert_num($add$(i0, (4)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (5)))) == (109) && this._text.charCodeAt($assert_num($add$(i0, (6)))) == (101) && this._text.charCodeAt($assert_num($add$(i0, (7)))) == (110) && this._text.charCodeAt($assert_num($add$(i0, (8)))) == (116) && this._text.charCodeAt($assert_num($add$(i0, (9)))) == (115)) return (76);
      return (70);

    default:

      return (70);

  }
}
function TokenKind() {}
TokenKind.kindToString = function(kind) {
  switch (kind) {
    case (1):

      return "end of file";

    case (2):

      return "(";

    case (3):

      return ")";

    case (4):

      return "[";

    case (5):

      return "]";

    case (6):

      return "{";

    case (7):

      return "}";

    case (8):

      return ":";

    case (9):

      return "=>";

    case (10):

      return ";";

    case (11):

      return ",";

    case (12):

      return "#";

    case (13):

      return "#!";

    case (14):

      return ".";

    case (15):

      return "...";

    case (16):

      return "++";

    case (17):

      return "--";

    case (18):

      return "~";

    case (19):

      return "!";

    case (20):

      return "=";

    case (21):

      return "|=";

    case (22):

      return "^=";

    case (23):

      return "&=";

    case (24):

      return "<<=";

    case (25):

      return ">>=";

    case (26):

      return ">>>=";

    case (27):

      return "+=";

    case (28):

      return "-=";

    case (29):

      return "*=";

    case (30):

      return "/=";

    case (31):

      return "~/=";

    case (32):

      return "%=";

    case (33):

      return "?";

    case (34):

      return "||";

    case (35):

      return "&&";

    case (36):

      return "|";

    case (37):

      return "^";

    case (38):

      return "&";

    case (39):

      return "<<";

    case (40):

      return ">>";

    case (41):

      return ">>>";

    case (42):

      return "+";

    case (43):

      return "-";

    case (44):

      return "*";

    case (45):

      return "/";

    case (46):

      return "~/";

    case (47):

      return "%";

    case (48):

      return "==";

    case (49):

      return "!=";

    case (50):

      return "===";

    case (51):

      return "!==";

    case (52):

      return "<";

    case (53):

      return ">";

    case (54):

      return "<=";

    case (55):

      return ">=";

    case (56):

      return "[]";

    case (57):

      return "[]=";

    case (58):

      return "string";

    case (59):

      return "string part";

    case (60):

      return "integer";

    case (61):

      return "hex integer";

    case (62):

      return "double";

    case (63):

      return "whitespace";

    case (64):

      return "comment";

    case (65):

      return "error";

    case (66):

      return "incomplete string";

    case (67):

      return "incomplete comment";

    case (68):

      return "incomplete multiline string dq";

    case (69):

      return "incomplete multiline string sq";

    case (70):

      return "identifier";

    case (71):

      return "pseudo-keyword 'abstract'";

    case (72):

      return "pseudo-keyword 'assert'";

    case (73):

      return "pseudo-keyword 'call'";

    case (74):

      return "pseudo-keyword 'factory'";

    case (75):

      return "pseudo-keyword 'get'";

    case (76):

      return "pseudo-keyword 'implements'";

    case (77):

      return "pseudo-keyword 'import'";

    case (78):

      return "pseudo-keyword 'interface'";

    case (79):

      return "pseudo-keyword 'library'";

    case (80):

      return "pseudo-keyword 'native'";

    case (81):

      return "pseudo-keyword 'negate'";

    case (82):

      return "pseudo-keyword 'operator'";

    case (83):

      return "pseudo-keyword 'set'";

    case (84):

      return "pseudo-keyword 'source'";

    case (85):

      return "pseudo-keyword 'static'";

    case (86):

      return "pseudo-keyword 'typedef'";

    case (87):

      return "keyword 'await'";

    case (88):

      return "keyword 'break'";

    case (89):

      return "keyword 'case'";

    case (90):

      return "keyword 'catch'";

    case (91):

      return "keyword 'class'";

    case (92):

      return "keyword 'const'";

    case (93):

      return "keyword 'continue'";

    case (94):

      return "keyword 'default'";

    case (95):

      return "keyword 'do'";

    case (96):

      return "keyword 'else'";

    case (97):

      return "keyword 'extends'";

    case (98):

      return "keyword 'false'";

    case (99):

      return "keyword 'final'";

    case (100):

      return "keyword 'finally'";

    case (101):

      return "keyword 'for'";

    case (102):

      return "keyword 'if'";

    case (103):

      return "keyword 'in'";

    case (104):

      return "keyword 'is'";

    case (105):

      return "keyword 'new'";

    case (106):

      return "keyword 'null'";

    case (107):

      return "keyword 'return'";

    case (108):

      return "keyword 'super'";

    case (109):

      return "keyword 'switch'";

    case (110):

      return "keyword 'this'";

    case (111):

      return "keyword 'throw'";

    case (112):

      return "keyword 'true'";

    case (113):

      return "keyword 'try'";

    case (114):

      return "keyword 'var'";

    case (115):

      return "keyword 'void'";

    case (116):

      return "keyword 'while'";

    default:

      return $add$($add$("TokenKind(", kind.toString()), ")");

  }
}
$inherits(_SharedBackingMap, HashMapImplementation);
function _SharedBackingMap() {
  this.shared = (0);
  HashMapImplementation.call(this);
}
_SharedBackingMap.prototype.assert$_SharedBackingMap = function(){return this};
_SharedBackingMap._SharedBackingMap$from$factory = function(other) {
  var result = new _SharedBackingMap();
  other.forEach$1((function (k, v) {
    result.$setindex(k, v);
  })
  );
  return (result == null ? null : result.assert$_SharedBackingMap());
}
function CopyOnWriteMap() {}
CopyOnWriteMap.prototype.is$Map = function(){return true};
CopyOnWriteMap.prototype.assert$Map = function(){return this};
CopyOnWriteMap.prototype._ensureWritable = function() {
  var $0;
  if (this._lang_map.shared > (0)) {
    ($0 = this._lang_map).shared = $0.shared - (1);
    this._lang_map = _SharedBackingMap._SharedBackingMap$from$factory(this._lang_map);
  }
}
CopyOnWriteMap.prototype.$setindex = function(key, value) {
  this._ensureWritable();
  this._lang_map.$setindex(key, value);
}
CopyOnWriteMap.prototype.clear$_ = function() {
  this._ensureWritable();
  this._lang_map.clear$_();
}
CopyOnWriteMap.prototype.remove = function(key) {
  this._ensureWritable();
  return this._lang_map.remove(key);
}
CopyOnWriteMap.prototype.$index = function(key) {
  return this._lang_map.$index(key);
}
CopyOnWriteMap.prototype.get$length = function() {
  return this._lang_map.get$length();
}
CopyOnWriteMap.prototype.forEach = function(f) {
  return this._lang_map.forEach(f);
}
CopyOnWriteMap.prototype.getKeys = function() {
  return this._lang_map.getKeys();
}
CopyOnWriteMap.prototype.containsKey = function(key) {
  return this._lang_map.containsKey(key);
}
CopyOnWriteMap.prototype.clear$0 = CopyOnWriteMap.prototype.clear$_;
CopyOnWriteMap.prototype.containsKey$1 = CopyOnWriteMap.prototype.containsKey;
CopyOnWriteMap.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
CopyOnWriteMap.prototype.remove$1 = CopyOnWriteMap.prototype.remove;
var world;
var experimentalAwaitPhase;
var legCompile;
var options;
function escapeHtml(html) {
  return html.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
var _implicitLinkResolver;
function Classification() {}
function classifySource(src) {
  var html = new StringBufferImpl("");
  var tokenizer = new Tokenizer(src, false, (0));
  var token;
  var inString = false;
  while ($ne$((token = tokenizer.next()).get$kind(), (1))) {
    switch (token.get$kind()) {
      case (58):
      case (59):
      case (66):
      case (68):
      case (69):

        inString = true;
        break;

    }
    var kind = classify((token == null ? null : token.assert$Token()));
    var text = escapeHtml(token.get$text());
    if ($ne$(kind)) {
      var stringClass = $notnull_bool(inString) ? "si" : "";
      html.add$1(("<span class=\"" + kind + " " + stringClass + "\">" + text + "</span>"));
    }
    else {
      html.add$1(("<span>" + text + "</span>"));
    }
    if ($eq$(token.get$kind(), (58))) {
      inString = false;
    }
  }
  return $assert_String(html.toString());
}
function _looksLikeType(name) {
  return _looksLikePublicType(name) || _looksLikePrivateType(name);
}
function _looksLikePublicType(name) {
  return name.length >= (2) && isUpper(name[(0)]) && isLower(name[(1)]);
}
function _looksLikePrivateType(name) {
  return (name.length >= (3) && name[(0)] == "_" && isUpper(name[(1)]) && isLower(name[(2)]));
}
function isUpper(s) {
  return s.toLowerCase() != s;
}
function isLower(s) {
  return s.toUpperCase() != s;
}
function classify(token) {
  switch (token.kind) {
    case (65):

      return "e";

    case (70):

      if (_looksLikeType(token.get$text()) || token.get$text() == "num" || token.get$text() == "bool" || token.get$text() == "int" || token.get$text() == "double") {
        return "t";
      }
      return "i";

    case (115):

      return "t";

    case (110):
    case (108):

      return "r";

    case (58):
    case (59):
    case (66):
    case (68):
    case (69):

      return "s";

    case (60):
    case (61):
    case (62):

      return "n";

    case (64):
    case (67):

      return "c";

    case (9):

      return "a";

    case (13):
    case (2):
    case (3):
    case (4):
    case (5):
    case (6):
    case (7):
    case (8):
    case (10):
    case (11):
    case (14):
    case (15):

      return "p";

    case (16):
    case (17):
    case (18):
    case (19):
    case (20):
    case (21):
    case (22):
    case (23):
    case (24):
    case (25):
    case (26):
    case (27):
    case (28):
    case (29):
    case (30):
    case (31):
    case (32):
    case (33):
    case (34):
    case (35):
    case (36):
    case (37):
    case (38):
    case (39):
    case (40):
    case (41):
    case (42):
    case (43):
    case (44):
    case (45):
    case (46):
    case (47):
    case (48):
    case (49):
    case (50):
    case (51):
    case (52):
    case (53):
    case (54):
    case (55):
    case (56):
    case (57):

      return "o";

    case (12):
    case (71):
    case (72):
    case (91):
    case (97):
    case (74):
    case (75):
    case (76):
    case (77):
    case (78):
    case (79):
    case (80):
    case (81):
    case (82):
    case (83):
    case (84):
    case (85):
    case (86):
    case (88):
    case (89):
    case (90):
    case (92):
    case (93):
    case (94):
    case (95):
    case (96):
    case (98):
    case (100):
    case (101):
    case (102):
    case (103):
    case (104):
    case (105):
    case (106):
    case (107):
    case (109):
    case (111):
    case (112):
    case (113):
    case (116):
    case (114):
    case (99):

      return "k";

    case (63):
    case (1):

      return null;

    default:

      return null;

  }
}
function main() {
  var body = get$$document().query("body");
  $globals.currentLibrary = $assert_String(body.get$dataAttributes().$index("library"));
  $globals.currentType = $assert_String(body.get$dataAttributes().$index("type"));
  $globals.prefix = ($globals.currentType != null) ? "../" : "";
  enableCodeBlocks();
  _XMLHttpRequestFactoryProvider.XMLHttpRequest$get$factory(("" + $globals.prefix + "nav.json"), $wrap_call$1((function (request) {
    buildNavigation(json_JSON.parse(request.get$responseText()));
  })
  ));
}
function sanitize(name) {
  return name.replaceAll(":", "_").replaceAll("/", "_");
}
function buildNavigation(libraries) {
  var libraryNames = libraries.getKeys();
  libraryNames.sort$1((function (a, b) {
    return a.compareTo$1(b);
  })
  );
  var html = new StringBufferImpl("");
  for (var $$i = libraryNames.iterator(); $$i.hasNext(); ) {
    var libraryName = $$i.next();
    html.add$1("<h2><div class=\"icon-library\"></div>");
    if ($globals.currentLibrary == libraryName && $globals.currentType == null) {
      html.add$1(("<strong>" + escapeHtml($assert_String(libraryName)) + "</strong>"));
    }
    else {
      var url = ("" + $globals.prefix + sanitize($assert_String(libraryName)) + ".html");
      html.add$1(("<a href=\"" + url + "\">" + escapeHtml($assert_String(libraryName)) + "</a>"));
    }
    html.add$1("</h2>");
    if ($globals.currentLibrary == libraryName) {
      buildLibraryNavigation((html == null ? null : html.assert$StringBuffer()), libraries.$index(libraryName));
    }
  }
  var navElement = get$$document().query(".nav");
  navElement.set$innerHTML(html.toString());
}
function buildLibraryNavigation(html, library) {
  var types = [];
  var exceptions = [];
  for (var $$i = library.iterator(); $$i.hasNext(); ) {
    var type = $$i.next();
    if (type.$index("name").endsWith("Exception")) {
      exceptions.add$1(type);
    }
    else {
      types.add$1(type);
    }
  }
  if (types.get$length() == (0) && exceptions.get$length() == (0)) return;
  function writeType(icon, type) {
    html.add("<li>");
    if ($globals.currentType == type.$index("name")) {
      html.add(("<div class=\"icon-" + icon + "\"></div><strong>" + type.$index("name") + "</strong>"));
    }
    else {
      html.add(("          <a href=\"" + $globals.prefix + type.$index("url") + "\">\n            <div class=\"icon-" + icon + "\"></div>" + type.$index("name") + "\n          </a>\n          "));
    }
    html.add("</li>");
  }
  html.add("<ul class=\"icon\">");
  types.forEach$1((function (type) {
    return writeType($assert_String(type.$index("kind")), type);
  })
  );
  exceptions.forEach$1((function (type) {
    return writeType("exception", type);
  })
  );
  html.add("</ul>");
}
function enableCodeBlocks() {
  var $$list = get$$document().queryAll(".method, .field");
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var elem = $$i.next();
    var showCode = elem.query$1(".show-code");
    if ($eq$(showCode)) continue;
    var pre = elem.query$1("pre.source");
    showCode.get$on().get$click().add$1((function (pre, e) {
      if ($notnull_bool(pre.get$classes().contains$1("expanded"))) {
        pre.get$classes().remove$1("expanded");
      }
      else {
        if (!$notnull_bool(pre.get$classes().contains$1("formatted"))) {
          pre.set$innerHTML(classifySource(new SourceFile("", pre.get$text())));
          pre.get$classes().add$1("formatted");
        }
        ;
        pre.get$classes().add$1("expanded");
      }
    }).bind(null, pre)
    );
  }
}
(function(){
  var v0/*HTMLMediaElement*/ = 'HTMLMediaElement|HTMLAudioElement|HTMLVideoElement';
  var v1/*SVGElement*/ = 'SVGElement|SVGAElement|SVGAltGlyphDefElement|SVGAltGlyphItemElement|SVGAnimationElement|SVGAnimateColorElement|SVGAnimateElement|SVGAnimateMotionElement|SVGAnimateTransformElement|SVGSetElement|SVGCircleElement|SVGClipPathElement|SVGComponentTransferFunctionElement|SVGFEFuncAElement|SVGFEFuncBElement|SVGFEFuncGElement|SVGFEFuncRElement|SVGCursorElement|SVGDefsElement|SVGDescElement|SVGEllipseElement|SVGFEBlendElement|SVGFEColorMatrixElement|SVGFEComponentTransferElement|SVGFECompositeElement|SVGFEConvolveMatrixElement|SVGFEDiffuseLightingElement|SVGFEDisplacementMapElement|SVGFEDistantLightElement|SVGFEDropShadowElement|SVGFEFloodElement|SVGFEGaussianBlurElement|SVGFEImageElement|SVGFEMergeElement|SVGFEMergeNodeElement|SVGFEMorphologyElement|SVGFEOffsetElement|SVGFEPointLightElement|SVGFESpecularLightingElement|SVGFESpotLightElement|SVGFETileElement|SVGFETurbulenceElement|SVGFilterElement|SVGFontElement|SVGFontFaceElement|SVGFontFaceFormatElement|SVGFontFaceNameElement|SVGFontFaceSrcElement|SVGFontFaceUriElement|SVGForeignObjectElement|SVGGElement|SVGGlyphElement|SVGGlyphRefElement|SVGGradientElement|SVGLinearGradientElement|SVGRadialGradientElement|SVGHKernElement|SVGImageElement|SVGLineElement|SVGMPathElement|SVGMarkerElement|SVGMaskElement|SVGMetadataElement|SVGMissingGlyphElement|SVGPathElement|SVGPatternElement|SVGPolygonElement|SVGPolylineElement|SVGRectElement|SVGSVGElement|SVGScriptElement|SVGStopElement|SVGStyleElement|SVGSwitchElement|SVGSymbolElement|SVGTextContentElement|SVGTextPathElement|SVGTextPositioningElement|SVGAltGlyphElement|SVGTRefElement|SVGTSpanElement|SVGTextElement|SVGTitleElement|SVGUseElement|SVGVKernElement|SVGViewElement';
  var v2/*CharacterData*/ = 'CharacterData|Comment|Text|CDATASection';
  var v3/*HTMLDocument*/ = 'HTMLDocument|SVGDocument';
  var v4/*DocumentFragment*/ = 'DocumentFragment|ShadowRoot';
  var v5/*Element*/ = [v0/*HTMLMediaElement*/,v1/*SVGElement*/,'Element|HTMLElement|HTMLAnchorElement|HTMLAppletElement|HTMLAreaElement|HTMLBRElement|HTMLBaseElement|HTMLBaseFontElement|HTMLBodyElement|HTMLButtonElement|HTMLCanvasElement|HTMLContentElement|HTMLDListElement|HTMLDetailsElement|HTMLDirectoryElement|HTMLDivElement|HTMLEmbedElement|HTMLFieldSetElement|HTMLFontElement|HTMLFormElement|HTMLFrameElement|HTMLFrameSetElement|HTMLHRElement|HTMLHeadElement|HTMLHeadingElement|HTMLHtmlElement|HTMLIFrameElement|HTMLImageElement|HTMLInputElement|HTMLKeygenElement|HTMLLIElement|HTMLLabelElement|HTMLLegendElement|HTMLLinkElement|HTMLMapElement|HTMLMarqueeElement|HTMLMenuElement|HTMLMetaElement|HTMLMeterElement|HTMLModElement|HTMLOListElement|HTMLObjectElement|HTMLOptGroupElement|HTMLOptionElement|HTMLOutputElement|HTMLParagraphElement|HTMLParamElement|HTMLPreElement|HTMLProgressElement|HTMLQuoteElement|HTMLScriptElement|HTMLSelectElement|HTMLShadowElement|HTMLSourceElement|HTMLSpanElement|HTMLStyleElement|HTMLTableCaptionElement|HTMLTableCellElement|HTMLTableColElement|HTMLTableElement|HTMLTableRowElement|HTMLTableSectionElement|HTMLTextAreaElement|HTMLTitleElement|HTMLTrackElement|HTMLUListElement|HTMLUnknownElement'].join('|');
  var v6/*AbstractWorker*/ = 'AbstractWorker|SharedWorker|Worker';
  var v7/*IDBRequest*/ = 'IDBRequest|IDBVersionChangeRequest';
  var v8/*MediaStream*/ = 'MediaStream|LocalMediaStream';
  var v9/*Node*/ = [v2/*CharacterData*/,v3/*HTMLDocument*/,v4/*DocumentFragment*/,v5/*Element*/,'Node|Attr|DocumentType|Entity|EntityReference|Notation|ProcessingInstruction'].join('|');
  var v10/*WorkerContext*/ = 'WorkerContext|DedicatedWorkerContext|SharedWorkerContext';
  var table = [
    ['AbstractWorker', v6/*AbstractWorker*/]
    , ['AudioParam', 'AudioParam|AudioGain']
    , ['CSSValueList', 'CSSValueList|WebKitCSSTransformValue|WebKitCSSFilterValue']
    , ['CharacterData', v2/*CharacterData*/]
    , ['DOMTokenList', 'DOMTokenList|DOMSettableTokenList']
    , ['HTMLDocument', v3/*HTMLDocument*/]
    , ['DocumentFragment', v4/*DocumentFragment*/]
    , ['HTMLMediaElement', v0/*HTMLMediaElement*/]
    , ['SVGElement', v1/*SVGElement*/]
    , ['Element', v5/*Element*/]
    , ['Entry', 'Entry|DirectoryEntry|FileEntry']
    , ['EntrySync', 'EntrySync|DirectoryEntrySync|FileEntrySync']
    , ['IDBRequest', v7/*IDBRequest*/]
    , ['MediaStream', v8/*MediaStream*/]
    , ['Node', v9/*Node*/]
    , ['WorkerContext', v10/*WorkerContext*/]
    , ['EventTarget', [v6/*AbstractWorker*/,v7/*IDBRequest*/,v8/*MediaStream*/,v9/*Node*/,v10/*WorkerContext*/,'EventTarget|AudioContext|BatteryManager|DOMApplicationCache|DeprecatedPeerConnection|EventSource|FileReader|FileWriter|IDBDatabase|IDBTransaction|MediaController|MessagePort|Notification|PeerConnection00|SpeechRecognition|TextTrack|TextTrackCue|TextTrackList|WebSocket|DOMWindow|XMLHttpRequest|XMLHttpRequestUpload'].join('|')]
    , ['HTMLCollection', 'HTMLCollection|HTMLOptionsCollection']
    , ['NodeList', 'NodeList|RadioNodeList']
    , ['StyleSheet', 'StyleSheet|CSSStyleSheet']
    , ['Uint8Array', 'Uint8Array|Uint8ClampedArray']
  ];
  $dynamicSetMetadata(table);
})();
function $static_init(){
  $globals.currentLibrary = null;
  $globals.currentType = null;
  $globals.prefix = "";
}
var const$0000 = Object.create(_DeletedKeySentinel.prototype, {});
var const$0001 = Object.create(NoMoreElementsException.prototype, {});
var const$0002 = Object.create(EmptyQueueException.prototype, {});
var const$0003 = Object.create(UnsupportedOperationException.prototype, {_message: {"value": "", writeable: false}});
var const$0004 = new JSSyntaxRegExp("^#[_a-zA-Z]\\w*$");
var const$0005 = Object.create(IllegalAccessException.prototype, {});
var const$0006 = _constMap([]);
var const$0010 = new JSSyntaxRegExp("^\\[name=[\"'][^'\"]+['\"]\\]$");
var const$0011 = new JSSyntaxRegExp("^[*a-zA-Z0-9]+$");
var const$0012 = Object.create(UnsupportedOperationException.prototype, {_message: {"value": "TODO(jacobr): should we impl?", writeable: false}});
var $globals = {};
$static_init();
if (typeof window != 'undefined' && typeof document != 'undefined' &&
    window.addEventListener && document.readyState == 'loading') {
  window.addEventListener('DOMContentLoaded', function(e) {
    main();
  });
} else {
  main();
}
