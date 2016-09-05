
/***************************************************************************************/
/***************************************************************************************/
function TestViewModel(div)
{
  JQueryUI.ViewModel.call(this, div);

  /*****************************************************************************/
  this.Confirm = function(msg, fn, fnLoad)
  {
    fn();
  }

  /*****************************************************************************/
  this.Submit = function(evt)
  {
    $("#ValidateSuccess").html("You've been submitted!");
  }

  this.OnChooseItem = function()
  {
  }

  this.Cars = new function()
  {
    this.BestModel = "Aston Martin";

    this.GetBestModel = function()
    {
      return "Audi";
    }
  }

  //***************************************************************************************
  this.MakeSomebodyElse = function()
  {    
    this.Model.CurrentPerson = {
                    GivenName:     "Edmund",      
                    Surname:      "De Vere",          
                    Title:        "Sir",          
                    Suffix:       "IV",          
                    SurnameFirst: false };
  }

  /*****************************************************************************/
  this.ChangePerson = function()
  {
    this.Model.Name = "Kyle";
    this.Model.Age = 28;
    this.Model.City = "Seattle";
  }

  /*****************************************************************************/
  this.TransformValue = function(val)
  {
    return (val + " transformed!");
  }

  /*****************************************************************************/
  this.OnChooseModel = function(evt)
  {
    alert(evt.$model.Caption);
  }

  /*****************************************************************************/
  this.AddNewCar = function(val)
  {
    this.Model.Models.push({
      Name: "Nova",
      Color: "Green",
      Year: 1967
    });
  }

  /*****************************************************************************/
  this.AddAndRemoveCar = function(val)
  {
    this.Model.Models.splice(1, 1)
    this.Model.Models.splice(2, 0, {
      Name: "Barracuda",
      Color: "Black",
      Year: 1968
    });
  }

  /*****************************************************************************/
  this.MakeAudi = function()
  {
    this.Model.Make = "Audi";
    this.Model.Name = "Q5";
    this.Model.Color = "Blue";
    this.Model.Owner = "Jim";
    this.Model.Year = 2010;
  }

  /*****************************************************************************/
  this.MakeLandRover = function()
  {
    this.Model.Make = "Land Rover";
    this.Model.Name = "Empire";
    this.Model.Color = "Green";
    this.Model.Owner = "Frank";
    this.Model.Year = 2017;
  }

  /*****************************************************************************/
  this.ChangeModels = function()
  {
   this.Model.Models = [
                          {
                            Name: "Equinox",
                            Color: "Blue",
                            Year: 2017
                          },
                          {
                            Name: "Traverse",
                            Color: "Green",
                            Year: 2016
                          },
                          {
                            Name: "Tahoe",
                            Color: "White",
                            Year: 2005
                          },
                          {
                            Name: "Suburban",
                            Color: "Black",
                            Year: 1992
                          }
                        ];
  }

  this.ChangeModel = function()
  {
    this.Model.Info = { Name: "Corvette",
                        Color: "Black",
                        Year: 1965 };
  }

  {
    Cheetah.RegisterActionStep(new ChangeVehicle());
  }
}

/***************************************************************************************/
function ChangeVehicle()
{
  this.Name = "ChangeVehicle";
  this.AllowChildren = false;

  this.ProcessAttributes = function(attrList)
  {
    var params = {
                  Make  : ch.FindValue(attrList, "make"),
                  Model : ch.FindValue(attrList, "model"),
                  Year  : ch.FindValue(attrList, "year") };

    return(params);
  }

  this.Run = function(evt, target, vm, params)
  {
    vm.Model.Make  = params.Make;
    vm.Model.Model = params.Model;
    vm.Model.Year  = params.Year;

    return true;
  }
}


