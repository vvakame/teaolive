library teaolive_usage;

import 'package:teaolive/teaolive_standalone.dart';

import 'tests/sample_test.dart' as sample;
import 'tests/hoge_test.dart' as hoge;
import 'tests/foobar_test.dart' as foobar;
import 'tests/server_side_async.dart' as async;

void main() {

  addTest(sample.testCase);
  addTest(hoge.testCase);
  addTest(foobar.testCase);
  addTest(async.testCase);

  teaoliveRun();
}
