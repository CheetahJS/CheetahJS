! function() {

"use strict";

/***************************************************************************************/
NodeList.prototype.ForEach = function(fn, stop) 
{
  return(_forEach(this, fn, stop));
}

/***************************************************************************************/
NamedNodeMap.prototype.ForEach = function(fn, stop) 
{
  return(_forEach(this, fn, stop));
}

/***************************************************************************************/
Array.prototype.ForEach = function(fn, stop) 
{
  return(_forEach(this, fn, stop));
}

/***************************************************************************************/
Array.prototype.OrderBy = function(fieldName, ascending, type) 
{
  if(fieldName)
  {
    if(typeof fieldName != "string" && type == undefined)
    {
      type = ascending;
      ascending = fieldName;
      fieldName = null;
    }

    var compare = (ascending == undefined || ascending) ? 1 : -1;

    this.sort( function(obj1, obj2)
    {
      var val1 = ch.Convert(fieldName ? obj1[fieldName] : obj1, type);
      var val2 = ch.Convert(fieldName ? obj2[fieldName] : obj2, type);

      if(val1 == val2)
        return 0

      return val1 >= val2 ? compare : -compare;
    });
  }

  return this;
}

/***************************************************************************************/
Array.prototype.ToDictionary = function(fn) 
{
  var dict = {};

  this.ForEach( function(item)
  {
    var key = fn ? fn(item) : item;

    dict[key] = item;
  });

  return(dict);
}

/***************************************************************************************/
Array.prototype.Reduce = function(fn, init) 
{
  var val = init;
  var len = this.length;

  for(var i = 0; i < len; ++i)
    val = fn(val, this[i]);

  return val;
}

/***************************************************************************************/
Array.prototype.Sum = function(fn) 
{
  if(this.length == 0)
    return 0;

  return this.Reduce( function(val, item) 
                      { 
                        var newVal = Number(fn ? fn(item) : item);

                        if(ch.IsValidNumber(newVal))
                          return val + newVal; 

                        return val;
                      }, 
                      0);
}

/***************************************************************************************/
Array.prototype.Min = function(fn) 
{
  if(this.length == 0)
    return undefined;

  var min = undefined;

  this.ForEach(  function(item)
                 {
                    var val = fn ? fn(item) : Number(item);

                    if(val)
                      min = min == undefined ? val : Math.min(min, val);
                 });

  return min;
}

/***************************************************************************************/
Array.prototype.Max = function(fn) 
{
  if(this.length == 0)
    return undefined;

  var max = undefined;

  this.ForEach(  function(item)
                 {
                    var val = fn ? fn(item) : Number(item);

                    if(val)
                      max = max == undefined ? val : Math.max(max, val);
                 });

  return max;
}

/***************************************************************************************/
Array.prototype.Mean = function(fn) 
{
  if(this.length == 0)
    return undefined;

  var max = undefined;
  var min = undefined;

  this.ForEach(  function(item)
                 {
                    var val = fn ? fn(item) : Number(item);

                    if(val)
                    {
                      max = !max ? val : Math.max(max, val);
                      min = !min ? val : Math.min(min, val);
                    }
                 });

  return (max + min) / 2;
}

/***************************************************************************************/
Array.prototype.Average = function(fn) 
{
  var sum = this.Sum(fn);

  return sum / this.length;
}

/***************************************************************************************/
Array.prototype.PercentageOfTotal = function(val, fn) 
{
  if(!val)
    return 0;

  var sum = this.Sum(fn);

  if(!sum)
    return 0;

  return (val / sum) * 100;
}

/***************************************************************************************/
function ToDate(val)
{
  if(!val)
    return val;

  if(val instanceof Date)
    return val;

  val = new Date(val);

  if(isNaN(val.getTime()))
    return null;

  return val;
}

/***************************************************************************************/
Array.prototype.MinDate = function(fn) 
{
  if(this.length == 0)
    return undefined;

  var min = undefined;

  this.ForEach(  function(item)
                 {
                    var val = ToDate(fn ? fn(item) : item);

                    if(val)
                      min = !min ? val : (min < val ? min : val)
                 });

  return min;
}

/***************************************************************************************/
Array.prototype.MaxDate = function(fn) 
{
  if(this.length == 0)
    return undefined;

  var max = undefined;

  this.ForEach(  function(item)
                 {
                    var val = ToDate(fn ? fn(item) : item);

                    if(val)
                      max = !max ? val : (max > val ? max : val)
                 });

  return max;
}

/***************************************************************************************/
Array.prototype.MeanDate = function(fn) 
{
  if(this.length == 0)
    return undefined;

  var max = undefined;
  var min = undefined;

  this.ForEach(  function(item)
                 {
                    var val = ToDate(fn ? fn(item) : item);

                    if(val)
                    {
                      max = !max ? val : (max > val ? max : val)
                      min = !min ? val : (min < val ? min : val)
                    }
                 });

  return new Date((max.getTime() + min.getTime()) / 2);
}

/***************************************************************************************/
Array.prototype.Update = function(fn) 
{
  this.ForEach(fn);

  return this;
}

/***************************************************************************************/
Array.prototype.ShallowCopy = function() 
{
  var list = [];
  var len = this.length;

  for(var i = 0; i < len; ++i)
    list.push(this[i]);

  return list;
}

/***************************************************************************************/
Array.prototype.peek = function() 
{
  if(this.length == 0)
    return null;

  return this[this.length-1];
}

/***************************************************************************************/
Array.prototype.Pack = function(sep, fn) 
{
  if(!ch.IsValid(fn))
    return(this.join(sep));

  return this.Reduce( function(val, item)
  {
    var newVal = fn ? fn(item) : item;

    if(val == "")
      return(newVal);

    return(val + sep + newVal);
  },
  "");
}

/***************************************************************************************/
Array.prototype.Append = function(list) 
{
  var n = list.length;

  for(var i = 0; i < n; ++i)
    this.push(list[i]);

  return this;
}

/***************************************************************************************/
Array.prototype.FindMatching = function(fn) 
{
  return _findMatching(this, fn);
}

/***************************************************************************************/
Array.prototype.CountWhere = function(fn)
{
  return _countWhere(this, fn);
}

/***************************************************************************************/
NodeList.prototype.CountWhere = function(fn)
{
  return _countWhere(this, fn);
}

/***************************************************************************************/
NodeList.prototype.Where = function(fn)
{
  var n   = this.length;
  var rtn = [];

  for(var i = 0; i < n; ++i)
  {
    var item = this[i];

    if(fn(item))
      rtn.push(item);
  }

  return rtn;
}

/***************************************************************************************/
Array.prototype.Clear = function()
{
  this.splice(0, this.length);
  return this;
}

/***************************************************************************************/
Array.prototype.Where = function(fn, clone)
{
  if(clone == undefined)
    clone = false;

  var n   = this.length;
  var rtn = [];

  for(var i = 0; i < n; ++i)
  {
    var item = this[i];

    if(fn(item))
    {
      if(clone)
        rtn.push(ch.Clone(item));
      else
        rtn.push(item);
    }
  }

  rtn.$$parent = this.$$parent;
  return(rtn);
}

/***************************************************************************************/
Array.prototype.First = function(nItems, clone)
{
  if(!ch.IsValidNumber(nItems))
    nItems = 1;

  var rtn = [];

  if(nItems >= this.length)
    rtn = this;
  else
  {
    if(clone == undefined)
      clone = false;

    var n = Math.min(this.length, nItems);

    for(var i = 0; i < n; ++i)
    {
      var item = this[i];

      if(clone)
        rtn.push(ch.Clone(item));
      else
        rtn.push(item);
    }

    rtn.$$parent = this.$$parent;
  }

  if(rtn.length == 1 && nItems == 1)
     return rtn[0];

  return(rtn);
}

/***************************************************************************************/
Array.prototype.Remove = function(fn) 
{
  for(var i = this.length-1; i >= 0; --i)
  {
    if(fn(this[i]))
      this.splice(i, 1);
  }

  return(this);
}

/***************************************************************************************/
Array.prototype.Add = function(obj, clone) 
{
  if(clone || clone == undefined)
    obj = ch.Clone(obj);

  this.push(obj);

  return(this);
}

/***************************************************************************************/
NodeList.prototype.FindMatching = function(fn) 
{
  return(_findMatching(this, fn));
}

/***************************************************************************************/
NamedNodeMap.prototype.FindMatching = function(fn) 
{
  return(_findMatching(this, fn));
}

/***************************************************************************************/
Array.prototype.IfAny = function(fn) 
{
  return _findMatching(this, fn) != null;
}

/***************************************************************************************/
Array.prototype.Contains = function(fn) 
{
  return _findMatching(this, fn) != null;
}

/***************************************************************************************/
Array.prototype.IfNotAny = function(fn) 
{
  var n = this.length;

  for(var i = 0; i < n; ++i)
  {
    if(!fn(this[i]))
      return(true);
  }

  return(false);
}

/***************************************************************************************/
Array.prototype.IfAll = function(fn) 
{
  return(!this.IfNotAny(fn));
}

/***************************************************************************************/
String.prototype.FirstInList = function(separator) 
{
  if(!separator)
    return this;

  var ndx = this.indexOf(separator);

  if(ndx == -1)
    return this;

  return this.substr(0, ndx).trim();
}

/***************************************************************************************/
String.prototype.IsInList = function(slist, separator) 
{
  if(!slist)
    return false;

  var list = slist.split(separator);  
  var self = this;

  return list.Contains( function(item)
  {
    return item == self;
  });
}

/***************************************************************************************/
String.prototype.Contains = function(val, caseSensitive) 
{
  if(!val)
    return false;

  if(caseSensitive)
    return this.indexOf(val) != -1;

  return this.toLowerCase().indexOf(val.toLowerCase()) != -1;
}

/***************************************************************************************/
String.prototype.NthInList = function(n, separator) 
{
  if(n == 0) 
    return this.FirstInList(separator);

  var list = this.split(separator);

  return list[n].trim();
}

/***************************************************************************************/
String.prototype.LeftPart = function(separator) 
{
  return this.FirstInList(separator);
}

/***************************************************************************************/
String.prototype.RightPart = function(separator) 
{
  if(!separator)
    return this;

  var ndx = this.lastIndexOf(separator);

  if(ndx == -1)
    return this;

  return this.substr(ndx + separator.length).trim();
}

/***************************************************************************************/
String.prototype.StartsWith = function(search) 
{
    if(!search)
      return false;

    return(this.indexOf(search) == 0);
}

/***************************************************************************************/
String.prototype.EndsWith = function(search) 
{
    if(!search)
      return false;

    var thisLen = this.length;
    var srchLen = search.length;

    if(thisLen < srchLen)
      return false;

    return this.lastIndexOf(search) == (thisLen - srchLen);
}

/***************************************************************************************/
String.prototype.EnsureEndsWith = function(strSearch) 
{
    if(this.EndsWith(strSearch))
      return(this);

    return(this + strSearch);
}

/***************************************************************************************/
String.prototype.replaceAll = function(s1, s2) 
{
  return this.replace(new RegExp(s1.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), s2);
};

/***************************************************************************************/
String.prototype.StripAfter = function(strFind) 
{
  var iIndex = this.indexOf(strFind);

  if(iIndex != -1)
    return(this.substr(0, iIndex+strFind.length));

  return(this);
}

/***************************************************************************************/
String.prototype.StripBefore = function(strFind) 
{
  var iIndex = this.indexOf(strFind);

  if(iIndex != -1)
    return(this.substr(iIndex));

  return(this);
}

/***************************************************************************************/
String.prototype.TrimBefore = function(strValue) 
{
  var iIndex = this.indexOf(strValue);

  if(iIndex > 0)
    return(this.substr(iIndex));

  return(this);
}

/***************************************************************************************/
String.prototype.TrimBeforeIncluding = function(strValue) 
{
  var iIndex = this.indexOf(strValue);

  if(iIndex > 0)
    return(this.substr(iIndex + strValue.length));

  return(this);
}

/***************************************************************************************/
String.prototype.TrimAfter = function(strValue) 
{
  var iIndex = this.indexOf(strValue);

  if(iIndex >= 0)
    return(this.substr(0, iIndex + strValue.length));

  return(this);
}

/***************************************************************************************/
String.prototype.TrimAfterIncluding = function(strValue) 
{
  var iIndex = this.indexOf(strValue);

  if(iIndex >= 0)
    return(this.substr(0, iIndex));

  return(this);
}

/***************************************************************************************/
/***************************************************************************************/
Number.prototype.PadLeft = function(nPlaces, char) 
{
  var val = String(this);

  if(!char)
    char = "0";

  while(val.length < nPlaces)
    val = char + val;

  return(val);
}

/***************************************************************************************/
/***************************************************************************************/
Date.prototype.DateOnly = function() 
{
  return new Date(this.getFullYear(), this.getMonth(), this.getDate());
}

/***************************************************************************************/
Date.prototype.AddDays = function(n) 
{
  var dt = new Date(this.getTime());

  dt.setDate(dt.getDate() + n);

  return dt;
}

/***************************************************************************************/
Date.prototype.AddHours = function(n) 
{
  var dt = new Date(this.getTime());

  dt.setHours(dt.getHours() + n);

  return dt;
}

/***************************************************************************************/
Date.prototype.AddMinutes = function(n) 
{
  var dt = new Date(this.getTime());

  dt.setMinutes(dt.getMinutes() + n);

  return dt;
}

/***************************************************************************************/
Date.prototype.WithinRange = function(dt1, dt2) 
{
  var dtThis = this.DateOnly();

  if(dtThis < dt1.DateOnly())
    return false;

  if(dtThis > dt2.DateOnly().AddDays(1))
    return false;

  return true;
}

/***************************************************************************************/
function _forEach(list, fn, stop) 
{
  if(stop == undefined)
    stop = false;

  var n = list.length;

  for(var i = 0; i < n; ++i)
  {
    var result = fn(list[i]);
    
    if(stop && !result)
      break;
  }

  return(n > 0);
}

/***************************************************************************************/
function _countWhere(list, fn)
{
  var n   = list.length;
  var rtn = 0

  for(var i = 0; i < n; ++i)
  {
    if(fn(list[i]))
      ++rtn;
  }

  return rtn;
}

/***************************************************************************************/
function _findMatching(list, fn) 
{
  var n = list.length;

  for(var i = 0; i < n; ++i)
  {
    var item = list[i];

    if(fn(item))
    {
      if(typeof item === "object")
        item.$matchingIndex = i;

      return(item);
    }
  }

  return(null);
}

/***************************************************************************************/
/* http://phrogz.net/JS/Classes/OOPinJS2.html                                          */
/*                                                                                     */
/*    To call base class method in function overload:                                  */
/*      this.parent.FunctionName.call(this, param1, param2, ...);                      */
/*                                                                                     */
/***************************************************************************************/
Function.prototype.inherits = function(parent)
{ 
	if(parent.constructor == Function) 
	{ 
		this.prototype             = new parent;
		this.prototype.constructor = this;
		this.prototype.parent      = parent.prototype;
	} 
	else 
	{ 
		this.prototype             = parent;
		this.prototype.constructor = this;
		this.prototype.parent      = parent;
	} 
	return this;
} 

}();
