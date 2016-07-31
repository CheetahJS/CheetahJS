﻿/*****************************************************************************/
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
var ServiceGet = new function()
{
  InitService(this, "serviceget", "GET");
}

/***************************************************************************************/
/***************************************************************************************/
var ServicePost = new function()
{
  InitService(this, "servicepost", "POST");
}

/***************************************************************************************/
/***************************************************************************************/
var ServicePut = new function()
{
  InitService(this, "serviceput", "PUT");
}

/***************************************************************************************/
/***************************************************************************************/
var ServiceDelete = new function()
{
  InitService(this, "servicedelete", "DELETE");
}

/***************************************************************************************/
/***************************************************************************************/
function InitService(self, name, verb)
{
  self.Name = name;
  self.Verb = verb;
  self.AllowChildren = true;

  /***************************************************************************************/
  self.ProcessAttributes = function(attrList)
  {
    var params = {};
    var nAttr = attrList.length;

    for(var i = 0; i < nAttr; ++i)
    {
      var attr = attrList[i];

      params[attr.name] = attr.value;  
    }

    return  params;
  }

  /***************************************************************************************/
  self.Run = function(evt, target, vm, params, fnDone)
  {
    var svc = vm.CreateService();
    var url = svc.NormalizeUrl(params.url);

    delete params.url;
    params = ch.Clone(params);

    if(params.params && typeof params.params === "object")
    {
      var params2 = ch.Clone(params.params);

      delete params.params;
      params = ch.Merge(params2, params);
    }

    svc.Query
    (
      url, 
      self.Verb, 
      params, 

      function(data)
      {
        evt.$$result = data;

        if(fnDone)
          fnDone();
      },

      function(err)
      {
      }
    );
  }

  Cheetah.RegisterActionStep(self);
}

}(Cheetah, document);

