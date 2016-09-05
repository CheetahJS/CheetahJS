
var UnitTests = new function()
{
  this.NumErrors = 0;

  /***************************************************************************************/
  this.IfAnyTest = function()
  {
    var data = [
                {Age: 32 },
                {Age: 21 },
                {Age: 48 },
                {Age: 73 },
                {Age: 16 },
                {Age: 2 }
               ];

    if(!data.IfAny( function(item) {return(item.Age > 70); } ))
      this.Fail("IFAnyTest unit test failed!");
      
    if(data.IfAny( function(item) {return(item.Age > 80); } ))
      this.Fail("IFAnyTest unit test failed!");
      
    if(!data.IfNotAny( function(item) {return(item.Age > 80); } ))
      this.Fail("IFAnyTest unit test failed!");
      
    if(!data.IfAll( function(item) {return(item.Age < 80); } ))
      this.Fail("IFAnyTest unit test failed!");      
  }

/***************************************************************************************/
/***************************************************************************************/
function UnitTestViewModel(div)
{
  Cheetah.ViewModel.call(this, div);

  this.FormatDate = function(dt, fmt, fmt2)
  {
    if(fmt2)
      return "fred";

    return "bob";
  }

  this.GetDateFormat = function(fmt)
  {
    return fmt;
  }

  this.AddAmount = function(amt1, amt2)
  {
    return amt1 + amt2;
  }

  this.Identity = function(val)
  {
    return val;
  }

  this.Empty = function(val)
  {
    return "";
  }

  this.TestLambdaExpression = function(fn)
  {
    return fn("fred", "wilma", "barney", "betty");
  }

  this.TestLambdaExpression2 = function(param1, fn)
  {
    return fn("fred", "wilma", "barney", "betty");
  }

  this.TestLambdaExpression4 = function(param1, param2, param3, fn)
  {
    return fn("fred", "wilma", "barney", "betty");
  }

  this.TestLambdaExpressionNoParams = function(param1, fn)
  {
    return fn();
  }

  this.TestLambdaExpressionOneParam = function(param1, fn)
  {
    return fn("john");
  }

  this.TestLambdaExpressionNotLastParam = function(param1, fn, param2)
  {
    return fn(param2);
  }

  this.TestLambdaExpressionNotLastParam2 = function(param1, fn, param2, param3)
  {
    return fn(param2, param3);
  }
}

  /***************************************************************************************/
  this.ExpressionTest = function()
  {
    var vm   = new UnitTestViewModel("");
    var name = "Cheetah.Expression";
    var num  = 0;
    var ec = {
                Model:
                {
                  SomeNumber:   100,
                  SomeNumber3:  2,
                  TrueValue:  true,
                  FalseValue:  false,
                  SomeNumber2:
                  {
                    Value: 100
                  },

                  Cars:
                  {
                    Favorite: "Aston Martin"
                  },

                  Events:
                  [
                    {
                      Name: "My Birthday",
                      Daydex: 41939,
                      Properties:
                      {
                        GiftIdea: "Aston Martin DB9",
                        GiftIdeas:
                        [
                          "Tablet",
                          "Aston Martin DB9",
                          "BMW Motorcycle"
                        ]
                      }
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
                },

                GetVar: function(name)
                {
                  if(name == "fred")
                    return("bob");

                  if(name == "gift")
                    return(2);

                  if(name == "gift2")
                    return({ preferred: 1});

                  if(name == "gift3")
                    return({ preferred: [ 0, 1, 2, 3]});

                  if(name == "gift4")
                    return([ 3, 2, 1, 0]);

                  return undefined;
                }

              };

    var ec2 = {
                Model:
                {
                  Name: "Fred",
                  MiddleName: "Vilhelm",
                  MaxVehicles: 3,
                  CarsIOwn: 20,
                  Years:
                  [
                    1942,
                    null,
                    "bob",
                    "1937",
                    1981,
                    "",
                    undefined,
                    "2011",
                    2000
                  ],
                  Dates:
                  [
                    "2015-04-04",
                    null,
                    new Date(2011, 8, 17),
                    "2007-04-04",
                    "1985-04-04",
                    "",
                    "fred",
                    undefined,
                    new Date(1958, 1, 1),
                    new Date(1961, 5, 5),
                  ],
                  Manufacturers:
                  [
                    ["GM", "Ford", "Chrysler"],
                    ["Toyota", "Nissan", "Suzuki", "Mazda", "Honda"],
                    ["BMW", "Audi", "Volkswagon"],
                    ["Fiat", "Ferrari"]
                  ],
                  Vehicles: [
                      {
                        Name: "Malibu",
                        Make: "Chevy",
                        Color: "Green",
                        Year: 1969,
                        Count: 50
                      },
                      {
                        Name: "Corvette",
                        Make: "Chevy",
                        Color: "Red",
                        Year: 1965,
                        Count: 50
                      },
                      {
                        Name: "Camaro",
                        Make: "Chevy",
                        Color: "Black",
                        Year: 1970,
                        Count: 50
                      },
                      {
                        Name: "Silverado",
                        Make: "Chevy",
                        Color: "Blue",
                        Year: 2016,
                        Count: 50
                      }
                    ]
                },

                GetVar: function(name)
                {
                  if(name == "make")
                    return("Chevy");

                  if(name == "vehicles")
                    return([
                      {
                        Name: "Malibu",
                        Make: "Chevy",
                        Color: "Green",
                        Year: 1969
                      },
                      {
                        Name: "Corvette",
                        Make: "Chevy",
                        Color: "Red",
                        Year: 1965
                      },
                      {
                        Name: "Camaro",
                        Make: "Chevy",
                        Color: "Black",
                        Year: 1970
                      },
                      {
                        Name: "Silverado",
                        Make: "Chevy",
                        Color: "Blue",
                        Year: 2016
                      }
                    ]);

                  if(name == "gift")
                    return(3);

                  if(name == "gift2")
                    return({ preferred: 1});

                  if(name == "gift3")
                    return({ preferred: [ 0, 1, 2, 3]});

                  if(name == "gift4")
                    return([ 3, 2, 1, 0]);

                  return undefined;
                }
              };

         var $$result = {
                         MakeMore: function(val)
                         {
                           return val+1;
                         },

                         MakeLess: function(val)
                         {
                           return val-1;
                         }
                      }

/*  1 */    AssertExpression(this, ec, "'bob and jane' + ' and ' + 'ted and wendy'",            "bob and jane and ted and wendy");
/*  2 */    AssertExpression(this, ec, "11 + -7",                                             4);
/*  3 */    AssertExpression(this, ec, "100 / 10",                                            10);
/*  4 */    AssertExpression(this, ec, "100 * 2",                                             200);
/*  5 */    AssertExpression(this, ec, "(100 + 5) * 10",                                      1050);
/*  6 */    AssertExpression(this, ec, "SomeNumber + 1",                                      101);
/*  7 */    AssertExpression(this, ec, "SomeNumber2.Value + 10",                              110);
/*  8 */    AssertExpression(this, ec, "(2) * 10",             20);
/*  9 */    AssertExpression(this, ec, "(SomeNumber2.Value + 5) * 10",                        1050);

/* 10 */    AssertExpression(this, ec, "(SomeNumber2.Value + 5) * ((10 + 1) - 1)",            1050);
/* 11 */    AssertExpression(this, ec, "$fred",                                               "bob");
/* 12 */    AssertExpression(this, ec, "!TrueValue",                                       false);
/* 13 */    AssertExpression(this, ec, "~SomeNumber3",                                       -3);
/* 14 */    AssertExpression(this, ec, "Cars.Favorite",                                       "Aston Martin");
/* 15 */    AssertExpression(this, ec2, "Manufacturers[0][0]",                                 "GM");
/* 16 */    AssertExpression(this, ec2, "Manufacturers[1][$gift]",                             "Mazda");
/* 17 */    AssertExpression(this, ec, "Events[0].Name",                                      "My Birthday");
/* 18 */    AssertExpression(this, ec, "Events[0].Properties.GiftIdea",                       "Aston Martin DB9");
/* 19 */    AssertExpression(this, ec, "Events[0].Properties.GiftIdeas[2]",                   "BMW Motorcycle");

/* 20 */    AssertExpression(this, ec, "Events[0].Properties.GiftIdeas[$gift]",               "BMW Motorcycle");
/* 21 */    AssertExpression(this, ec, "Events[0].Properties.GiftIdeas[$gift4[1]]",           "BMW Motorcycle");
/* 22 */    AssertExpression(this, ec, "Events[0].Properties.GiftIdeas[$gift2.preferred]",    "Aston Martin DB9");
/* 23 */    AssertExpression(this, ec, "Events[0].Properties.GiftIdeas[$gift3.preferred[1]]", "Aston Martin DB9");
/* 24 */    AssertExpression(this, ec, "Events[0].Properties.GiftIdeas[$gift3.preferred[$gift2.preferred + (17 * $gift / (14 + 3)) - (20 / 10)]]", "Aston Martin DB9");  
/* 25 */    AssertExpression(this, ec, "this.FormatDate(CurrentDate, 'M d, yy')", "bob");
/* 26 */    AssertExpression(this, ec, "this.FormatDate(CurrentDate, 'M d, yy', this.GetDateFormat('M d, yy'))", "fred");
/* 27 */    AssertExpression(this, ec2, "$$result.MakeMore($$result.MakeLess(MaxVehicles))", 3, {$$result: $$result});
/* 28 */    AssertExpression(this, ec2, "$$result.MakeMore($$result.MakeMore($$result.MakeLess(MaxVehicles)))", 4, {$$result: $$result});
/* 29 */    AssertExpression(this, ec2, "Name", "Fred");

/* 30 */    AssertExpression(this, ec2, "Years.Min()", 1937);
/* 31 */    AssertExpression(this, ec2, "Years.Max()", 2011);   
/* 32 */    AssertExpression(this, ec2, "Years.Sum()", 9871);
/* 33 */    AssertExpression(this, ec2, "Years.Mean()", 1974);
/* 34 */    AssertExpression(this, ec2, "Years.PercentageOfTotal(987.1)", 10);
/* 35 */    AssertExpression(this, ec2, "Math.floor(Years.Average())", 1096);
/* 36 */    AssertExpression(this, ec2, "Math.floor(Years.Mean())", 1974);
/* 37 */    AssertExpression(this, ec2, "Dates.MinDate().getFullYear()",  1958);
/* 38 */    AssertExpression(this, ec2, "Dates.MaxDate().getFullYear()",  2015);
/* 39 */    AssertExpression(this, ec2, "Dates.MeanDate().getFullYear()", 1986);

/* 40 */    AssertExpression(this, ec2, "Vehicles.PercentageOfTotal(20, v => v.Count)", 10);
/* 41 */    AssertExpression(this, ec2, "Vehicles.CountWhere( ()=> true)", 4);
/* 42 */    AssertExpression(this, ec2, "Vehicles.CountWhere(v => v.Year < 2000)", 3);
/* 43 */    AssertExpression(this, ec2, "Vehicles.CountWhere( (v) => v.Year < 2000)", 3);
/* 44 */    AssertExpression(this, ec2, "Vehicles.CountWhere(v => v.Year >= 2000)", 1);
/* 45 */    AssertExpression(this, ec2, "Vehicles.CountWhere(v => v.Make == $make)", 4);
/* 46 */    AssertExpression(this, ec2, "Vehicles.CountWhere(v => (v.Year < 2000))", 3);
/* 47 */    AssertExpression(this, ec2, "Vehicles.CountWhere(v => (v.Make == $make) and v.Year < 2000)", 3);
/* 48 */    AssertExpression(this, ec2, "Vehicles.CountWhere(v => ((v.Year < (((2000) - ($vehicles.CountWhere(x => x.Year < 2000))))) and ((v.Make == $make))))", 3);
/* 49 */    AssertExpression(this, ec2, "Vehicles.CountWhere( (v, w, x, y) => ((v.Year < (((2000) - ($vehicles.CountWhere(x => x.Year < 2000))))) and ((v.Make == $make))))", 3);

/* 50 */    AssertExpression(this, ec2, "Vehicles.CountWhere( (v, w, x, y) => ((v.Year < (((2000) - ($vehicles.CountWhere(x => x.Year < this.AddAmount(1500, 500)))))) and ((v.Make == $make))))", 3);
/* 51 */    AssertExpression(this, ec2, "this.AddAmount(100, Vehicles.CountWhere(v => v.Year < 2000))", 103);   
/* 52 */    AssertExpression(this, ec2, "Vehicles.CountWhere(v => this.AddAmount(100, v.Year) < 2000)", 0);
/* 53 */    AssertExpression(this, ec2, "Vehicles.CountWhere( (x, y, z) => this.AddAmount(MaxVehicles, x.Year) < 1970)", 1);
/* 54 */    AssertExpression(this, ec2, "this.TestLambdaExpression2(5, (v, w, x, y)=> (v + ' ' + w + ' ' + x + ' ' + y))", "fred wilma barney betty");
/* 55 */    AssertExpression(this, ec2, "this.TestLambdaExpression2(5, (v, w, x, y)=> this.Identity(Name + ' ' + MiddleName + ' ' + this.TestLambdaExpression( (a, b, c, d)=> y) + ' ' + x + ' ' + y))", "Fred Vilhelm betty barney betty");   
/* 56 */    AssertExpression(this, ec2, "this.TestLambdaExpressionNoParams(5, ()=> 'fred')", "fred");
/* 57 */    AssertExpression(this, ec2, "this.TestLambdaExpressionOneParam(5, n => n)", "john");
/* 58 */    AssertExpression(this, ec2, "this.TestLambdaExpressionOneParam(5, (n) => n)", "john");   
/* 59 */    AssertExpression(this, ec2, "this.TestLambdaExpressionNotLastParam(5, (n) => n, 'Jack')", "Jack");

/* 60 */    AssertExpression(this, ec2, "this.TestLambdaExpressionNotLastParam2(5, (n1, n2)=> (n1 + ' and ' + n2), 'Jack', 'Jill')", "Jack and Jill");
/* 61 */    AssertExpression(this, ec2, "this.TestLambdaExpression( (v, w, x, y)=> (v + ' ' + w + ' ' + x + ' ' + y))", "fred wilma barney betty");
/* 62 */    AssertExpression(this, ec2, "this.TestLambdaExpression( (v, w, x, y)=> this.Identity(Name + ' ' + MiddleName + ' ' + this.TestLambdaExpression( (a, b, c, d)=> y) + ' ' + x + ' ' + y))", "Fred Vilhelm betty barney betty");
/* 63 */    AssertExpression(this, ec2, "this.TestLambdaExpression( (v, w, x, y)=> this.Identity(Name + ' ' + this.TestLambdaExpression( (a, b, c, d)=> y + ' ' + MiddleName) + ' ' + x + ' ' + y))", "Fred betty Vilhelm barney betty");   
/* 64 */    AssertExpression(this, ec2, "Vehicles.Min( (v)=> v.Year)", 1965);
/* 65 */    AssertExpression(this, ec2, "Vehicles.Max( (v)=> v.Year)", 2016);
/* 66 */    AssertExpression(this, ec2, "Vehicles.Min( (v)=> --v.Year)", 1964);
/* 67 */    AssertExpression(this, ec2, "Vehicles.Min( (v)=> v.Year += 2)", 1966);
/* 68 */    AssertExpression(this, ec2, "Vehicles.Min( (v)=> v.Year++)", 1966);
/* 69 */    AssertExpression(this, ec2, "Vehicles.Min( (v)=> v.Year)", 1967);
/* 70 */    AssertExpression(this, ec2, "Vehicles.Min( (v)=> v.Year < 1970 ? v.Year-10 : v.Year)", 1957);

    //
    //
    //var expr = new Cheetah.Expression(vm, "Vehicles.Max( (v, w, x, y, z)=> v.Year + MaxVehicles)");
    //var expr2 = new Cheetah.Expression(vm, "Vehicles.Max( ()=> v.Year)");
    //
    //AssertExpression(this, ec2, "Dates.MeanDate().getFullYear()", 1986);
    
    /***************************************************************************************/
    function AssertExpression(self, ec, txt, val, injected)
    {  
      try
      {
        var expr = new Cheetah.Expression(vm, txt);
        var val2 = expr.Eval(ec, null, injected);

        self.AssertEqual(val, val2, "Cheetah.Expression", ++num);
      }
      catch(e)
      {
        self.Fail("Cheetah.Expression unit test #" + ++num + " failed: " + e.description);
      }
    }
  }

  /***************************************************************************************/
  this.replaceAllTest = function()
  {
    if("The cat looks like a cat".replaceAll("cat", "dog") != "The dog looks like a dog")
      this.Fail("String.replaceAll failed");

    if("The cat looks like a frog".replaceAll("cat", "dog") != "The dog looks like a frog")
      this.Fail("String.replaceAll failed");

    if("The cat + a dog is a freak".replaceAll("cat", "horse") != "The horse + a dog is a freak")
      this.Fail("String.replaceAll failed");

    if("Are + - + + you crazy?".replaceAll("crazy", "horse") != "Are + - + + you horse?")
      this.Fail("String.replaceAll failed");

    if("I have all these characters /([.*+?^=!:${}()|\[\]\/\\])//([.*+?^=!:${}()|\[\]\/\\])/ == something".replaceAll("{}()", "wow!") != "I have all these characters /([.*+?^=!:$wow!|\[\]\/\\])//([.*+?^=!:$wow!|\[\]\/\\])/ == something")
      this.Fail("String.replaceAll failed");
  }

  /***************************************************************************************/
  this.ArrayPackTest = function()
  {
    var data = [
                {
                  "Color": "red",
                  "dummy": 893
                },
                {
                  "dummy": 456,
                  "Name": "joe",
                  "Color": "green"
                },
                {
                  "Age": 99,
                  "Name": "fred",
                  "Color": "blue"
                }
                ];

    var result = data.Pack(", ", function(item) {return(item.Color); } );
    
    if(result != "red, green, blue")
      this.Fail("ArrayPackText unit test failed!");
  }

  /***************************************************************************************/
  this.StringBuilderTest = function()
  {
    var sb = new Cheetah.StringBuilder();

    sb.Append("red");
    sb.Append("green");
    sb.Append("blue");

    var result = sb.ToString(", ");
    
    if(result != "red, green, blue")
      this.Fail("StringBuilderTest unit test failed!");
  }

  /***************************************************************************************/
  this.FormatTest = function()
  {
    if(ch.Format("{0} is red", "red") != "red is red")
      this.Fail("FormatTest (1) unit test failed!");

    if(ch.Format("{0} is red and {1} is blue", "red", "blue") != "red is red and blue is blue")
      this.Fail("FormatTest (2) unit test failed!");

    if(ch.Format("{0} is red and {1} is blue and {2} is green", "red", "blue", "green") != "red is red and blue is blue and green is green")
      this.Fail("FormatTest (3) unit test failed!");

    if(ch.Format("{0} is red and {2} is blue and {1} is green", "red", "green", "blue") != "red is red and blue is blue and green is green")
      this.Fail("FormatTest (4) unit test failed!");
  }

  /***************************************************************************************/
  this.UrlTest = function()
  {  
     var index = 0;

    this.Assert(ch.UrlRoot("http://dev.cheetahjs.org/test/api/whatever"),   "http://dev.cheetahjs.org/",    "UrlTest", ++index);
    this.Assert(ch.UrlRoot("http://dev.cheetahjs.org"),                     "http://dev.cheetahjs.org/",    "UrlTest", ++index);
    this.Assert(ch.UrlRoot("http://dev.cheetahjs.org/"),                    "http://dev.cheetahjs.org/",    "UrlTest", ++index);
    this.Assert(ch.UrlRoot("http://localhost/cheetahjs/test/api/whatever"), "http://localhost/cheetahjs/",  "UrlTest", ++index);
    this.Assert(ch.UrlRoot("http://localhost/cheetahjs/test/api/whatever"), "http://localhost/cheetahjs/",  "UrlTest", ++index);
    this.Assert(ch.UrlRoot("http://localhost/cheetahjs/test/api/whatever"), "http://localhost/cheetahjs/",  "UrlTest", ++index);
    this.Assert(ch.UrlRoot("http://162.138.1.55/test/api/whatever"),        "http://162.138.1.55/",         "UrlTest", ++index);
    this.Assert(ch.UrlRoot("http://162.138.1.55/"),                         "http://162.138.1.55/",         "UrlTest", ++index);
    this.Assert(ch.UrlRoot("http://162.138.1.55"),                          "http://162.138.1.55/",         "UrlTest", ++index);
  }

  /***************************************************************************************/
  this.ArrayTest = function()
  {
    var vehicles = [
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
                    ];

     var index = 0;

    this.Assert(vehicles.Where( function(v)           {return v.Year < 2000; } ).length,           3,    "ArrayTest", ++index);
    this.Assert(vehicles.Where( function(v)           {return v.Year < 2000; } ).First(2).length,  2,    "ArrayTest", ++index);
    this.Assert(vehicles.Contains( function(v)        {return v.Name == "Silverado"; } ),          true, "ArrayTest", ++index);
    this.Assert(vehicles.First(2).Where( function(v)  {return v.Year > 2000; } ).length,           0,    "ArrayTest", ++index);
    this.Assert(vehicles.Remove( function(v)          {return v.Year < 2000; } ).length,           1,    "ArrayTest", ++index);
  }


  /***************************************************************************************/
  /***************************************************************************************/
  this.InheritTest = function()
  {
    /***************************************************************************************/
    function Vehicle(make)
    {
       this.Make = make;
       this.Year = 1969;
    }

    Vehicle.prototype.NumWheels = function()
    {
      return 0;
    }

    Vehicle.prototype.Attributes = function()
    {
      return {
                Make: this.Make,
                NumWheels: this.NumWheels(),
                Year: 1969
              };
    }

    /***************************************************************************************/
    function Car(make)
    {
       Vehicle.call(this, make);
    }

    Car.inherits(Vehicle);

    Car.prototype.NumWheels = function()
    {
      return 4;
    }

    /***************************************************************************************/
    function Chevy()
    {
       Car.call(this, "Chevy");
    }

    Chevy.inherits(Car);

    /***************************************************************************************/
    var camaro = new Chevy();
    var attr   = camaro.Attributes();

    if(attr.NumWheels != 4)
      this.Fail("InheritTest(1) unit test failed!");

    if(attr.Make != "Chevy")
      this.Fail("InheritTest(2) unit test failed!");

    if(attr.Year != 1969)
      this.Fail("InheritTest(3) unit test failed!");
  }

  /***************************************************************************************/
  this.DOMStringBuilderTest = function()
  {
    var sb = new Cheetah.DOMStringBuilder();

    sb.AppendChild(null, "div");

    sb.EndElement();

    this.AssertEqual("<div></div>", sb.ToString(), "DOMStringBuilderTest", 1);

    sb = new Cheetah.DOMStringBuilder();

    sb.AppendChild(null, "div");
      sb.AppendChild(null, "h3");
        sb.SetAttribute(null, "class", "blue");
        sb.AppendText(null, "Car Show");
      sb.EndElement();
    sb.EndElement();

    this.AssertEqual("<div><h3 class=\"blue\">Car Show</h3></div>", sb.ToString(), "DOMStringBuilderTest", 2);
    
    sb = new Cheetah.DOMStringBuilder();

    sb.AppendChild(null, "div");
      sb.AppendChild(null, "h3");
        sb.SetAttribute(null, "class", "blue");
        sb.SetAttribute(null, "href", "gothere");
        sb.AppendText(null, "Car Show");
      sb.EndElement();
      sb.AppendChild(null, "p");
        sb.AppendText(null, "It is a far better thing that I do know than I have ever done before.");
      sb.EndElement();
    sb.EndElement();

    this.AssertEqual("<div><h3 class=\"blue\" href=\"gothere\">Car Show</h3><p>It is a far better thing that I do know than I have ever done before.</p></div>", sb.ToString(), "DOMStringBuilderTest", 3);
  }

  /***************************************************************************************/
  this.Fail = function(err)
  {
    this.Output.Append("<div class='fail'>" + err + "</div>");
    ++this.NumErrors;
  }

  /***************************************************************************************/
  this.Assert = function(val1, val2, name, index)
  {    
    if(val1 != val2)
      this.Fail(name + " (" + index + ") unit test failed!");
  }

  /***************************************************************************************/
  this.AssertEqual = function(v1, v2, name, num)
  {
    if(v1 != v2)
      this.Fail(name + " (" + num + ") unit test failed!");
  }

  /***************************************************************************************/
  this.Run = function(sb)
  {
    this.Output = sb;
    this.NumErrors = 0;

    UnitTests.IfAnyTest();
    UnitTests.ArrayPackTest();
    UnitTests.ExpressionTest();
    UnitTests.replaceAllTest();
    UnitTests.StringBuilderTest();
    UnitTests.InheritTest();
    UnitTests.FormatTest();
    UnitTests.DOMStringBuilderTest();
    UnitTests.ArrayTest();
    UnitTests.UrlTest();

    return this.NumErrors;
  }
}
