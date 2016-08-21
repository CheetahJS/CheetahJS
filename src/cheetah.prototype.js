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
Array.prototype.ToDictionary = function(fn) 
{
  var dict = {};

  this.ForEach( function(item)
  {
    var key = fn(item);

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
    var newVal = fn(item);

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
Array.prototype.Where = function(fn, clone)
{
  if(clone == undefined)
    clone = true;

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
  if(clone == undefined)
    clone = true;

  var rtn = [];

  if(!ch.IsValidNumber(nItems))
    nItems = 1;

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
  if(!separator || this.indexOf(separator) == -1)
    return this;

  return this.substr(0, this.indexOf(separator));
}

/***************************************************************************************/
String.prototype.EndsWith = function(strSearch) 
{
    if(strSearch == undefined || strSearch == null)
      return(false);

    if(this == undefined || this == null)
      return(false);

    var thisLen = this.length;
    var srchLen = strSearch.length;

    if(thisLen < srchLen)
      return(false);

    return(this.lastIndexOf(strSearch) == (thisLen - srchLen));
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
