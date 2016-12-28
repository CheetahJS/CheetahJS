/*****************************************************************************/
/*                                                                           */
/*    CheetahJS - "Because it's fast!"                                       */
/*                                                                           */
/*       An MVVM Javascript Library for fast web development                 */
/*                                                                           */
/*   Copyright (c) 2015-2016 - Jim Lightfoot                                 */
/*                                                                           */
/*      This software is available under the MIT license (MIT)               */
/*                                                                           */
/*           https://github.com/CheetahJS/CheetahJS/blob/master/LICENSE      */
/*                                                                           */
/*****************************************************************************/

! function(Cheetah, document) {

"use strict";

var _cheetah = _cheetah || {};

/***************************************************************************************/
function TestContext(testVM, test, num, fnDone)
{
  var _testVM    = testVM;
  var _test      = test;
  var _callback  = fnDone;
  var _number    = num;

  this.ViewModel = test.vm;
  this.Model     = test.Model;

  _test.Completed = false;

  /***************************************************************************************/
  this.GetValue = function(id) 
  {
    try
    {
      return(ch.GetValue(document.getElementById(id)));
    }
    catch(e)
    {
      return(null);
    }
  }

  /***************************************************************************************/
  this.SetValue = function(id, value) 
  {
    $(id).val(value);
    $(id).trigger("change");
  }

  /***************************************************************************************/
  this._Assert = function(passes, expected, got, type)
  {  
    _test.Completed = true;

    if(!passes)
      _test.Failed = true;

    _test.CompletedAssertions.Add
    (
      {
        Succeeded:   passes,
        AssertIndex: _test.CompletedAssertions.length + 1,
        Type:        type,
        Expected:    expected,
        Got:         got
      }
    );
  }

  /***************************************************************************************/
  this.AssertTrue = function(val)
  {
    this._Assert(val, " true", val, "True");
  }

  /***************************************************************************************/
  this.AssertFalse = function(val)
  {
    this._Assert(!val, " false", val, "False");
  }

  /***************************************************************************************/
  this.AssertEqual = function(val1, val2)
  {
    this._Assert(val1 == val2, val1, val2, "Equal");
  }

  /***************************************************************************************/
  this.AssertNotEqual = function(val1, val2)
  {
    this._Assert(val1 != val2, val1, val2, "Equal");
  }

  /***************************************************************************************/
  this.AssertLength = function(id, len)
  {
    var actualLen = Query(id).length;

    this._Assert(len == actualLen, len, actualLen, "Length");
  }

  /***************************************************************************************/
  this.AssertContent = function(id, val)
  {
    var html = $.trim(Query(id).html());

    this._Assert(html == val, val, html, "Content");
  }

  /***************************************************************************************/
  this.AssertClass = function(id, className)
  {
    var hasClass = Query(id).hasClass(className);

    this._Assert(hasClass, className, "", "Class");
  }

  /***************************************************************************************/
  this.AssertValid = function(val)
  {
    this._Assert(val != undefined && val != null, " valid value", val, "Valid");
  }

  /***************************************************************************************/
  this.AssertNotClass = function(id, className)
  {
    var hasClass = Query(id).hasClass(className)

    this._Assert(!hasClass, className, "", "Class");
  }

  /***************************************************************************************/
  this.AssertCss = function(id, name, expectedVal)
  {
    var val = Query(id).css(name);

    this._Assert(val == expectedVal, expectedVal, val, "Css");
  }

  /***************************************************************************************/
  this.AssertNotCss = function(id, name, expectedVal)
  {
    var val = Query(id).css(name);

    this._Assert(val != expectedVal, expectedVal, val, "Css");
  }

  /***************************************************************************************/
  this.AssertAttribute = function(id, name, expectedVal)
  {
    var val = Query(id).attr(name);

    this._Assert(val == expectedVal, expectedVal, val, "Css");
  }

  /***************************************************************************************/
  this.AssertNotAttribute = function(id, name, expectedVal)
  {
    var val = Query(id).attr(name);

    this._Assert(val != expectedVal, expectedVal, val, "Css");
  }

  /***************************************************************************************/
  this.AssertData = function(id, name, expectedVal)
  {
    var val = Query(id).data(name);

    this._Assert(val == expectedVal, expectedVal, val, "Data");
  }

  /***************************************************************************************/
  this.AssertNotData = function(id, name, expectedVal)
  {
    var val = Query(id).data(name);

    this._Assert(val != expectedVal, expectedVal, val, "Data");
  }

  /***************************************************************************************/
  function Query(id)
  {
    var queryStr = "#test_" + String(_number) + " " + id;

    return $(queryStr);
  }

  /***************************************************************************************/
  this.AssertValue = function(id, val)
  {
    var elem  = Query(id)[0];

    if(!elem)
    {
      this._Assert(false, val, "undefined", "Value");
      return;
    }

    var value = null;

    if(elem.localName == "select")
      value = elem.selectedIndex >= 0 ? elem.options[elem.selectedIndex].value : "";
    else if(elem.localName == "input" && (elem.type == "checkbox" || elem.type == "radio"))
      value = elem.checked;
    else
      value = elem.value;

    value  = ch.Convert(value);

    this._Assert(value == val, val, value, "Value");
  }

  /*****************************************************************************/
  this.Finish = function()
  {
    if(_test.Failed)
      _testVM.Model.NumFailed++;
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.TestResultsViewModel = function(div)
{
  Cheetah.ViewModel.call(this, div ? div : "CheetahTestResults");

  this.NotCompleted = [];
  this.AssertionsRun = false;

  /***************************************************************************/
  this.RunAssertions = function()
  { 
    if(!this.AssertionsRun)
    {
      this.Model.NumFailed = 0;
      this.AssertionsRun = true;
      this.NotCompleted  = [];

      var testNum      = 0;
      var self         = this;
      var numTests     = this.Model.Tests.length;

      this.Model.Tests.ForEach( function(test)
      {
        var index = 0;

        if(!test.Name)
          test.Name = "Name " + index;

        if(!test.IsRenderless)
        {
          if(!test.Template)
            return;

          ++testNum;
          test.Name = testNum + ". " + test.Name;

        }

        test.Failed = false;
        test.CompletedAssertions = [];

        if(test.Assertions)
        {
          var tc = new TestContext(self, test, testNum);

          test.Assertions(tc);

          if(test.IsRenderless)
          {
           test.SubTests = tc.SubTests;
           test.Completed = true;
           test.Failed = tc.Failed;
          }
        }

        if(!test.Completed)
          self.NotCompleted.push(test);
        else if(test.Failed)
          self.Model.NumFailed++;
      });
    }
  }

  /***************************************************************************/
  this.BaseProcessModel = this.ProcessModel;

  /***************************************************************************/
  this.ProcessModel = function(model, fnDone)
  {  
    this.Model = model;

    this.RunAssertions(model);

    // Have we completed all the tests?
    if(this.NotCompleted.length > 0)
    {
      var self         = this;
      var notCompleted = ch.ShallowClone(this.NotCompleted); // close list for iterating

      // Reset not completed list
      this.NotCompleted = [];

      // Run this async
      setTimeout( function()
      {
        // Check list again to see if they still haven't finished
        notCompleted.ForEach( function(test)
        {
          if(!test.Completed)
            self.NotCompleted.push(test);
        });

        // Start over
        self.ProcessModel(model, fnDone);
      }, 
      10);
    }
    // Everything was completed so process the test results
    else
      this.BaseProcessModel(model, fnDone);
}

  /***************************************************************************/
  this.PostProcessModel = function()
  {
    var end = new Date();

    this.Model.ElapsedTime = String(end.getTime() - this.Model.StartTime.getTime()) + "ms";

    this.UpdateView();
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.TestViewModel = function(div)
{
  Cheetah.ViewModel.call(this, div ? div : "CheetahTests");

  this.BaseProcessModel = this.ProcessModel;

  /*****************************************************************************/
  this.ProcessModel = function(model, fn)
  {
    model.StartTime = new Date();

    this.BaseProcessModel(model, fn);
  }

  /*****************************************************************************/
  this.PostProcessModel = function(model)
  {
    var tests = new Cheetah.TaskList(100);
    var index = 0;

    model.Tests.ForEach( function(test)
    {
      if(!test.IsRenderless)
        tests.Add(new _cheetah.Test(test, ++index));
    });

    tests.Run( function()
    {
      var results = new _cheetah.TestResultsViewModel();

      results.ProcessModel(model);
    });
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.Test = function(data, index)
{
  Cheetah.Task.call(this);

  var _testData = data;
  var _index    = index;

  /***************************************************************************************/
  this.Start = function()
  {
    $("#test_" + _index).html("<ch-call-template name='" + _testData.Template + "'>.</ch-call-template>");

    var vmName = _testData.ViewModel;

    if(!vmName)
      vmName = "Cheetah.ViewModel";

    var code   = "return new " + vmName + "('test_" + _index + "')";
    var fnVM   = new Function(code);
    var vm     = fnVM();
    var self   = this;
    var fnNext = function() 
                  { 
                    self.Complete = true; 
                    self.OnComplete(); 
                  };

    _testData.vm = vm;

    Cheetah.StartDelimiter = _testData.StartDelimiter ? _testData.StartDelimiter : "//";
    Cheetah.EndDelimiter   = _testData.EndDelimiter ? _testData.EndDelimiter : "//";

    if(_testData.ModelPath)
    {
      _testData.vm.ModelPath = _testData.ModelPath;
      _testData.vm.ModelVerb = _testData.ModelVerb;

      vm.LoadModel(null, fnNext);
    }
    else
      vm.ProcessModel(_testData.Model, fnNext);
  }
}

/*****************************************************************************/
/*****************************************************************************/
Cheetah.TestViewModel = function(div)
{
  Cheetah.ViewModel.call(this, div ? div : "CheetahTestContainer");

  /*****************************************************************************/
  this.PreProcessModel = function()
  {
    var self = this;
    var tests = this.Model;

    this.Model = {Tests: tests};

    tests.ForEach( function(test)
    {
      if(test.TestFile)
        self.LoadTest(test);
    });
  }

  /*****************************************************************************/
  this.LoadTest = function(test)
  {
    var fn =  new function()
              {
                this.IsMet = false;
              
                this.Start = function()
                {
                  var svc = new Cheetah.Service();
                  var self = this;

                  svc.Get(svc.NormalizeUrl(test.TestFile), 
                          function(data)
                          {
                            test.Name       = data.Name;
                            test.Template   = data.Template;
                            test.Model      = data.Model;
                            test.ModelPath  = data.ModelPath;
                            test.ModelVerb  = data.ModelVerb;
                            test.ViewModel  = data.ViewModel;
                            test.Assertions = data.Assertions;
                            self.IsMet      = true;
                          }, 
                          function(err)
                          {
                            Cheetah.Logger.Error(err);
                            self.IsMet = true;
                          }
                        );
                }
              };


    Cheetah.RegisterPrerequisite(fn);
    fn.Start();
  }

  /*****************************************************************************/
  this.PostProcessModel = function(model)
  {
    $("#CheetahTests").html("<ch-call-template name='CheetahTests'>.</ch-call-template>");
    $("#CheetahTestResults").html("<ch-call-template name='CheetahTestResults'>.</ch-call-template>");

    var vm = new _cheetah.TestViewModel();

    vm.ProcessModel(model);
  }
}

}(Cheetah, document);
