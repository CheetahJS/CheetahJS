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
var FadeInAnimation = new function()
{
  this.Name          = "fadein";
  this.AllowChildren = true;
  this.IsAnimation   = true;

  /***************************************************************************************/
  this.ProcessAttributes = function(attrList)
  {
    return InitAnimation(attrList);
  }

  /***************************************************************************************/
  this.Run = function(evt, target, vm, params, fnDone)
  {
    RunAnimation(evt, target, params, function($q)
    {
      $q.fadeIn(params.Speed, fnDone);
    });
  }

  Cheetah.RegisterActionStep(this);
}

/***************************************************************************************/
/***************************************************************************************/
var FadeOutAnimation = new function()
{
  this.Name          = "fadeout";
  this.AllowChildren = true;
  this.IsAnimation   = true;

  /***************************************************************************************/
  this.ProcessAttributes = function(attrList)
  {
    return InitAnimation(attrList);
  }

  /***************************************************************************************/
  this.Run = function(evt, target, vm, params, fnDone)
  {
    RunAnimation(evt, target, params, function($q)
    {
      $q.fadeOut(params.Speed, fnDone);
    });
  }

  Cheetah.RegisterActionStep(this);
}

/***************************************************************************************/
/***************************************************************************************/
var SlideDownAnimation = new function()
{
  this.Name          = "slidedown";
  this.AllowChildren = true;
  this.IsAnimation   = true;

  /***************************************************************************************/
  this.ProcessAttributes = function(attrList)
  {
    return InitAnimation(attrList);
  }

  /***************************************************************************************/
  this.Run = function(evt, target, vm, params, fnDone)
  {
    RunAnimation(evt, target, params, function($q)
    {
      $q.slideDown(params.Speed, fnDone);
    });
  }

  Cheetah.RegisterActionStep(this);
}

/***************************************************************************************/
/***************************************************************************************/
var SlideUpAnimation = new function()
{
  this.Name          = "slideup";
  this.AllowChildren = true;
  this.IsAnimation   = true;

  /***************************************************************************************/
  this.ProcessAttributes = function(attrList)
  {
    return InitAnimation(attrList);
  }

  /***************************************************************************************/
  this.Run = function(evt, target, vm, params, fnDone)
  {
    RunAnimation(evt, target, params, function($q)
    {
      $q.slideUp(params.Speed, fnDone);
    });
  }

  Cheetah.RegisterActionStep(this);
}

/***************************************************************************************/
/***************************************************************************************/
var AnimateAnimation = new function()
{
  this.Name          = "animate";
  this.AllowChildren = true;
  this.IsAnimation   = true;

  /***************************************************************************************/
  this.ProcessAttributes = function(attrList)
  {
    var params = InitAnimation(attrList);

    params.Options = {};

    attrList.ForEach( function(attr)
    {
      if(attr.localName != "select" && attr.localName != "speed" && attr.localName != "if")
        params.Options[attr.localName] = attr.value;
    });

    return params;
  }

  /***************************************************************************************/
  this.Run = function(evt, target, vm, params, fnDone)
  {
    RunAnimation(evt, target, params, function($q)
    {
      $q.animate(params.Options, params.Speed, fnDone);
    });
  }

  Cheetah.RegisterActionStep(this);
}

/***************************************************************************************/
/***************************************************************************************/
function InitAnimation(attrList)
{
  return  {
            Speed:  ch.FindValue(attrList, "speed", "fast"),
            Select: ch.FindValue(attrList, "select")
          };
}

/***************************************************************************************/
/***************************************************************************************/
function RunAnimation(evt, target, params, fn)
{
  var $q = null;

  if(!ch.IsEmpty(params.Select))
    $q = ch.SelectTarget(evt, params.Select);
  else if(ch.IsValid(target))
    $q = $(target);
  else if(evt)
    $q = $(ch.EventTarget(evt));

  if($q)
    fn($q);
}

}(Cheetah, document);

