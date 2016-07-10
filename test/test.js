
var tb = null;

/***************************************************************************************/
/***************************************************************************************/
function TestBed()
{
  this.Errors   = [];
  this.Results  = {};
  this.Tests    = [];

  tb = this;

  /***************************************************************************************/
  this.CreateViewModel = function(num)
  {
    var vm = new Cheetah.ViewModel();
    return(vm);
  }

  /***************************************************************************************/
  function TestContext(vm, num, fnDone)
  {
    this.Number = num;
    this.ViewModel = vm;
    var _callback = fnDone;

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
    this.Assert = function(result)
    {  
      if(tb.Results[this.Number] == undefined)
        tb.Results[this.Number] = [];

      tb.Results[this.Number].push(result);
    }

    /***************************************************************************************/
    this.AssertContent = function(id, val)
    {
      var html = $.trim($(id).html());

      this.Assert(html == val);
    }

    /***************************************************************************************/
    this.Finish = function()
    {
      ch.Do(_callback);
    }
  }

  /***************************************************************************************/
  this.Test = function(num, model, fn)
  {
    var self = this;

    this.Tests.push( function(fn2)
    {
      var vm = self.CreateViewModel(num);

      if(model != null)
      {
        vm.ProcessModel(model, function()
        {
          fn(new TestContext(vm, num));
          ch.Do(fn2);
        });
      }
      else
        fn(new TestContext(vm, num, fn2));
    });
  }

  this.CurrentTest = 0;

  /***************************************************************************************/
  this.RunCurrentTest = function(fn)
  {  
    if(this.CurrentTest >= this.Tests.length)
    {
      this.WriteResults();
      fn();
    }
    else
    {
      var test = this.Tests[this.CurrentTest];
      var self = this;

      ++this.CurrentTest;

      test(function()
      {
        self.RunCurrentTest(fn);
      });
    }
  }

  /***************************************************************************************/
  this.Run = function()
  {
    var index = 0;
    var self  = this;
    var start = new Date();

    while(++index < 1000)
    {
      if(this["Test" + index] != undefined)
        this["Test" + index]();
     else
       break;
    }

    this.CurrentTest = 0;
    this.RunCurrentTest( function()
    {
      var end = new Date();

      $("#timing").html(String(end.getTime() - start.getTime()) + "ms");
    });
  }

  /***************************************************************************************/
  this.WriteResults = function()
  {
    $("#count").removeClass("failed");

    var sb        = new Cheetah.StringBuilder();
    var index     = 1;
    var numFailed = 0;

    while(index < 1000)
    {
      var testResult = this.Results[index];

      if(testResult != undefined)
      {      
        sb.Append("<div class='test'>Test " + index + "</div>");

        var subtest = 1;

        testResult.ForEach( function(success)
        {
          if(success)
            sb.Append("<div class='success'>" + index + "." + subtest + " succeeded</div>");
          else
          {
            sb.Append("<div class='fail'>" + index + "." + subtest + " failed</div>");
            ++numFailed;
          }

          ++subtest;
        });
      }

      index++;
    }

    $("#testresults_inner").html(sb.ToString("\r\n"));

    if(numFailed == 0)
      $("#count").html("All Tests Succeeded");
    else
    {
      $("#count").html(String(numFailed) + " Tests Failed");
      $("#count").addClass("failed");
    }
  }
}

/***************************************************************************************/
function _Assert(tb, test, name)
{
  var html = "";

  if(test)
    html = "<div class='success'>" + name + " succeeded</div>";
  else
  {
    html = "<div class='fail'>" + name + " failed</div>";
    ++tb.NumFailed;
  }
    
  $("#testresults_inner").html($("#testresults_inner").html() + html);
}
