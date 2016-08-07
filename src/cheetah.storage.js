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
/*****************************************************************************/

! function(Cheetah, document) {

"use strict";

/***************************************************************************************/
/***************************************************************************************/
var SessionSetter = new function()
{
  InitSetter(this, "sessionsetter", Cheetah.Session);
}

/***************************************************************************************/
/***************************************************************************************/
var SessionGetter = new function()
{
  InitGetter(this, "sessiongetter", Cheetah.Session);
}

/***************************************************************************************/
/***************************************************************************************/
var StorageSetter = new function()
{
  InitSetter(this, "storagesetter", Cheetah.Storage);
}

/***************************************************************************************/
/***************************************************************************************/
var StorageGetter = new function()
{
  InitGetter(this, "storagegetter", Cheetah.Storage);
}


/***************************************************************************************/
/***************************************************************************************/
var CookieSetter = new function()
{
  InitSetter(this, "cookiesetter", Cheetah.Cookie);
}

/***************************************************************************************/
/***************************************************************************************/
var CookieGetter = new function()
{
  InitGetter(this, "cookiegetter", Cheetah.Cookie);
}

/***************************************************************************************/
/***************************************************************************************/
function InitSetter(self, name, storage)
{
  self.Name     = name;
  self._storage = storage;

  /***************************************************************************************/
  self.ProcessAttributes = function(attrList)
  {
    return  {
              Name:   ch.FindValue(attrList, "name"),
              Value:  ch.FindValue(attrList, "value")
            };
  }

  /***************************************************************************************/
  self.Run = function(evt, target, vm, params, fnDone)
  {
    self._storage.SetValue(params.Name, params.Value);
  }

  Cheetah.RegisterActionStep(self);
}

/***************************************************************************************/
/***************************************************************************************/
function InitGetter(self, name, storage)
{
  self.Name     = name;
  self._storage = storage;
  self.AllowChildren = true;

  /***************************************************************************************/
  self.ProcessAttributes = function(attrList)
  {
    var rtn = { Required: "none", OnlyOne: true, Items: [] };

    attrList.ForEach( function(attr)
    {
      switch(attr.localName)
      {
        case "name":
          rtn.Items.push({ Name: attr.value, Type: "string"});
          break;

        case "required":
          rtn.Required = attr.value;
          break;

        default:
          rtn.OnlyOne = false;
          rtn.Items.push({ Name: attr.localName.toLowerCase(), Type: attr.value.toLowerCase()});
          break;
      }
    });

    return rtn;
  }

  /***************************************************************************************/
  self.Run = function(evt, target, vm, params, fnDone)
  {
    var nRetrieved = 0;
    var nRequired  = params.Required == "all" ? params.Items.length : 0;
    var required   = params.Required == "all" || params.Required == "none" ? null : params.Required.split(",");

    if(required)
      nRequired = required.length;

    if(!evt.$$result)
      evt.$$result = {};

    params.Items.ForEach( function(itm)
    {
      var val = self._storage.GetValue(itm.Name);

      if(val)
      {
        ++nRetrieved;

        try
        {
          switch(itm.Type)
          {
           case "number": val = Number(val); break;
           case "date": val = new Date(val); break;
           default: break;
          }
        }
        catch(e)
        {
        }

        if(params.OnlyOne)
          evt.$$result = val;
        else
          evt.$$result[itm.Name] = val;
      }
    });


    if(fnDone && nRetrieved >= nRequired)
      fnDone();
  }

  Cheetah.RegisterActionStep(self);
}

}(Cheetah, document);