/***************************************************************************************/
/***************************************************************************************/
var CheetahTests = new function()
{
  TestBed.call(this);

  /***************************************************************************************/
  this.CreateViewModel = function(num)
  {
    return (new TestViewModel("test" + num));
  }
  
  //***************************************************************************************
  this.Test1 = function()
  {
    var model = {
      Colors:
      [
        { Color: "red" },
        { Color: "green" },
        { Color: "blue" },
      ]
    };

    this.Test(1, model, function(test)
    {
      var $input = $("#test1 > input");

      test.Assert($input.length == 3);
      test.Assert($("#test1 > input:first-of-type").val() == "red");
      test.Assert($("#test1 > input:nth-of-type(2)").val() == "green");
      test.Assert($("#test1 > input:nth-of-type(3)").val() == "blue");
    });
  }
  
  //***************************************************************************************
  this.Test2 = function()
  {
    var model = {
      Name: "Fred"
    };

    this.Test(2, model, function(test)
    {
      test.Assert($("#test2 > input").val() == "Fred");
    });
  }

  //***************************************************************************************
  this.Test3 = function()
  {
    
    var model = {
      Name: "George"
    };

    this.Test(3, model, function(test)
    {
      test.Assert($("#test3 > input").val() == "John");
    });
  }

  //***************************************************************************************
  this.Test4 = function()
  {
    
    this.Test(4, { Name: "George" }, function(test)
    {
      test.Assert($("#test4 > input").val() == "Fred or George");
    });
  }

  //***************************************************************************************
  this.Test5 = function()
  {
    
    this.Test(5, { Name: "Bob" }, function(test)
    {
      test.Assert($("#test5 > input").val() == "John");
    });
  }

  //***************************************************************************************
  this.Test6 = function()
  {
    
    this.Test(6, {
      Fred:
      {
        Name: "Fred"
      },
      John:
      {
        Name: "John"
      }
    }, function(test)
    {
      test.Assert($("#test6 > input:first-of-type").val() == "Fred");
      test.Assert($("#test6 > input:nth-of-type(2)").val() == "John");
    });
  }

  //***************************************************************************************
  this.Test7 = function()
  {
    
    this.Test(7, {
      Fred:
      {
        Name: "Fred"
      },
      John:
      {
        Name: "John"
      }
    }, function(test)
    {
      $("#btnMakeGreen7").click();

      test.Assert($("#test7").hasClass("green"));
      test.Assert($("#test7 > div").css("height") == "42px");
      test.Assert($("#test7 > button").data("fred") == "bob");
      test.Assert($("#test7 > div").css("display") == "none");
    });
  }

  //***************************************************************************************
  this.Test8 = function()
  {
    
    var model = {
      Name: "Fred",
      Age: 37,
      City: "San Diego"
    };

    this.Test(8, model, function(test)
    {
      test.AssertContent("#Test8Text2", "This guy Fred is 37 years old and lives in San Diego.");

      //$("#btnDo8").click();

     // test.Assert(model.Name == "John");
    //  test.Assert($("#Test8Text").html() == "John");
    //  test.Assert($("#Test8Text2").html() == "This guy John is 37 years old and lives in San Diego.");

    //  $("#btnDo82").click();

     // test.Assert(model.Name == "Kyle" && model.Age == 28 && model.City == "Seattle");
     // test.Assert($("#Test8Text2").html() == "This guy Kyle is 28 years old and lives in Seattle.");

    });
  }

  //***************************************************************************************
  this.Test9 = function()
  {
    
    var model = {
      Mode: "admin"
    };

    this.Test(9, model, function(test)
    {

      test.Assert($("#test9_inner").hasClass("green") && $("#test9_inner").hasClass("borders"), "Test 9.1");

      $("#btn9_1").click();
      test.Assert($("#test9_inner").hasClass("orange") && $("#test9_inner").hasClass("borders"), "Test 9.2");

      $("#btn9_2").click();
      test.Assert($("#test9_inner").hasClass("blue") && $("#test9_inner").hasClass("borders"), "Test 9.3");

      $("#btn9_3").click();
      test.Assert($("#test9_inner").hasClass("green") && $("#test9_inner").hasClass("borders"), "Test 9.4");
    });
  }

  //***************************************************************************************
  this.Test10 = function()
  {
    
    var model = {
      Mode: "admin"
    };

    this.Test(10, model, function(test)
    {

      test.Assert($("#btn10_3").attr("disabled") != "disabled");
      test.Assert($("#txt10").attr("readonly") != "readonly");
      test.Assert($("#chkDetail").attr("checked") != "checked");
      test.Assert($("#chkAdmin").attr("checked") == "checked");
      test.Assert($("#chkEdit").attr("checked") != "checked");
      test.Assert($("#test10_inner").hasClass("franklin"));

      $("#btn10_2").click();
      test.Assert($("#btn10_3").attr("disabled") == "disabled");
      test.Assert($("#txt10").attr("readonly") == "readonly");
      test.Assert($("#chkDetail").attr("checked") == "checked");
      test.Assert($("#chkAdmin").attr("checked") != "checked");
      test.Assert($("#chkEdit").attr("checked") != "checked");
      test.Assert($("#test10_inner").hasClass("franklin"));

      $("#btn10_1").click();
      test.Assert($("#btn10_3").attr("disabled") != "disabled");
      test.Assert($("#txt10").attr("readonly") != "readonly");
      test.Assert($("#chkDetail").attr("checked") != "checked");
      test.Assert($("#chkAdmin").attr("checked") != "checked");
      test.Assert($("#chkEdit").attr("checked") == "checked");
      test.Assert($("#test10_inner").hasClass("franklin"));
    });
  }

  //***************************************************************************************
  this.Test11 = function()
  {
    
    var model = {
      Speed: "Fast",
      Color: "Blue",
      Price: "Expensive"
    };

    this.Test(11, model, function(test)
    {

      test.AssertContent("#test11 h2", "This car is Fast and Blue and Expensive!");
      test.Assert(test.GetValue("txtTest11_Speed") == "Fast");
      test.Assert(test.GetValue("txtTest11_Color") == "Blue");
      test.Assert(test.GetValue("txtTest11_Price") == "Expensive");

      model.Speed = "Slow";
      model.Color = "Green";
      model.Price = "Cheap";

      test.ViewModel.UpdateView();

      test.Assert($("#test11 h2").html() == "This car is Slow and Green and Cheap!");
      test.Assert($("#txtTest11_Speed").val() == "Slow"); 
      test.Assert($("#txtTest11_Color").val() == "Green"); 
      test.Assert($("#txtTest11_Price").val() == "Cheap");
    });
  }

  //***************************************************************************************
  this.Test12 = function()
  {
    
    var model = {
      Speed: "Fast",
      Attributes:
      {
        Color: "Blue"
      },
      Price: "Expensive"
    };

    this.Test(12, model, function(test)
    {
      var spd = test.GetValue("txtTest12_Speed");
      var clr = test.GetValue("txtTest12_Color");

      test.Assert($("#test12 h2").html() == "This car is Fast and Blue and Expensive!");
      test.Assert(spd == "Fast");
      test.Assert(clr == "Blue");
      test.Assert(test.GetValue("txtTest12_Price") == "Expensive");

      model.Speed = "Slow";
      model.Attributes.Color = "Green";
      model.Price = "Cheap";

      test.ViewModel.UpdateView();

      test.Assert($("#test12 h2").html() == "This car is Slow and Green and Cheap!");
      test.Assert(test.GetValue("txtTest12_Speed") == "Slow" && test.GetValue("txtTest12_Color") == "Green" && test.GetValue("txtTest12_Price") == "Cheap");
    });
  }

  //***************************************************************************************
  this.Test13 = function()
  {
    
    var model = {
      Speech: "Now is the time for all good men to come to the aid of their country."
    };

    this.Test(13, model, function(test)
    {

      test.Assert($("#test13 p").html() == "Now is the time for all good men to come to the aid of their country.");
      test.Assert(test.GetValue("txtTest13_Speech") == "Now is the time for all good men to come to the aid of their country.");

      model.Speech = "It is a far, far better thing that I do now than I have ever done before.";

      test.ViewModel.UpdateView();

      test.Assert($("#test13 p").html() == "It is a far, far better thing that I do now than I have ever done before.");
      test.Assert(test.GetValue("txtTest13_Speech") == "It is a far, far better thing that I do now than I have ever done before.");
    });
  }

  //***************************************************************************************
  this.Test14 = function()
  {
    
    var model = {
      Speed: "Fast",
      Color: "blue",
      Price: "Expensive"
    };

    this.Test(14, model, function(test)
    {

      var b = $("#test14_inner").css("background-color");

      test.Assert(b == "rgb(0, 0, 255)");

      model.Color = "green";

      test.ViewModel.UpdateView();

      b = $("#test14_inner").css("background-color");

      test.Assert(b == "rgb(0, 128, 0)");
    });
  }

  //***************************************************************************************
  this.Test15 = function()
  {
    
    var model = {
      Speed: "Fast",
      Attributes:
      {
        Color: "blue",
        InteriorColor: "green"
      },
      Price: "Expensive"
    };

    this.Test(15, model, function(test)
    {

      var b = $("#test15_inner").css("background-color");

      test.Assert(b == "rgb(0, 0, 255)");

      var d = $("#test15_inner").css("width");

      test.Assert(d == "400px");

      var e = $("#test15_inner").css("color");

      test.Assert(e == "rgb(255, 255, 0)");

      model.Attributes.Color = "green";

      test.ViewModel.UpdateView();

      b = $("#test15_inner").css("background-color");

      test.Assert(b == "rgb(0, 128, 0)");
    });
  }

  //***************************************************************************************
  this.Test16 = function()
  {
    
    var model = {
      Make: "Chevy",
      Models:
      [
        {
          Name: "Malibu",
          Color: "Green",
          Year: 1969
        },
        {
          Name: "Corvette",
          Color: "Red",
          Year: 1965
        },
        {
          Name: "Camaro",
          Color: "Black",
          Year: 1970
        },
        {
          Name: "Silverado",
          Color: "Blue",
          Year: 2016
        }
      ]
    };

    this.Test(16, model, function(test)
    {

      test.Assert($("#test16_Malibu h4").html() == "1969 Chevy Malibu" &&
             $("#test16_Corvette h4").html() == "1965 Chevy Corvette" &&
             $("#test16_Camaro h4").html() == "1970 Chevy Camaro" &&
             $("#test16_Silverado h4").html() == "2016 Chevy Silverado");

      test.Assert($("#test16_Malibu h3").html() == "1969 Chevy Malibu" &&
             $("#test16_Corvette h3").html() == "1965 Chevy Corvette" &&
             $("#test16_Camaro h3").html() == "1970 Chevy Camaro" &&
             $("#test16_Silverado h3").html() == "2016 Chevy Silverado");

      test.Assert($("#test16_Malibu h5").html() == "Year: 1969" &&
             $("#test16_Corvette h5").html() == "Year: 1965" &&
             $("#test16_Camaro h5").html() == "Year: 1970" &&
             $("#test16_Silverado h5").html() == "Year: 2016");

      test.Assert($("#test16_Malibu p").html() == "Index: 0" &&
             $("#test16_Corvette p").html() == "Index: 1" &&
             $("#test16_Camaro p").html() == "Index: 2" &&
             $("#test16_Silverado p").html() == "Index: 3");

      model.Models[2].Year = 1971;
      test.ViewModel.UpdateView();

      test.Assert($("#test16_Camaro h5").html() == "Year: 1971");

      $("#test16_Camaro button").click();
      test.Assert($("#test16_Camaro h5").html() == "Year: 1972");

      $("#test16_Camaro button").click();
      test.AssertContent("#test16_Camaro h5", "Year: 1973");
    });
  }

  //***************************************************************************************
  this.Test17 = function()
  {
    
    var model = {
      Make: "Chevy",
      Models:
      [
        {
          Name: "Malibu",
          Color: "Green",
          Year: 1969
        },
        {
          Name: "Corvette",
          Color: "Red",
          Year: 1965
        }
      ]
    };

    this.Test(17, model, function(test)
    {

      test.AssertContent("#test17 h2", "Make: Chevy is cool!");
      $("#test17 button").click();
      test.AssertContent("#test17 h2", "Make: Audi is cool!");
    });
  }

  //***************************************************************************************
  this.Test18 = function()
  {
    
    var model = {
      MountainName: "Baker"
    };


    this.Test(18, model, function(test)
    {

      test.AssertContent("#test18 p", "Baker transformed!");
    });
  }

  //***************************************************************************************
  this.Test19 = function()
  {
    
    var model = {
      CurrentDate: new Date()
    };

    model.CurrentDate = new Date(2016, 2, 24);

    this.Test(19, model, function(test)
    {

      test.AssertContent("#test19 h2", "Current Date: Mar 24, 2016");
      test.Assert($("#dtCurrentDate").val() == "Mar 24, 2016");
      test.Assert($("#dtCurrentDate2").val() == "Mar 24, 2016");

      model.CurrentDate = new Date(2015, 0, 10);
      test.ViewModel.UpdateView();

      test.AssertContent("#test19 h2", "Current Date: Jan 10, 2015");
      test.Assert($("#dtCurrentDate").val() == "Jan 10, 2015");
      test.Assert($("#dtCurrentDate2").val() == "Jan 10, 2015");
    });
  }
  
  //***************************************************************************************
  this.Test20 = function()
  {
    
    var model = {
      Make: "Chevy",
      Models:
      [
        {
          Name: "Malibu",
          Color: "Green",
          Year: 1969
        },
        {
          Name: "Corvette",
          Color: "Red",
          Year: 1965
        },
        {
          Name: "Camaro",
          Color: "Black",
          Year: 1970
        },
        {
          Name: "Silverado",
          Color: "Blue",
          Year: 2016
        }
      ]
    };

    this.Test(20, model, function(test)
    {
      test.AssertEqual($("#test20_inner > .car").length, 4);
      test.AssertContent("#test20_inner > div:nth-of-type(5) ~ button:first-of-type", "Add New Car");
      test.AssertContent("#test20_inner > div:nth-of-type(5) ~ button:nth-of-type(2)", "Add And Remove Car");

      $("#btnTest20_1").click();

      test.AssertEqual($("#test20_inner > .car").length, 5);

      test.AssertContent("#test20_inner > div:nth-of-type(2) h4", "1969 Chevy Malibu");
      test.AssertContent("#test20_inner > div:nth-of-type(3) h4", "1965 Chevy Corvette");
      test.AssertContent("#test20_inner > div:nth-of-type(4) h4", "1970 Chevy Camaro");
      test.AssertContent("#test20_inner > div:nth-of-type(5) h4", "2016 Chevy Silverado");
      test.AssertContent("#test20_inner > div:nth-of-type(6) h4", "1967 Chevy Nova");

      test.AssertContent("#test20_inner > div:nth-of-type(6) ~ button:first-of-type", "Add New Car");
      test.AssertContent("#test20_inner > div:nth-of-type(6) ~ button:nth-of-type(2)", "Add And Remove Car");

    });
  }
  
  //***************************************************************************************
  this.Test21 = function()
  {
    
    var model = {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Year: 1970
    };

    this.Test(21, model, function(test)
    {
      test.Assert($("#test21 h4").html() == "1970 Chevy Camaro hey ho");

      $("#btnTest21_1").click();

      test.Assert($("#test21 h4").html() == "2010 Audi Q5 blah blah");

      $("#btnTest21_2").click();

      test.Assert($("#test21 h4").html() == "2017 Land Rover Empire yada yada");
    });
  }

  //***************************************************************************************
  this.Test22 = function()
  {
    var model = 
    {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Owner: "Fred",
      Year:  1970
    };

    this.Test(22, model, function(test)
    {
      test.Assert($("#test22 h4").html() == "1970 Chevy Camaro");

      $("#btnTest22_1").click();

      test.Assert($("#test22 h4").html() == "2010 Audi Q5");

      $("#btnTest22_2").click();

      test.Assert($("#test22 h4").html() == "2017 Land Rover Empire");

      $("#btnTest22_2").click();

      test.Assert($("#test22 h4").html() == "2017 Land Rover Empire");

      $("#btnTest22_2").click();

      test.Assert($("#test22 h4").html() == "2017 Land Rover Empire");

      $("#btnTest22_1").click();

      test.Assert($("#test22 h4").html() == "2010 Audi Q5");

      $("#btnTest22_1").click();

      test.Assert($("#test22 h4").html() == "2010 Audi Q5");

      $("#btnTest22_1").click();

      test.Assert($("#test22 h4").html() == "2010 Audi Q5");

    });
  }

  //***************************************************************************************
  this.Test23 = function()
  {  
    var model = 
    {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Owner: "Fred",
      Year:  1970
    };

    this.Test(23, model, function(test)
    {

      test.Assert($("#test23 h4").html() == "1970 Chevy Camaro");
      test.Assert($("#test23 h6").html() == "Owner: Fred");

      $("#btnTest23_1").click();

      test.Assert($("#test23 h4").html() == "2010 Audi Q5");

      $("#btnTest23_2").click();

      test.Assert($("#test23 h4").html() == "2017 Land Rover Empire");
      test.Assert($("#test23 h6").html() == "Owner: Frank");

      model.Owner = "John";
      test.ViewModel.UpdateView();
      test.Assert($("#test23 h6").html() == "Owner: John");
    });
  }

  //***************************************************************************************
  this.Test24 = function()
  {
    
    var model = {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Owner: "Fred",
      Year: 1970
    };

    this.Test(24, model, function(test)
    {
      test.Assert($("#test24 h4").html() == "1970 Chevy Camaro");
      test.Assert($("#test24 h6").html() == "Owner: Fred");

      $("#btnTest24_1").click();

      test.Assert($("#test24 h4").html() == "2010 Audi Q5");

      $("#btnTest24_2").click();

      test.Assert($("#test24 h4").html() == "2017 Land Rover Empire");
      test.Assert($("#test24 h6").html() == "Owner: Frank");

      model.Owner = "John";
      test.ViewModel.UpdateView();
      test.Assert($("#test24 h6").html() == "Owner: John");
      test.Assert($("#test24 .p2").html() == "I also have a Boat");


      for(var i = 0; i < 3; ++i)      
      {
        $("#btnTest24_1").click();
  
        test.Assert($("#test24 h4").html() == "2010 Audi Q5");

        $("#btnTest24_2").click();

        test.Assert($("#test24 h4").html() == "2017 Land Rover Empire");
        test.Assert($("#test24 h6").html() == "Owner: Frank");
      }
    });
  }

  //***************************************************************************************
  this.Test25 = function()
  {
    this.Test(25, null, function(test)
    {    
      test.ViewModel.ModelPath = "~/models/test25.json";
      test.ViewModel.ModelVerb = "GET";
      test.ViewModel.LoadModel(null, function()
      {
        test.Assert($("#test25 h4").html() == "1969 Pontiac Firebird");
        test.Assert($("#test25 h6").html() == "Owner: Jim");

        test.Finish();
      });
    });
  }

  //***************************************************************************************
  this.Test26 = function()
  {
    this.Test(26, null, function(test)
    {        
      test.ViewModel.ModelPath = "~/models/test25.json";
      test.ViewModel.ModelVerb = "GET";
      test.ViewModel.LoadModel(null, function()
      {
        test.Assert($("#test26_1 h4").html() == "1969 Pontiac Firebird");
        test.Assert($("#test26_1 h6").html() == "Owner: Jim");
        test.Assert($("#test26_2 h4").html() == "1969 Pontiac Firebird");
        test.Assert($("#test26_2 h6").html() == "Owner: Jim");
        test.Assert($("#test26_3 h4").html() == "1969 Pontiac Firebird");
        test.Assert($("#test26_3 h6").html() == "Owner: Jim");
        test.Assert($("#test26_4 h4").html() == "1969 Pontiac Firebird");
        test.Assert($("#test26_4 h6").html() == "Owner: Jim");
        test.Assert($("#test26_5 h4").html() == "1969 Pontiac Firebird");
        test.Assert($("#test26_5 h6").html() == "Owner: Jim");
        test.Assert($("#test26_6 h4").html() == "1969 Pontiac Firebird");
        test.Assert($("#test26_6 h6").html() == "Owner: Jim");

        test.Finish();
      });
    });
  }

  //***************************************************************************************
  this.Test27 = function()
  {
    this.Test(27, null, function(test)
    {        
      test.ViewModel.ModelPath = "~/models/test25.json";
      test.ViewModel.ModelVerb = "GET";
      test.ViewModel.LoadModel(null, function()
      {
        test.Assert($("#test27_1 h4").html() == "1969 Pontiac Firebird");
        test.Assert($("#test27_1 h6").html() == "Owner: Jim");

        test.Finish();
      });
    });
  }
  
  //***************************************************************************************
  this.Test28 = function()
  {    
    var model = {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Year: 1970
    };

    this.Test(28, model, function(test)
    {
      test.Assert($("#test28 h4").html() == "1970 Chevy Camaro");

      for(var i = 0; i < 50; ++i)
      {
        $("#btnTest28_1").click();

        test.Assert($("#test28 h4").html() == "2010 Audi Q5");

        $("#btnTest28_2").click();

        test.Assert($("#test28 h4").html() == "2017 Land Rover Empire");
      }
      
    });
  }
  
  //***************************************************************************************
  this.Test29 = function()
  {
    
    var model = {
      Make: "Chevy",
      Models:
      [
        {
          Name: "Malibu",
          Color: "Green",
          Year: 1969
        },
        {
          Name: "Corvette",
          Color: "Red",
          Year: 1965
        },
        {
          Name: "Camaro",
          Color: "Black",
          Year: 1970
        },
        {
          Name: "Silverado",
          Color: "Blue",
          Year: 2016
        }
      ]
    };

    this.Test(29, model, function(test)
    {
      test.Assert($("#test29_1 h4").html() == "1969 Chevy Malibu" &&
                  $("#test29_2 h4").html() == "1965 Chevy Corvette" &&
                  $("#test29_3 h4").html() == "1970 Chevy Camaro" &&
                  $("#test29_4 h4").html() == "2016 Chevy Silverado");

      test.Assert($("#test29_1 h5").html() == "Year: 1969" &&
                  $("#test29_2 h5").html() == "Year: 1965" &&
                  $("#test29_3 h5").html() == "Year: 1970" &&
                  $("#test29_4 h5").html() == "Year: 2016");

      test.Assert($("#test29_1 p").html() == "Index: 0" &&
                  $("#test29_2 p").html() == "Index: 1" &&
                  $("#test29_3 p").html() == "Index: 2" &&
                  $("#test29_4 p").html() == "Index: 3");

      $("#test29 button").click();

      test.Assert($("#test29_1 h4").html() == "2017 Chevy Equinox" &&
                  $("#test29_2 h4").html() == "2016 Chevy Traverse" &&
                  $("#test29_3 h4").html() == "2005 Chevy Tahoe" &&
                  $("#test29_4 h4").html() == "1992 Chevy Suburban");

      test.Assert($("#test29_1 h5").html() == "Year: 2017" &&
                  $("#test29_2 h5").html() == "Year: 2016" &&
                  $("#test29_3 h5").html() == "Year: 2005" &&
                  $("#test29_4 h5").html() == "Year: 1992");

    });

  }
  
  //***************************************************************************************
  this.Test30 = function()
  {
    
    var model = {
      Make: "Chevy",
      Info:
      {
        Name: "Malibu",
        Color: "Green",
        Year: 1969
      }
    };

    this.Test(30, model, function(test)
    {
      test.Assert($("#test30 h4").html() == "1969 Chevy Malibu");
      test.Assert($("#test30 h5").html() == "Year: 1969");

      $("#test30 button").click();

      test.Assert($("#test30 h4").html() == "1965 Chevy Corvette");
      test.Assert($("#test30 h5").html() == "Year: 1965");
    });

  }

  //***************************************************************************************
  this.Test31 = function()
  {    
    var model = {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Year: 1970
    };

    this.Test(31, model, function(test)
    {
      test.Assert($("#test31 h4").html() == "1970 Chevy Camaro");

      $("#btnTest31_1").click();

      test.Assert($("#test31 h4").html() == "2010 Audi Q5");

      $("#btnTest31_2").click();

      test.Assert($("#test31 h4").html() == "2017 Land Rover Empire");
    });
  }
  
  //***************************************************************************************
  this.Test32 = function()
  {    
    var model = {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Year: 1970,
      Menu:
      [
        {Id: "Chevy", Caption: "Chevy"},
        {Id: "Audi", Caption: "Audi"},
        {Id: "LandRover", Caption: "Land Rover"},
        {Id: "Pontiac", Caption: "Pontiac"},
        {Id: "Oldsmobile", Caption: "Oldsmobile"}
      ]
    };

    this.Test(32, model, function(test)
    {
      test.Assert($.trim($("#test32 ul li:first-of-type").html()) == "Chevy");
      test.Assert($.trim($("#test32 ul li:nth-of-type(2)").html()) == "Audi");
      test.Assert($.trim($("#test32 ul li:nth-of-type(3)").html()) == "Land Rover");
      test.Assert($.trim($("#test32 ul li:nth-of-type(4)").html()) == "Pontiac");
      test.Assert($.trim($("#test32 ul li:nth-of-type(5)").html()) == "Oldsmobile");
    });
  }
  
  
  //***************************************************************************************
  this.Test33 = function()
  {    
      var model = {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Year: 1970
    };

    this.Test(33, model, function(test)
    {
      $("#btnTest33_1").click();
      test.Assert($("#test33").hasClass("blue"));
      test.AssertContent("#test33_txt", "2010 Audi Q5");

      $("#btnTest33_2").click();
      test.Assert($("#test33").hasClass("green"));
      test.AssertContent("#test33_txt", "2017 Land Rover Empire");

      $("#btnTest33_3").click();
      test.AssertContent("#test33_txt", "1955 Studebaker Royale");
    });
  }
  
  
  //***************************************************************************************
  this.Test34 = function()
  {    
      var model = {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Year: 1970
    };

    this.Test(34, model, function(test)
    {
      $("#btnTest34_1").click();
      test.Assert($("#test34").hasClass("blue"));
      test.AssertContent("#test34_txt", "2010 Audi Q5");

      $("#btnTest34_2").click();
      test.Assert($("#test34").hasClass("green"));
      test.AssertContent("#test34_txt", "2017 Land Rover Empire");
    });
  }
  
  //***************************************************************************************
  this.Test35 = function()
  {    
      var model = {
      Make: "Chevy",
      Name: "Camaro",
      Color: "Black",
      Year: 1970
    };

    this.Test(35, model, function(test)
    {
      $("#btnTest35_1").click();
      test.AssertContent("#test35_txt", "1955 Studebaker Royale");
    });
  }
    
  //***************************************************************************************
  this.Test36 = function()
  {    
   var model = { Year: 1964,
                 ErrorMessages:
                 [
                  "The name of the Make is too short!",
                  "The year is too far in the past",
                  "The year is in the future"
                 ],
                 MakeMinLength: 7,
                 MinYear: 1898,
                 MaxYear: 2017
               };

    this.Test(36, model, function(test)
    {
      $("#ValidateSuccess").html("");
      $("#ValidateFailures").html("<br>");
      model.Make = "Aston Martin"
      $("#btnTest36_1").click();
      test.AssertContent("#ValidateFailures", "<br>");
      test.AssertContent("#ValidateSuccess", "You've been submitted!");

      $("#ValidateSuccess").html("");
      $("#ValidateFailures").html("<br>");
      model.Make = "Aston Martin"
      model.Year = 1700;
      $("#btnTest36_1").click();
      test.AssertContent("#ValidateFailures ul li:first-of-type", "The year is too far in the past");
      test.AssertContent("#ValidateSuccess", "");

      $("#ValidateSuccess").html("");
      $("#ValidateFailures").html("<br>");
      model.Make = "Aston Martin"
      model.Year = 2018;
      $("#btnTest36_1").click();
      test.AssertContent("#ValidateFailures ul li:first-of-type", "The year is in the future");
      test.AssertContent("#ValidateSuccess", "");

      $("#ValidateSuccess").html("");
      $("#ValidateFailures").html("<br>");
      model.Make = "Aston Martin"
      model.Year = 1961;
      $("#btnTest36_1").click();
      test.AssertContent("#ValidateFailures", "<br>");
      test.AssertContent("#ValidateSuccess", "You've been submitted!");

      $("#ValidateSuccess").html("");
      $("#ValidateFailures").html("<br>");
      model.Make = "Ford"
      model.Year = 2018;
      $("#btnTest36_2").click();
      test.AssertContent("#ValidateFailures ul li:first-of-type", "The name of the Make is too short!");
      test.AssertContent("#ValidateFailures ul li:nth-of-type(2)", "The year is in the future");
      test.AssertContent("#ValidateSuccess", "");

      $("#ValidateSuccess").html("");
      $("#ValidateFailures").html("<br>");
      model.Make = "Ford"
      model.Year = 2018;
      $("#btnTest36_3").click();
      test.Assert($("#ValidateFailures ul li").length == 1);
      test.AssertContent("#ValidateFailures ul li:first-of-type", "The year is in the future");
      test.AssertContent("#ValidateSuccess", "");

      $("#ValidateSuccess").html("");
      $("#ValidateFailures").html("<br>");
      model.Make = "Ford"
      model.Year = 2018;
      $("#btnTest36_4").click();
      test.AssertContent("#ValidateSuccess", "");
      test.AssertContent("#ValidateFailures ul li:first-of-type", "The name of the Make is too short!");
      test.AssertContent("#ValidateFailures ul li:nth-of-type(2)", "The year is in the future");

    });
  }
  
  //***************************************************************************************
  this.Test37 = function()
  {    
      var model = { Mode: 'user'};

    this.Test(37, model, function(test)
    {
    });
  }
    
  //***************************************************************************************
  this.Test38 = function()
  {    
      var model = { Cars: 
      
                    [
                      {Make: "Pontiac"},
                      {Make: "Chevy"},
                      {Make: "Buick"},
                      {Make: "Audi"},
                      {Make: "Studebaker"},
                      {Make: "Aston Martin"},
                    ]
                    
                  };

    this.Test(38, model, function(test)
    {

      test.AssertContent("#test38_contents div:first-of-type",  "Aston Martin");
      test.AssertContent("#test38_contents div:nth-of-type(2)", "Audi");
      test.AssertContent("#test38_contents div:nth-of-type(3)", "Buick");
      test.AssertContent("#test38_contents div:nth-of-type(4)", "Chevy");
      test.AssertContent("#test38_contents div:nth-of-type(5)", "Pontiac");
      test.AssertContent("#test38_contents div:nth-of-type(6)", "Studebaker");
    });
  }
    
  //***************************************************************************************
  this.Test39 = function()
  {    
      var model = { Cars: 
      
                    [
                      {Make: "Pontiac"},
                      {Make: "Chevy"},
                      {Make: "Buick"},
                      {Make: "Audi"},
                      {Make: "Studebaker"},
                      {Make: "Aston Martin"},
                    ]
                    
                  };

    this.Test(39, model, function(test)
    {
      test.AssertContent("#test39_contents div:first-of-type",  "Aston Martin");
      test.AssertContent("#test39_contents div:nth-of-type(2)", "Audi");
      test.AssertContent("#test39_contents div:nth-of-type(3)", "Buick");
      test.AssertContent("#test39_contents div:nth-of-type(4)", "Chevy");
      test.AssertContent("#test39_contents div:nth-of-type(5)", "Pontiac");
      test.AssertContent("#test39_contents div:nth-of-type(6)", "Studebaker");
    });
  }
    
  //***************************************************************************************
  this.Test40 = function()
  {    
      var model = { Cars: 
      
                    [
                      {Make: "Pontiac", Year: 1969},
                      {Make: "Chevy", Year: 1970},
                      {Make: "Buick", Year: 1985},
                      {Make: "Audi", Year: 2017},
                      {Make: "Studebaker", Year: 1953},
                      {Make: "Aston Martin", Year: 1964},
                    ]
                    
                  };

    this.Test(40, model, function(test)
    {
      test.AssertContent("#test40_contents h6:first-of-type",  "20th");
      test.AssertContent("#test40_contents h6:nth-of-type(2)", "21st");
      test.AssertContent("#test40_contents h6:nth-of-type(3)", "20th");
      test.AssertContent("#test40_contents h6:nth-of-type(4)", "20th");
      test.AssertContent("#test40_contents h6:nth-of-type(5)", "20th");
      test.AssertContent("#test40_contents h6:nth-of-type(6)", "20th");
    });
  }
    
  //***************************************************************************************
  this.Test41 = function()
  {    
    var model = { Make: "Pontiac", Model: "GTO", Year: 1969};

    this.Test(41, model, function(test)
    {
      test.AssertContent("#test41 p", "1969 Pontiac GTO");
      $("#btn41").click();
      test.AssertContent("#test41 p", "1964 Chevy Corvette");
    });
  }
    
  //***************************************************************************************
  this.Test42 = function()
  {    
    var model = { Make: "Pontiac", Model: "GTO", Year: 1965};

    this.Test(42, model, function(test)
    {
      test.AssertContent("#test42 p", "1965 Pontiac GTO");
      $("#btn42_1").click();
      test.AssertContent("#test42 p", "1969 Chevy Corvette");
    });
  }
    
  //***************************************************************************************
  this.Test43 = function()
  {    
    var model = { Make: "Pontiac", Model: "Firebird", Year: 1967};

    this.Test(43, model, function(test)
    {
      test.AssertContent("#test43 p", "1967 Pontiac Firebird");
    });
  }
    
  //***************************************************************************************
  this.Test44 = function()
  {    
    var model = { Make: "Pontiac", Model: "Firebird", Year: 1967};

    this.Test(44, model, function(test)
    {
      test.AssertContent("#test44 p", "1967 Pontiac Firebird");
    });
  }
    
  //***************************************************************************************
  this.Test45 = function()
  {    
    var model = {
                  Names:
                  [
                    {Name: "Fred"},
                    {Name: "Wilma"}
                  ]
                };

    this.Test(45, model, function(test)
    {
      test.Assert($("#test45 #test45_0").val() == "Fred");
      test.Assert($("#test45 #test45_1").val() == "Wilma");
      test.Assert($("#test45 #bob1_0").html() == $("#test45 #bob2_0").html());
      test.Assert($("#test45 #bob1_1").html() == $("#test45 #bob2_1").html());
    });
  }
 
   //***************************************************************************************
  this.Test46 = function()
  {    
      var model = { Cars: 
                    {
                      MyCars:
                      [
                        {Make: "Pontiac",      Color: "Black",          Year: 1969},
                        {Make: "Chevy",        Color: "Blue",           Year: 1970},
                        {Make: "Buick",        Color: "Green",          Year: 1985},
                        {Make: "Audi",         Color: "Red",            Year: 2017},
                        {Make: "Studebaker",   Color: "Tan",            Year: 1953},
                        {Make: "Aston Martin", Color: "Midnight Blue",  Year: 1964},
                      ]
                    }                    
                  };

      var model2 = { Cars: 
                    {
                      MyCars:
                      [
                        {Make: "Pontiac",      Color: "Black",          Year: 1969},
                        {Make: "Chevy",        Color: "Blue",           Year: 1970},
                        {Make: "Buick",        Color: "Green",          Year: 1985},
                        {Make: "Audi",         Color: "Red",            Year: 1973},
                        {Make: "Studebaker",   Color: "Black",          Year: 1953},
                        {Make: "Aston Martin", Color: "Midnight Blue",  Year: 1964},
                      ]
                    }                    
                  };

    this.Test(46, model, function(test)
    {
      test.AssertContent("#test46_contents ul li:first-of-type",  "1969 Pontiac");
      test.AssertContent("#test46_contents ul li:nth-of-type(3)", "1970 Chevy");
      test.AssertContent("#test46_contents ul li:nth-of-type(5)", "1985 Buick");
      test.AssertContent("#test46_contents ul li:nth-of-type(7)", "1964 Aston Martin");

      model.Cars.MyCars = model2.Cars.MyCars;
      test.ViewModel.UpdateView();

      test.AssertContent("#test46_contents ul li:first-of-type",  "1969 Pontiac");
      test.AssertContent("#test46_contents ul li:nth-of-type(3)", "1970 Chevy");
      test.AssertContent("#test46_contents ul li:nth-of-type(5)", "1985 Buick");
      test.AssertContent("#test46_contents ul li:nth-of-type(7)", "1973 Audi");
      test.AssertContent("#test46_contents ul li:nth-of-type(9)", "1953 Studebaker");
      test.AssertContent("#test46_contents ul li:nth-of-type(11)", "1964 Aston Martin");

    });
  }
    
    
  //***************************************************************************************
  this.Test47 = function()
  {    
    var model = {
                  Make: "Pontiac",      
                  Color: "Black",          
                  Year: 1969
                };

    this.Test(47, model, function(test)
    {
    var val = $.trim($("#test47_txt").text());

      test.Assert(val == "Black 1969 Pontiac");
      model.Make = "Aston Martin";
      model.Year = "1964";
      model.Color = "Midnight Blue";
      test.ViewModel.UpdateView();
      val = $.trim($("#test47_txt").text());
      test.Assert(val == "Midnight Blue 1964 Aston Martin");
    });
  }
 
  //***************************************************************************************
  this.Test48 = function()
  {    
    var model = {
                  CurrentChoiceModel:
                  {
                    Make: "Pontiac",      
                    Color: "Black",          
                    Year: 1969
                  },
                  AllMakes:
                  [
                    {Id: "test48_pontiac",      Make: "Pontiac",      Color: "Black",          Year: 1969},
                    {Id: "test48_chevy",        Make: "Chevy",        Color: "Blue",           Year: 1970},
                    {Id: "test48_buick",        Make: "Buick",        Color: "Green",          Year: 1985},
                    {Id: "test48_audi",         Make: "Audi",         Color: "Red",            Year: 1973},
                    {Id: "test48_studebaker",   Make: "Studebaker",   Color: "Black",          Year: 1953},
                    {Id: "test48_astonmartin",  Make: "Aston Martin", Color: "Midnight Blue",  Year: 1964}
                  ]
                };

    this.Test(48, model, function(test)
    {
      test.AssertContent("#test48_txt", "Black 1969 Pontiac");

      $("#test48 ul #test48_astonmartin").click();

      test.AssertContent("#test48_txt", "Midnight Blue 1964 Aston Martin");

      $("#test48 ul #test48_audi").click();

      test.AssertContent("#test48_txt", "Red 1973 Audi");
    });
  }
 
  //***************************************************************************************
  this.Test49 = function()
  {    
    var model = {
                  CurrentPerson:
                  {
                    GivenName:     "John",      
                    Surname:      "Smith",          
                    Title:        "Dr",          
                    Suffix:       "III",          
                    SurnameFirst: false
                  }
                };

    this.Test(49, model, function(test)
    {
      test.AssertContent("#test49_txt", "Dr John Smith III");

      $("#btn49_1").click();

      test.AssertContent("#test49_txt", "Sir Edmund De Vere IV");
    });
  }
 
  //***************************************************************************************
  this.Test50 = function()
  {    
    var model = {
                  CurrentPerson:
                  {
                    GivenName:     "John",      
                    Surname:      "Smith",          
                    Title:        "Dr",          
                    Suffix:       "III",          
                    SurnameFirst: false
                  }
                };

    this.Test(50, model, function(test)
    {
      test.AssertContent("#test50_txt", "Dr John Smith III");

      $("#btn50_1").click();

      test.AssertContent("#test50_txt", "Sir Edmund De Vere IV");
    });
  }
 
  //***************************************************************************************
  this.Test51 = function()
  {    
    var model = {
                  CurrentPerson:
                  {
                    GivenName:     "John",      
                    Surname:      "Smith",          
                    Title:        "Dr",          
                    Suffix:       "III",          
                    SurnameFirst: false
                  }
                };

    this.Test(51, model, function(test)
    {
      test.AssertContent("#test51_txt", "Dr John Smith III");

      $("#btn51_1").click();

      test.AssertContent("#test51_txt", "Sir Edmund De Vere IV");
    });
  }

  //***************************************************************************************
  this.Test52 = function()
  {    
    var model = {
                  Makes:
                  [
                    {Id: "pontiac",      Make: "Pontiac",      Color: "Black",          Year: 1969},
                    {Id: "chevy",        Make: "Chevy",        Color: "Blue",           Year: 1970},
                    {Id: "buick",        Make: "Buick",        Color: "Green",          Year: 1985},
                    {Id: "audi",         Make: "Audi",         Color: "Red",            Year: 1973},
                    {Id: "studebaker",   Make: "Studebaker",   Color: "Black",          Year: 1953},
                    {Id: "astonmartin",  Make: "Aston Martin", Color: "Midnight Blue",  Year: 1964}
                  ]
                };

    this.Test(52, model, function(test)
    {
      test.AssertContent("#test52 table tr:first-of-type  td:first-of-type",  "Pontiac");
      test.AssertContent("#test52 table tr:nth-of-type(2) td:first-of-type",  "Chevy");
      test.AssertContent("#test52 table tr:nth-of-type(3) td:first-of-type",  "Buick");
      test.AssertContent("#test52 table tr:nth-of-type(5) td:first-of-type",  "Aston Martin");
      test.AssertContent("#test52 table tr:nth-of-type(4) td:nth-of-type(5)", "Awesome");
    });
  }
 
  //***************************************************************************************
  this.Test53 = function()
  {    
    var model = {
                  Config:
                  {
                    ShowOldCars: false,
                    AwesomeCar: 'astonmartin',
                    Owner: 'Jim'
                  },

                  Makes:
                  [
                    {Id: "pontiac",      Make: "Pontiac",      Color: "Black",          Year: 1969},
                    {Id: "chevy",        Make: "Chevy",        Color: "Blue",           Year: 1970},
                    {Id: "buick",        Make: "Buick",        Color: "Green",          Year: 1985},
                    {Id: "audi",         Make: "Audi",         Color: "Red",            Year: 1973},
                    {Id: "studebaker",   Make: "Studebaker",   Color: "Black",          Year: 1953},
                    {Id: "astonmartin",  Make: "Aston Martin", Color: "Midnight Blue",  Year: 1964}
                  ]
                };

    this.Test(53, model, function(test)
    {
      test.AssertContent("#test53 h1",  "These are Jim's cars:");
      test.AssertContent("#test53 table tr:first-of-type  td:first-of-type",  "Pontiac");
      test.AssertContent("#test53 table tr:nth-of-type(2) td:first-of-type",  "Chevy");
      test.AssertContent("#test53 table tr:nth-of-type(3) td:first-of-type",  "Buick");
      test.AssertContent("#test53 table tr:nth-of-type(5) td:first-of-type",  "Aston Martin");
      test.AssertContent("#test53 table tr:nth-of-type(5) td:nth-of-type(5)", "Awesome");
    });
  }
 
  //***************************************************************************************
  this.Test54 = function()
  {    
    var model = {
                  Config:
                  {
                    ShowOldCars: false,
                    AwesomeCar: 'astonmartin',
                    Owner: 'Jim'
                  },

                  SingleMake:
                  {
                    Id: "pontiac",      
                    Make: "Pontiac",      
                    Color: "Black",          
                    Year: 1969
                  },

                  Favorites:
                  {
                    SingleMake:
                    {
                      Id: "pontiac",      
                      Make: "Pontiac",      
                      Color: "Black",          
                      Year: 1969
                    },
 
                    BestFavorites:
                    {
                      Makes:
                      [
                        {Id: "pontiac",      Make: "Pontiac",      Color: "Black",          Year: 1969},
                        {Id: "chevy",        Make: "Chevy",        Color: "Blue",           Year: 1970},
                        {Id: "buick",        Make: "Buick",        Color: "Green",          Year: 1985},
                        {Id: "audi",         Make: "Audi",         Color: "Red",            Year: 1973},
                        {Id: "studebaker",   Make: "Studebaker",   Color: "Black",          Year: 1954},
                        {Id: "astonmartin",  Make: "Aston Martin", Color: "Midnight Blue",  Year: 1964}
                      ]
                    }
                 },

                  Makes:
                  [
                    {Id: "pontiac",      Make: "Pontiac",      Color: "Black",          Year: 1969},
                    {Id: "chevy",        Make: "Chevy",        Color: "Blue",           Year: 1970},
                    {Id: "buick",        Make: "Buick",        Color: "Green",          Year: 1985},
                    {Id: "audi",         Make: "Audi",         Color: "Red",            Year: 1973},
                    {Id: "studebaker",   Make: "Studebaker",   Color: "Black",          Year: 1954},
                    {Id: "astonmartin",  Make: "Aston Martin", Color: "Midnight Blue",  Year: 1964}
                  ]
                };

    this.Test(54, model, function(test)
    {
      test.Assert($("#test54_test1 div").length == 1);
      test.AssertContent("#test54_test1 div",  "Black Pontiac 1969");
      
      test.Assert($("#test54_test2 div").length == 1);
      test.AssertContent("#test54_test2 div",  "Black Pontiac 1969");

      test.Assert($("#test54_test3 div").length == 1);
      test.AssertContent("#test54_test3 div",  "Black Pontiac 1969");
      
      test.Assert($("#test54_test4 div").length == 1);
      test.AssertContent("#test54_test4 div",  "Black Pontiac 1969");
      
      test.Assert($("#test54_test5 div").length == 6);
      test.AssertContent("#test54_test5 div:first-of-type",  "Black Pontiac 1969");
      test.AssertContent("#test54_test5 div:nth-of-type(2)",  "Blue Chevy 1970");
      test.AssertContent("#test54_test5 div:nth-of-type(6)",  "Midnight Blue Aston Martin 1964");

      test.Assert($("#test54_test6 div").length == 6);
      test.AssertContent("#test54_test6 div:first-of-type",  "Black Pontiac 1969");
      test.AssertContent("#test54_test6 div:nth-of-type(2)",  "Blue Chevy 1970");
      test.AssertContent("#test54_test6 div:nth-of-type(6)",  "Midnight Blue Aston Martin 1964");

    });
  }
 
  //***************************************************************************************
  this.Test55 = function()
  {    
    var model = {
                    GivenName: "Jenkins",      
                    Surname: "Moreno",      
                    SurnameFirst: false
                };

    this.Test(55, model, function(test)
    {
      test.AssertContent("#test55_test1",  "Jenkins Moreno's Birthday");
    });
  }
 
  //***************************************************************************************
  this.Test56 = function()
  {    
    var model = {
                  Favorite:
                  {
                    Daydex: 114
                  },

                  Events:
                  [
                    {
                      Name: "My Birthday",
                      Daydex: 41939
                    },
                    {
                      Name: "John's Birthday",
                      Daydex: 42584
                    },
                    {
                      Name: "Status Meeting",
                      Daydex: 45859
                    }
                  ]
                };

    this.Test(56, model, function(test)
    {
      test.Assert($("#test56_test1 ul li").length == 3);
      
      $("#test56_btn0").click();
      test.Assert(model.CurrentEvent && model.CurrentEvent.Name == "My Birthday");
      test.Assert(model.FavoriteDaydex && model.FavoriteDaydex == 114);
    });
  }
 
  //***************************************************************************************
  this.Test57 = function()
  {    
    var model = {
                  CurrentFavorite:  "Chevy",
                  Favorite:  "Aston Martin",

                  Make: "Audi",
                  Year: 1973,

                  Make3: "Audi",
                  Year3: 1973,
                };

    this.Test(57, model, function(test)
    {
      $("#test57_btn1").click();
      test.AssertContent("#test57_test1 > div", "Aston Martin");

      $("#test57_btn2").click();
      test.AssertContent("#test57_test2 > div", "1965 Pontiac");

      $("#test57_btn3").click();
      test.AssertContent("#test57_test3 > div", "1973 Audi");

    });
  }

  //***************************************************************************************
  this.Test58 = function()
  {    
    var model = {
                  CurrentFavorite:  "Chevy",
                  Favorite:  "Aston Martin",

                  Make: "Audi",
                  Year: 1973,

                  Make3: "Audi",
                  Year3: 1973,
                };

    this.Test(58, model, function(test)
    {
      $("#test58_btn1").click();
      test.AssertContent("#test58_test1 > div", "Aston Martin");

      $("#test58_btn2").click();
      test.AssertContent("#test58_test2 > div", "1965 Pontiac");

      $("#test58_btn3").click();
      test.AssertContent("#test58_test3 > div", "1973 Audi");

    });
  }

  //***************************************************************************************
  this.Test59 = function()
  {    
    var model = {
                  CurrentFavorite:  "Chevy",
                  CurrentSecondFavorite:  "Pontiac",
                  Favorite:  "Aston Martin",
                  SecondFavorite:  "Audi",

                  Make: "Audi",
                  Year: 1973,

                  Make3: "Audi",
                  Year3: 1973,
                };

    this.Test(59, model, function(test)
    {
      $("#test59_btn1").click();
      test.AssertContent("#test59_test1 > div:first-of-type", "Aston Martin");
      test.AssertContent("#test59_test1 > div:nth-of-type(2)", "Audi");

      $("#test59_btn2").click();
      test.AssertContent("#test59_test2 > div", "1965 Pontiac");

      $("#test59_btn3").click();
      test.AssertContent("#test59_test3 > div", "1973 Audi");

    });
  }

 //***************************************************************************************
  this.Test60 = function()
  {
    
    var model = {
      Name: "Fred",
      Age: 37,
      City: "San Diego"
    };

    this.Test(60, model, function(test)
    {
      test.Assert($("#Test60Text2").html() == "This guy Fred is 37 years old and lives in San Diego.");

      $("#btnDo60").click();

      test.Assert(model.Name == "John");
      test.Assert($("#Test60Text").html() == "John");
      test.Assert($("#Test60Text2").html() == "This guy John is 37 years old and lives in San Diego.");

      $("#btnDo602").click();

      test.Assert(model.Name == "Kyle" && model.Age == 28 && model.City == "Seattle");
      test.Assert($("#Test60Text2").html() == "This guy Kyle is 28 years old and lives in Seattle.");

    },
    true);
  }

  //***************************************************************************************
  this.Test61 = function()
  {    
    var model = {
                  GetParams: {CustomerName: "Kyle",
                              CarMake: "Audi",
                              CarModel: "S5",
                              CarYear: 2014},

                  PostResult:
                  {
                    Data:
                    {
                      Members: []
                    }
                  },

                  CurrentFavorite:  "Chevy",
                  Favorite:  "Aston Martin",

                  Make: "Audi",
                  Year: 1973,

                  Make3: "Audi",
                  Year3: 1973,
                };

    this.Test(61, model, function(test)
    {
      $("#test61_btn1").click();

      setTimeout( function()
      {
        test.Assert($("#test61_test1 li").length == 4);
        test.AssertContent("#test61_test1 li:first-of-type", "John");
        test.AssertContent("#test61_test1 li:nth-of-type(2)", "Fred");
        test.AssertContent("#test61_test1 li:nth-of-type(3)", "Melinda");
        test.AssertContent("#test61_test1 li:nth-of-type(4)", "Minh");
      
        test.AssertContent("#test61_test1 #result1", "Kyle");
        test.AssertContent("#test61_test1 #result2", "Audi");
        test.AssertContent("#test61_test1 #result3", "S5");
        test.AssertContent("#test61_test1 #result4", "2014");
        test.AssertContent("#test61_test1 #result5", "10101");
      }, 
      100);
    });
  }

  //***************************************************************************************
  this.Test62 = function()
  {    
    var model = {
                  CurrentFavorite:  "Chevy",
                  Favorite:  "Aston Martin",

                  Make: "Audi",
                  Year: 1973,

                  Make3: "Audi",
                  Year3: 1973,
                };

    this.Test(62, model, function(test)
    {
      test.AssertContent("#test62_test1 p", "Aston Martin");
      test.AssertContent("#test62_test2 p", "Audi");
    });
  }

  //***************************************************************************************
  this.Test63 = function()
  {    
    var model = {
                  Make3: "Audi",
                  Year3: 1973,
                };

    this.Test(63, model, function(test)
    {
    });
  }


  //***************************************************************************************
  this.Test64 = function()
  {    
    var model = {
                  Make3: "Audi",
                  Year3: 1973,
                };

    this.Test(64, model, function(test)
    {
      $("#test64_btn1").click();
      test.AssertContent("#test64_container", "Empty");
    });
  }

  //***************************************************************************************
  this.Test65 = function()
  {    
    var model = {
                  Errors: [],
                  Make3: "Audi",
                  Year3: 1973,
                };

    this.Test(65, model, function(test)
    {
      $("#test65_btn1").click();
    });
  }

  //***************************************************************************************
  this.Test66 = function()
  {    
    var model = {
                  Vehicles: [
                      {
                        Name: "Malibu",
                        Color: "Green",
                        Year: 1969
                      },
                      {
                        Name: "Corvette",
                        Color: "Red",
                        Year: 1965
                      },
                      {
                        Name: "Camaro",
                        Color: "Black",
                        Year: 1970
                      },
                      {
                        Name: "Silverado",
                        Color: "Blue",
                        Year: 2016
                      }
                    ]
                };

    this.Test(66, model, function(test)
    {
      test.AssertEqual($("#test66_panel1 div").length, 4);
      test.AssertContent("#test66_panel1 div:first-of-type", "1969 Green Malibu");
      test.AssertContent("#test66_panel1 div:nth-of-type(2)", "1965 Red Corvette");
      test.AssertContent("#test66_panel1 div:nth-of-type(3)", "1970 Black Camaro");
      test.AssertContent("#test66_panel1 div:nth-of-type(4)", "2016 Blue Silverado");

      model.Vehicles.push({
                        Name: "DB8",
                        Color: "Midnight Blue",
                        Year: 1967
                      });

      test.ViewModel.UpdateView();

      test.AssertEqual($("#test66_panel1 div").length, 5);
      test.AssertContent("#test66_panel1 div:first-of-type", "1969 Green Malibu");
      test.AssertContent("#test66_panel1 div:nth-of-type(2)", "1965 Red Corvette");
      test.AssertContent("#test66_panel1 div:nth-of-type(3)", "1970 Black Camaro");
      test.AssertContent("#test66_panel1 div:nth-of-type(4)", "2016 Blue Silverado");
      test.AssertContent("#test66_panel1 div:nth-of-type(5)", "1967 Midnight Blue DB8");

      
    });
  }

  //***************************************************************************************
  this.Test67 = function()
  {    
    var model = {
                  MaxVehicles: 3,
                  Vehicles: [
                      {
                        Name: "Malibu",
                        Color: "Green",
                        Year: 1969
                      },
                      {
                        Name: "Corvette",
                        Color: "Red",
                        Year: 1965
                      },
                      {
                        Name: "Camaro",
                        Color: "Black",
                        Year: 1970
                      },
                      {
                        Name: "Silverado",
                        Color: "Blue",
                        Year: 2016
                      }
                    ]
                };

    this.Test(67, model, function(test)
    {
      test.AssertEqual($("#test67_panel1 ul li").length, 3);
      test.AssertContent("#test67_panel1 ul li:first-of-type", "1969 Green Malibu");
      test.AssertContent("#test67_panel1 ul li:nth-of-type(2)", "1965 Red Corvette");
      test.AssertContent("#test67_panel1 ul li:nth-of-type(3)", "1970 Black Camaro");

      $("#test67_btn1").click();

      test.AssertEqual($("#test67_panel1 ul li").length, 4);
      test.AssertContent("#test67_panel1 ul li:first-of-type", "1969 Green Malibu");
      test.AssertContent("#test67_panel1 ul li:nth-of-type(2)", "1965 Red Corvette");
      test.AssertContent("#test67_panel1 ul li:nth-of-type(3)", "1970 Black Camaro");
      test.AssertContent("#test67_panel1 ul li:nth-of-type(4)", "2016 Blue Silverado");

    });
  }

  //***************************************************************************************
  this.Test68 = function()
  {    
    var model = {
                  MaxVehicles: 3,
                  Vehicles: [
                      {
                        Name: "Malibu",
                        Color: "Green",
                        Year: 1969
                      },
                      {
                        Name: "Corvette",
                        Color: "Red",
                        Year: 1965
                      },
                      {
                        Name: "Camaro",
                        Color: "Black",
                        Year: 1970
                      },
                      {
                        Name: "Silverado",
                        Color: "Blue",
                        Year: 2016
                      }
                    ]
                };

    this.Test(68, model, function(test)
    {
      test.AssertEqual($("#test68_panel1 ul li").length, 3);
      test.AssertContent("#test68_panel1 ul li:first-of-type", "1969 Green Malibu");
      test.AssertContent("#test68_panel1 ul li:nth-of-type(2)", "1965 Red Corvette");
      test.AssertContent("#test68_panel1 ul li:nth-of-type(3)", "1970 Black Camaro");

    });
  }

  //***************************************************************************************
  this.Test69 = function()
  {    
    var model = {
                  Caption: 'elena',
                  MaxVehicles: 3,
                  Vehicles: [
                      {
                        Name: "Malibu",
                        Color: "Green",
                        Year: 1969
                      },
                      {
                        Name: "Corvette",
                        Color: "Red",
                        Year: 1965
                      },
                      {
                        Name: "Camaro",
                        Color: "Black",
                        Year: 1970
                      },
                      {
                        Name: "Silverado",
                        Color: "Blue",
                        Year: 2016
                      }
                    ]
                };

    this.Test(69, model, function(test)
    {
      test.AssertEqual($("#test69_panel1 > div").length, 3);
      test.AssertContent("#test69_panel1 > div:first-of-type", "1969 Green Malibu");
      test.AssertContent("#test69_panel1 > div:nth-of-type(2)", "1965 Red Corvette");
      test.AssertContent("#test69_panel1 > div:nth-of-type(3)", "1970 Black Camaro");

      $("#test69_btn1").click();

      test.AssertEqual($("#test69_panel1 > div").length, 4);
      test.AssertContent("#test69_panel1 > div:first-of-type", "1969 Green Malibu");
      test.AssertContent("#test69_panel1 > div:nth-of-type(2)", "1965 Red Corvette");
      test.AssertContent("#test69_panel1 > div:nth-of-type(3)", "1970 Black Camaro");
      test.AssertContent("#test69_panel1 > div:nth-of-type(4)", "2016 Blue Silverado");
    });
  }

  //***************************************************************************************
  this.Test70 = function()
  {
    
    var model = {
      Make: "Chevy",
      Models:
      [
        {
          Name: "Malibu",
          Color: "Green",
          Year: 1969
        },
        {
          Name: "Corvette",
          Color: "Red",
          Year: 1965
        },
        {
          Name: "Camaro",
          Color: "Black",
          Year: 1970
        },
        {
          Name: "Silverado",
          Color: "Blue",
          Year: 2016
        }
      ]
    };

    this.Test(70, model, function(test)
    {
      test.AssertEqual($("#test70_inner > div:nth-of-type(2) > .car").length, 4);
      test.AssertContent("#test70_inner > div:nth-of-type(2) > div:nth-of-type(4) ~ button:first-of-type", "Add New Car");

      $("#btnTest70_1").click();

      test.AssertEqual($("#test70_inner > div:nth-of-type(2) > .car").length, 5);

      test.AssertContent("#test70_inner > div:nth-of-type(2) > div:nth-of-type(1) h4", "1969 Chevy Malibu");
      test.AssertContent("#test70_inner > div:nth-of-type(2) > div:nth-of-type(2) h4", "1965 Chevy Corvette");
      test.AssertContent("#test70_inner > div:nth-of-type(2) > div:nth-of-type(3) h4", "1970 Chevy Camaro");
      test.AssertContent("#test70_inner > div:nth-of-type(2) > div:nth-of-type(4) h4", "2016 Chevy Silverado");
      test.AssertContent("#test70_inner > div:nth-of-type(2) > div:nth-of-type(5) h4", "1967 Chevy Nova");

      test.AssertContent("#test70_inner > div:nth-of-type(2) > div:nth-of-type(5) ~ button:first-of-type", "Add New Car");

    });
  }
  
  //***************************************************************************************
  this.Test71 = function()
  {
    
    var model = {
      Make: "Chevy",
      Models:
      [
        {
          Name: "Malibu",
          Color: "Green",
          Year: 1969
        },
        {
          Name: "Corvette",
          Color: "Red",
          Year: 1965
        },
        {
          Name: "Camaro",
          Color: "Black",
          Year: 1971
        },
        {
          Name: "Silverado",
          Color: "Blue",
          Year: 2016
        }
      ]
    };

    this.Test(71, model, function(test)
    {
      test.AssertEqual($("#test71_inner > div:nth-of-type(2) > .car").length, 4);
      test.AssertContent("#test71_inner > div:nth-of-type(2) > div:nth-of-type(4) ~ button:first-of-type", "Add New Car");

      $("#btnTest71_1").click();

      test.AssertEqual($("#test71_inner > div:nth-of-type(2) > .car").length, 5);

      test.AssertContent("#test71_inner > div:nth-of-type(2) > div:nth-of-type(1) h4", "1969 Chevy Malibu");
      test.AssertContent("#test71_inner > div:nth-of-type(2) > div:nth-of-type(2) h4", "1965 Chevy Corvette");
      test.AssertContent("#test71_inner > div:nth-of-type(2) > div:nth-of-type(3) h4", "1971 Chevy Camaro");
      test.AssertContent("#test71_inner > div:nth-of-type(2) > div:nth-of-type(4) h4", "2016 Chevy Silverado");
      test.AssertContent("#test71_inner > div:nth-of-type(2) > div:nth-of-type(5) h4", "1967 Chevy Nova");

      test.AssertContent("#test71_inner > div:nth-of-type(2) > div:nth-of-type(5) ~ button:first-of-type", "Add New Car");

    });
  }
  
  //***************************************************************************************
  this.Test72 = function()
  {
    
    var model = {
      Make: "Chevy",
      Models:
      [
        {
          Name: "Corvette",
          Color: "Red",
          Year: 1965,
          Count: 0
        },
        {
          Name: "Camaro",
          Color: "Black",
          Year: 1971,
          Count: 0
        }
      ]
    };

    this.Test(72, model, function(test)
    {
      test.AssertContent("#test72_inner h1", "0");

      $("#Test72_btn0").click();
      $("#Test72_btn0").click();
      $("#Test72_btn0").click();
      $("#Test72_btn1").click();
      $("#Test72_btn1").click();

      test.AssertContent("#test72_inner h1", "5");
      test.AssertContent("#test72_inner > div:nth-of-type(2) > div:first-of-type p:nth-of-type(2)", "3");
      test.AssertContent("#test72_inner > div:nth-of-type(2) > div:nth-of-type(2) p:nth-of-type(2)", "2");

      test.Assert(!$("#test72_inner > div:nth-of-type(2) > div:first-of-type").hasClass("green"));
      $("#Test72_btn0").click();
      $("#Test72_btn0").click();
      test.Assert($("#test72_inner > div:nth-of-type(2) > div:first-of-type").hasClass("green"));
      $("#Test72_btn0").click();
      test.Assert(!$("#test72_inner > div:nth-of-type(2) > div:first-of-type").hasClass("green"));

    });
  }
  
}

/***************************************************************************************/
/***************************************************************************************/
$(document).ready(function()
{
  CheetahTests.Run();
});
