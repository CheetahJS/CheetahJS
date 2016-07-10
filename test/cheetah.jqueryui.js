
var JQueryUI = JQueryUI || {};

/***************************************************************************************/
/***************************************************************************************/
JQueryUI.ViewModel = function(div)
{
  Cheetah.ViewModel.call(this, div);

  /***************************************************************************************/
  this.FormatDate = function(val, format)
  {
    if(typeof val === "string")
      val = new Date(val);

    if(format == undefined)
      format = "M d, yy";

    return($.datepicker.formatDate(format, val));
  }
}

/***************************************************************************************/
JQueryUI.NumberFieldTransform = new function()
{
  this.Name = "numberfield";
  this.NewName = "input";
  this.IsEditable = true;

  /*****************************************************************************/
  this.CreateInstance = function()
  {
    return new JQueryUI.NumberField();
  }

  /*****************************************************************************/
  this.GetValue = function(elem)
  {
    try
    {
      var val = $(elem).val();

      return(new Date(val));
    }
    catch(e)
    {
      Cheetah.Logger.Error(e.description);
    }
  }

  /*****************************************************************************/
  this.SetValue = function(elem, val)
  {
    try
    {
      var $dp = $(elem);
      var format = $dp.data("format");

      $dp.datepicker("setDate", val, format);
    }
    catch(e)
    {
      Cheetah.Logger.Error(e.description);
    }
  }

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
JQueryUI.NumberField = function()
{
  this.allowNegative = false;
  this.allowDecimal = false;

  /*****************************************************************************/
  this.TransformAttributes = function(attrlist)
  {
    attrlist.push(new Cheetah.Attribute("type", "text"));

    this.allowNegative = false;
    this.allowDecimal = false;

    var nAttr = attrlist.length;

    for(var i = nAttr-1; i >= 0; --i)
    {
      var attr = attrlist[i];

      if(attr.Name == "allow-negative")
      {
        this.allowNegative = attr.Value == "1" || attr.Value.toLowerCase() == "true";  
        attrlist.splice(i, 1);
      }
      else if(attr.Name == "allow-decimal")
      {
        this.allowDecimal = attr.Value == "1" || attr.Value.toLowerCase() == "true";   
        attrlist.splice(i, 1);
      }
    }
  }

  /*****************************************************************************/
  function CharCount(val, ch) 
  {
    var len = val.length;
    var nChars = 0;

    for(var i = 0; i < len; ++i) 
    {
      if(val.charAt(i) == ch)
        ++nChars;
    }
    return(nChars);
  }

  /*****************************************************************************/
  this.OnKeyPress = function(evt)
  {    
    var val  = $(ch.ElementTarget(evt)).val();
    var strFormat = this.GetFormat(winTextBox)
      
    if(strFormat == undefined || strFormat == null)
      strFormat = "";

    var strType       = StringList.First(strFormat, "_");        strFormat = StringList.RemoveFirst(strFormat, "_");
    var allowNegative = StringList.First(strFormat, "_") == "1"; strFormat = StringList.RemoveFirst(strFormat, "_");
    var allowDecimal  = strFormat == "1"; 

    if((event.keyCode == 13) || (event.keyCode >= 48 && event.keyCode <= 57))
      return(event.returnValue = true);

    if(event.keyCode == 45) 
      return(event.returnValue = (allowNegative && CharCount(val, '-') == 0));

    if(event.keyCode == 46) 
      return(event.returnValue = (allowDecimal && CharCount(val, '.') == 0));

    if(event.keyCode == 37 && strType == "percent") 
      return(event.returnValue = (CharCount(strValue, '%') == 0));

    return(event.returnValue = false);
  }

  /*****************************************************************************/
  this.OnPaste = function(elem)
  {    
  }

  /*****************************************************************************/
  this.OnRender = function(elem)
  {
    var self = this;

    $(elem).keypress(function(evt) {self.OnKeyPress(evt, params); });
    $(elem).on("paste", function(evt) {self.OnPaste(evt, params); });
  }

  /*****************************************************************************/
  this.OnBind = function(elem, bindExpr, onchange)
  {
    var self = this;

    $(elem).change( function(evt) 
    { 
      var dt = self.GetValue(ch.EventTarget(evt));

      onchange(dt);
    });
  }
}

/***************************************************************************************/
JQueryUI.DatePickerTransform = new function()
{
  this.Name = "datepicker";
  this.NewName = "input";
  this.IsEditable = true;

  /*****************************************************************************/
  this.CreateInstance = function()
  {
    return new JQueryUI.DatePicker();
  }

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
JQueryUI.DatePicker = function()
{
  this.params = {};

  /*****************************************************************************/
  this.TransformAttributes = function(attrlist)
  {
    attrlist.push(new Cheetah.Attribute("type", "text"));

    this.params.constrainInput = true;

    var nAttr = attrlist.length;

    for(var i = nAttr-1; i >= 0; --i)
    {
      var attr = attrlist[i];

      if(attr.Name == "format")
      {
        this.params.dateFormat = attr.Value;  
        attrlist.splice(i, 1);
        attrlist.push(new Cheetah.Attribute("data-format", attr.Value));
      }
    }
  }

  /*****************************************************************************/
  this.OnRender = function(elem)
  {
    $(elem).datepicker(this.params);
  }

  /*****************************************************************************/
  this.OnBind = function(elem, bindExpr, onchange)
  {
    var self = this;

    $(elem).change( function(evt) 
    { 
      var dt = self.GetValue(ch.EventTarget(evt));

      onchange(dt);
    });
  }

  /*****************************************************************************/
  this.GetValue = function(elem)
  {
    try
    {
      var val = $(elem).val();

      return(new Date(val));
    }
    catch(e)
    {
      Cheetah.Logger.Error(e.description);
    }
  }

  /*****************************************************************************/
  this.SetValue = function(elem, val)
  {
    try
    {
      var $dp = $(elem);
      var format = $dp.data("format");

      $dp.datepicker("setDate", val, format);
    }
    catch(e)
    {
      Cheetah.Logger.Error(e.description);
    }
  }
}

/***************************************************************************************/
JQueryUI.ChooserTransform = new function()
{
  this.Name = "chooser";
  this.IsEditable = false;
  this.UseTemplate = "Chooser";

  Cheetah.RegisterTransform(this);
}




