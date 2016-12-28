"use strict";

/***************************************************************************************/
/** Cheetah Utility Library                                                           **/
/***************************************************************************************/
var ch = new function ()
{
  /*****************************************************************************/
  var LogError = function(msg)
  {
    if(Cheetah && Cheetah.Logger)
      Cheetah.Logger.Error(msg);
    else
      console.error(msg);
  }

  /*****************************************************************************/
  this.GetBindData = function (bind, bindProp)
  {
    if(typeof bind != "string")
      return bind;

    var aParts = bind.split(".");

    for (var i = 0; i < aParts.length; ++i)
    {
      var part = aParts[i];

      if (part.indexOf("[") == 0)
        bindProp = bindProp[Number(part.substr(1))];
      else
        bindProp = bindProp[part];
    }

    return (bindProp);
  }

  /*****************************************************************************/
  this.UrlRoot = function (url)
  { 
    if(!url)
      url = document.location.toString();

    var lhi = url.indexOf("://localhost/");

    if(lhi != -1)
    {
      var sepIndex = url.indexOf("/", lhi + "://localhost/".length);

      if(sepIndex == -1)
        return url + "/";

      return url.substring(0, sepIndex) + "/";
    }

    var appNameIndex = url.indexOf("/", url.indexOf("://") + 3);

    if(appNameIndex == -1)
      return url + "/";

    return url.substring(0, appNameIndex) + "/";
  }

  /*****************************************************************************/
  this.GetModelValue = function (model, property, varContainer)
  {
    var aParts = property; // Assume "property" is already a list of parts first

    // And if it's a string instead split it into a list of parts
    if(typeof property == "string")
      aParts = property.split(".");

    var n = aParts.length;

    if(n == 0)
      return model;

    var firstPart = aParts[0];

    // If starting with a variable
    if(firstPart.indexOf("$") == 0 && firstPart.indexOf("$$") == -1)
    {
      if(!varContainer)
      {
        LogError("Found variable in expression but no variable container was passed.");
        return null;
      }

      var val = varContainer.GetVar(firstPart.substr(1));

      if(!val)
      {
        LogError("Variable container does not contain variable in expression.");
        return null;
      }

      if(firstPart == "$bind" && typeof val == "string")
        val = model[val];

      if(n == 1)
        return val;

      return this.GetModelValue(val, aParts.slice(1));
    }

    --n;

    for (var i = 0; i < n; ++i)
    {
      var part = aParts[i];

      if(part == "$$root" && i == 0)
      {
        var z = 0;

        while(model.$$parent)
        {
          model = model.$$parent;

          if(++z == 1000)
          {
            LogError("Infinite recursion in model");
            break;
          }
        }
      }
      else if (part.indexOf("[") == 0)
        model = model[Number(part.substr(1))];
      else if (part == "$$parent")
      {
        if (!model.$$parent)
        {
          LogError("$$parent is not valid");
          return null;
        }

        model = model.$$parent;
      }
      else
        model = model[part];

      if(!model)
        return model;
    }

    var part = aParts[n];

    if(part.indexOf("[") == 0)
        return !model ? model : model[Number(part.substr(1))];

    return !model ? model : model[part];
  }

  /*****************************************************************************/
  this.SetModelValue = function (model, property, val)
  {
    var aParts = property;

    if(typeof property == "string")
      aParts = property.split(".");

    var n = aParts.length - 1;

    for(var i = 0; i < n; ++i)
    {
      var part = aParts[i];

      if(part == "$$root" && i == 0)
      {
        var z = 0;

        while(model.$$parent)
        {
          model = model.$$parent;

          if(++z == 1000)
          {
            LogError("Infinite recursion in model");
            break;
          }
        }
      }
      else if(part == "$$parent")
      {
        if(!ch.IsValid(model.$$parent))
        {
          LogError("$$parent is not valid");
          return;
        }

        model = model.$$parent;
      }
      else
      {
        if(!model[part])
          model[part] = {};

        model = model[part];
      }
    }

    model[aParts[n]] = val;
  }

  /***************************************************************************************/
  this.ElementData = function (evt, name)
  {
    if(!evt)
      return null;

    if (evt.delegateTarget != undefined)
      evt = evt.delegateTarget;

    if (name == undefined)
      return ($(evt).data());

    return ($(evt).data(name));
  }

  /***************************************************************************************/
  this.EventTarget = function (evt)
  {
    if(!evt)
      return null;

    if (evt.delegateTarget) // jQuery only prop
      return (evt.delegateTarget);

    return (evt.target);
  }

  /***************************************************************************************/
  this.SelectTarget = function (evt, sel)
  {
    var target = ch.EventTarget(evt);

    if(!ch.IsEmpty(sel))
    {
      var relative = false;

      while(sel.length > 0)
      {
        if(sel.indexOf("$self") == 0)
        {
          relative = true;
          sel = sel.substr(5);

          if(sel.indexOf(".") == 0)
            sel = sel.substr(1);
        }

        if(sel.indexOf("$parent") == 0)
        {
          relative = true;
          sel = sel.substr(7);
          target = target.parentElement;

          if(sel.indexOf(".") == 0)
            sel = sel.substr(1);

          continue;
        }

        break;
      }

      if(relative)
      {
        if(!ch.IsEmpty(sel))
          return $(target).find(sel);
      
        return $(target);
      }

      return $(sel);
    }

    return $(target);
  }

  /***************************************************************************************/
  this.IsValid = function (obj)
  {
    return (obj != undefined && obj != null)
  }

  /***************************************************************************************/
  this.CopyAttributes = function (element, attributes)
  {
    attributes.ForEach(function (attr)
    {
      element.setAttribute(attr.Name, attr.Value);
    });
  }

  /***************************************************************************************/
  this.Evaluate = function (expr, model, injected)
  {
    if(typeof expr == "string")
      return expr;
      
    if(expr.Evaluate)
      return expr.Evaluate(model, injected);

    return expr;
  }

  /***************************************************************************************/
  this.Format = function( /* fmt, val1, val2, etc... */)
  {
    var args = Array.prototype.slice.apply(arguments);
    var n    = args.length;

    if(n == 0)
      return "";

    var fmt = args[0];

    if(n > 1)
    {
      for(var i = 1; i < n; ++i)
        fmt = _Format(fmt, args[i], i-1);
    }

    return fmt;
  }

  /***************************************************************************************/
  function _Format(fmt, val, index)
  {
    return fmt.replace("{" + index + "}", val);
  }

  /***************************************************************************************/
  this.IsEmpty = function (obj)
  {
    if (!ch.IsValid(obj))
      return (true);

    if (typeof obj == "string")
      return ($.trim(obj).length == 0);

    if (obj.length != undefined)
      return (obj.length == 0);

    return false;
  }

  /***************************************************************************************/
  this.IsValidNumber = function (n)
  {
    return ch.IsValid(n) && !isNaN(n);
  }

  /***************************************************************************************/
  this.Sanitize = function(obj, firstLevelOnly)
  {
    if (!obj || typeof obj !== "object")
      return obj;

    if(obj.length != undefined)
    {
      obj.ForEach( function(item)
      {
        ch.Sanitize(item);
      });

      return;
    }

    for(var i in obj)
    {
      if(i.indexOf("$$") == 0)
        delete obj[i];
      else if(!firstLevelOnly)
        this.Sanitize(obj[i]);
    }

    return obj;
  }

  /***************************************************************************************/
  this.Merge = function (obj1, obj2)
  {  
    for(var key in obj2) 
      obj1[key] = ch.Clone(obj2[key]);

    return obj1;
  }

  /***************************************************************************************/
  this.Clear = function(obj)
  {
    for(var name in obj)
    {
      if(name.StartsWith("$$"))
      {
        delete obj[name];
        continue;
      }

      var objChild = obj[name];
    
      if(typeof objChild === "function")
        continue;

      if(typeof objChild === "object")
        ch.Clear(objChild);

      if(Array.isArray(objChild))
        objChild.Clear();

      delete obj[name];
    }

    return obj;
  }

  /***************************************************************************************/
  this.Copy = function(val1, val2)
  {
    ch.Clear(val1);

    for(var name in val2)
      if(name.indexOf("$$") == -1)
        val1[name] = val2[name];

    return val1;
  }

  /***************************************************************************************/
  this.Clone = function (val, shallow, normalize)
  {
    if (!val || typeof val !== "object")
      return val;

    if (shallow == undefined)
      shallow = false;

    if(val instanceof Date)
      return normalize ? val.toJSON() : (shallow ? val : new Date(val.getTime()));

    if(Array.isArray(val))
    {
      var aClone = [];

      for (var i = 0; i < val.length; ++i)
        aClone[i] = shallow ? val[i] : ch.Clone(val[i]);

      return aClone;
    }

    var oClone = {};

    for (var i in val)
      if (i.indexOf("$$") == -1)
        oClone[i] = shallow ? val[i] : ch.Clone(val[i]);

    return oClone;
  }

  /***************************************************************************************/
  this.ShallowClone = function (val)
  {
    return this.Clone(val, true);
  }

  /***************************************************************************************/
  this.Convert = function (val, type)
  {
    if (!val || val instanceof Date)
      return val;

    if (typeof val != "string" || val.length == 0)
      return val;

    if(type == "date")
      return new Date(val);

        val  = $.trim(val);
    var valc = val.toLowerCase();

    if (valc == "true")
      return true;

    if (valc == "false")
      return false;

    var n = parseFloat(val);

    if (!isNaN(n) && String(n) == val)
      return n;

    if (val.indexOf("\"") == 0 && val.lastIndexOf("\"") == val.length - 1)
      val = val.substr(1, val.length - 2);
    else if (val.indexOf("'") == 0 && val.lastIndexOf("'") == val.length - 1)
      val = val.substr(1, val.length - 2);

    return val;
  }

  /***************************************************************************************/
  this.IsNonZero = function (n)
  {
    return ch.IsValidNumber(n) && n != 0;
  }

  /***************************************************************************************/
  this.IsZero = function (n)
  {
    return !ch.IsValidNumber(n) || n == 0;
  }

  /***************************************************************************************/
  this.Coalesce = function (v1, v2, v3, v4)
  {
    return ch.IsValid(v1) ? v1 : (ch.IsValid(v2) ? v2 : (ch.IsValid(v3) ? v3 : v4));
  }

  /***************************************************************************************/
  this.Redirect = function (url)
  {
    document.location.href = url;
  }

  /***************************************************************************************/
  this.GetValue = function (elem)
  {
    var name = elem.localName;

    if (name == "select")
      return elem.options[elem.selectedIndex].value;

    return elem.value;
  }

  /***************************************************************************************/
  this.SetValue = function (elem, val)
  {
    if (elem.localName == "select")
    {
      var len = elem.options.length;

      for (var i = 0; i < len; ++i)
      {
        var optVal = elem.options[i].value;

        if (val == optVal)
        {
          elem.selectedIndex = i;
          break;
        }
      }
    }
    else
      elem.value = val;
  }

  /***************************************************************************************/
  this.Do = function(fn)
  {
    if(fn)
      fn();
  }

  /*****************************************************************************/
  this.ConvertedAttributeValue = function (element, name, defaultVal)
  {
    return ch.Convert(ch.AttributeValue(element, name, false, defaultVal));
  }

  /*****************************************************************************/
  this.AttributeValue = function (element, name, required, defaultVal)
  {
    if (!element)
      return null;

    if (element.attributes)
    {
      var attr = element.attributes[name];

      if((!attr || ch.IsEmpty(attr.value)))
      {
        if(required)
        {
          LogError("Missing '" + name + "' attribute for '" + element.localName + "' element");
          return null;
        }

        return defaultVal;
      }

      if(attr)
        return ($.trim(attr.value));
    }
    else if (element.length != undefined && !element.nodeName)
    {
      var found = element.FindMatching(function (attr) { return attr.Name == name; });

      if (found)
        return $.trim(found.Value);
    }

    return null;
  }

  /***************************************************************************************/
  this.NormalizeText = function (obj)
  {
    if(obj == undefined || obj == null)
      return "";

    return String(obj);
  }

  /*****************************************************************************/
  this.FindValue = function (aAttributes, name, defaultVal)
  {
    var found = aAttributes.FindMatching(function (item)
    {
      return (item.localName == name);
    });

    return found == null ? (defaultVal != undefined ? defaultVal : "") : found.value;
  }

  /*****************************************************************************/
  this.Sort = function (data, expr)
  {
    var attrs = expr.split(",");
    var n = attrs.length;
    var c = [];

    attrs.ForEach(function (item)
    {
      c.push(new Compare(item));
    });

    data.sort(function (a, b)
    {
      for (var i = 0; i < n; ++i)
      {
        var r = c[i].Run(a, b);

        if (r != 0)
          return r;
      }

      return 0;
    });

    /*****************************************************************************/
    function Compare(expr)
    {
      this.Attr = "";
      this.Asc = true;
      this.Num = false;

      {
        var parts = $.trim(expr).replaceAll("  ", " ").split(" ");

        this.Attr = parts[0];

        for (var i = 1; i <= 2; ++i)
        {
          if (parts.length > i)
          {
            if (parts[i] == "desc")
              this.Asc = false;
            else if (parts[i] == "number")
              this.Num = true;
          }
          else
            break;
        }
      }

      /*****************************************************************************/
      this.Run = function (a, b)
      {
        var val1 = a[this.Attr];
        var val2 = b[this.Attr];
        var less = this.Asc ? -1 : 1;
        var more = this.Asc ? 1 : -1;

        if (!ch.IsValid(val1) && !ch.IsValid(val2))
          return 0;

        if (!ch.IsValid(val1))
          return less;

        if (!ch.IsValid(val2))
          return more;

        if (this.Num)
        {
          val1 = Number(val1);
          val2 = Number(val2);
        }

        if (val1 == val2)
          return 0;

        return val1 < val2 ? less : more;
      }
    }
  }
}

