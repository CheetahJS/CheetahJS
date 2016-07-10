
var UnitTests = new function()
{
  this.Errors = [];

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
  this.ExpressionTest = function()
  {
    var vm   = new Cheetah.ViewModel("");
    var name = "Cheetah.Expression";
    var num  = 0;
    var ec = {
                Model:
                {
                  SomeNumber:  100,
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

    AssertExpression(this, "11 + -7",                                             4);
    AssertExpression(this, "100 / 10",                                            10);
    AssertExpression(this, "100 * 2",                                             200);
    AssertExpression(this, "(100 + 5) * 10",                                      1050);
    AssertExpression(this, "SomeNumber + 1",                                      101);
    AssertExpression(this, "SomeNumber2.Value + 10",                              110);
    AssertExpression(this, "(SomeNumber2.Value + 5) * 10",                        1050);
    AssertExpression(this, "$fred",                                               "bob");
    AssertExpression(this, "Cars.Favorite",                                       "Aston Martin");
    AssertExpression(this, "Events[0].Name",                                      "My Birthday");
    AssertExpression(this, "Events[0].Properties.GiftIdea",                       "Aston Martin DB9");
    AssertExpression(this, "Events[0].Properties.GiftIdeas[2]",                   "BMW Motorcycle");
    AssertExpression(this, "Events[0].Properties.GiftIdeas[$gift]",               "BMW Motorcycle");
    AssertExpression(this, "Events[0].Properties.GiftIdeas[$gift4[1]]",           "BMW Motorcycle");
    AssertExpression(this, "Events[0].Properties.GiftIdeas[$gift2.preferred]",    "Aston Martin DB9");
    AssertExpression(this, "Events[0].Properties.GiftIdeas[$gift3.preferred[1]]", "Aston Martin DB9");
    AssertExpression(this, "Events[0].Properties.GiftIdeas[$gift3.preferred[$gift2.preferred + (17 * $gift / (14 + 3)) - (20 / 10)]]", "Aston Martin DB9");

    /***************************************************************************************/
    function AssertExpression(self, txt, val)
    {  
      try
      {
        var expr = new Cheetah.Expression(vm, txt);
        var val2 = expr.Eval(ec);

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
                  "dymmy": 893
                },
                {
                  "dymmy": 456,
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
    this.Errors.push(err);
  }

  /***************************************************************************************/
  this.AssertEqual = function(v1, v2, name, num)
  {
    if(v1 != v2)
      this.Fail(name + "FormatTest (" + num + ") unit test failed!");
  }
}

/***************************************************************************************/
/***************************************************************************************/
$(document).ready(function() 
{
  UnitTests.IfAnyTest();
  UnitTests.ArrayPackTest();
  UnitTests.ExpressionTest();
  UnitTests.replaceAllTest();
  UnitTests.StringBuilderTest();
  UnitTests.InheritTest();
  UnitTests.FormatTest();
  UnitTests.DOMStringBuilderTest();

  if(UnitTests.Errors.length > 0)
    alert(UnitTests.Errors.join("\r\n"));
});
