
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
