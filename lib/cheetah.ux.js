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

/***************************************************************************************/
var chTableTransform = new function()
{
  this.Name = "cx-table";
  this.NewName = "table";
  this.AllowedChildren = "cx-tbody,cx-thead,cx-tfoot,cx-tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var chTableBodyTransform = new function()
{
  this.Name = "cx-tbody";
  this.NewName = "tbody";
  this.RequiredParent = "cx-table";
  this.AllowedChildren = "cx-tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var chTableHeaderTransform = new function()
{
  this.Name = "cx-thead";
  this.NewName = "thead";
  this.RequiredParent = "cx-table";
  this.AllowedChildren = "cx-tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var chTableFooterTransform = new function()
{
  this.Name = "cx-tfoot";
  this.NewName = "tfoot";
  this.RequiredParent = "cx-table";
  this.AllowedChildren = "cx-tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var chTableRowTransform = new function()
{
  this.Name = "cx-tr";
  this.NewName = "tr";
  this.RequiredParent = "cx-tbody,cx-thead,cx-tfoot,cx-table";
  this.AllowedChildren = "cx-td,cx-th";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var chTableCellTransform = new function()
{
  this.Name = "cx-td";
  this.NewName = "td";
  this.RequiredParent = "cx-tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var chTableHeaderCellTransform = new function()
{
  this.Name = "cx-th";
  this.NewName = "th";
  this.RequiredParent = "cx-tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var chSelectTransform = new function()
{
  Cheetah.Transform.call(this);

  this.Name = "cx-select";
  this.NewName = "select";
  this.IsEditable = true;

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var chOptionTransform = new function()
{
  this.Name = "cx-option";
  this.NewName = "option";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var TableTransform = new function()
{
  this.Name = "cx:table";
  this.NewName = "table";
  this.AllowedChildren = "cx:tbody,cx:thead,cx:tfoot,cx:tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var TableBodyTransform = new function()
{
  this.Name = "cx:tbody";
  this.NewName = "tbody";
  this.RequiredParent = "cx:table";
  this.AllowedChildren = "cx:tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var TableHeaderTransform = new function()
{
  this.Name = "cx:thead";
  this.NewName = "thead";
  this.RequiredParent = "cx:table";
  this.AllowedChildren = "cx:tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var TableFooterTransform = new function()
{
  this.Name = "cx:tfoot";
  this.NewName = "tfoot";
  this.RequiredParent = "cx:table";
  this.AllowedChildren = "cx:tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var TableRowTransform = new function()
{
  this.Name = "cx:tr";
  this.NewName = "tr";
  this.RequiredParent = "cx:tbody,cx:thead,cx:tfoot,cx:table";
  this.AllowedChildren = "cx:td,cx:th";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var TableCellTransform = new function()
{
  this.Name = "cx:td";
  this.NewName = "td";
  this.RequiredParent = "cx:tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var TableHeaderCellTransform = new function()
{
  this.Name = "cx:th";
  this.NewName = "th";
  this.RequiredParent = "cx:tr";

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var SelectTransform = new function()
{
  Cheetah.Transform.call(this);

  this.Name = "cx:select";
  this.NewName = "select";
  this.IsEditable = true;

  Cheetah.RegisterTransform(this);
}

/***************************************************************************************/
var OptionTransform = new function()
{
  this.Name = "cx:option";
  this.NewName = "option";

  Cheetah.RegisterTransform(this);
}

