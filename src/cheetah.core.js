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

var Cheetah = Cheetah || {};

Cheetah.StartDelimiter = "//";
Cheetah.EndDelimiter   = "//";
Cheetah.Builder        = null;
Cheetah.Logger         = null;

! function(Cheetah, document) {

"use strict";

// Private globals
var _cheetah = {
                Templates:        {},
                Actions:          {},
                Prerequisites:    [],
                Transforms:       {},
                ActionSteps:      {},
                Priority:         { Default: 0, High: 100 }
               };  

/*****************************************************************************/
/*****************************************************************************/
Cheetah.ViewModel = function(div)
{
  this.Model     = null;
  this.ModelPath = "";
  this.ModelVerb = "GET";
  this.Template  = "";

  var _impl = new _cheetah.ViewModel(this, div);

  /*****************************************************************************/
  this.LoadRouteTable = function(name, callback, auto)
  {
    _impl.LoadRouteTable(name, callback, auto);
  }

  /*****************************************************************************/
  this.HaveRoutes = function()
  {
    return !ch.IsEmpty(_impl.Routes);
  }

  /*****************************************************************************/
  this.LoadModel = function(params, fnDone)
  {
    _impl.LoadModel(params, fnDone);
  }

  /*****************************************************************************/
  this.GetModel = function(params, fnDone)
  {
    _impl.GetModel(params, fnDone);
  }

  /*****************************************************************************/
  this.ProcessModel = function(model, fnDone)
  {
    _impl.ProcessModel(model, fnDone);
  }

  /*****************************************************************************/
  this.PreProcessModel = function()
  {
  }

  /*****************************************************************************/
  this.PostProcessModel = function(model)
  {
  }

  /*****************************************************************************/
  this.Sync = function(vm, twoway)
  {
    _impl.Sync(vm, twoway);
  }

  /*****************************************************************************/
  this.OnError = function(err)
  {
    alert(err);
  }

  /*****************************************************************************/
  this.OnInfo = function(msg)
  {
    alert(msg);
  }

  /*****************************************************************************/
  this.Confirm = function(msg, fn, title)
  {
    if(confirm(msg))
      fn();
  }

  /*****************************************************************************/
  this.CreateService = function()
  {
    return(new Cheetah.Service(""));
  }

  /*****************************************************************************/
  this.UpdateView = function()
  {
    _impl.UpdateView();
  }
}

/*****************************************************************************/
Cheetah.RegisterTransform = function(transform)
{ 
  if(ch.IsEmpty(transform.Name))
    Cheetah.Logger.Error("Transform missing name");
  else if(ch.IsEmpty(transform.NewName) && ch.IsEmpty(transform.UseTemplate) && ch.IsEmpty(transform.RequiredParent))
    Cheetah.Logger.Error("Transform missing new name");
  else if(_cheetah.Transforms[transform.Name])
    Cheetah.Logger.Error("A transform with the name of '" + transform.Name + "' has already been registered");
  else
    _cheetah.Transforms[transform.Name] = transform;
}

/*****************************************************************************/
Cheetah.RegisterActionStep = function(step)
{ 
  if(ch.IsEmpty(step.Name))
    Cheetah.Logger.Error("Custom action step missing name");
  else if(!step.Run)
    Cheetah.Logger.Error("Custom action step missing Run method");
  else if(_cheetah.ActionSteps[step.Name])
    Cheetah.Logger.Warning("A custom action step with the name of '" + step.Name + "' has already been registered");
  else
    _cheetah.ActionSteps[step.Name.toLowerCase()] = step;
}

/*****************************************************************************/
Cheetah.RegisterPrerequisite = function(pre)
{ 
  _cheetah.Prerequisites.push(pre);
}

/*****************************************************************************/
/*** Begin _cheetah.ViewModel                                              ***/
/*****************************************************************************/  

! function(_cheetah, document) {

"use strict";

_cheetah.ViewModel = function(vm, div)
{
  this.Conditions       = {};
  this.Expressions      = {};
  this.Routes           = null;
  this.FirstSubRoute    = null;
  this.Synced           = [];
  this.ActualViewModel  = vm;

  this.Container        = div;
  this.Deferred         = [];
  this.Async            = [];
  this.Watchers         = new _cheetah.WatcherList(this);
  this.TemplateNode     = null;

  this.ModelID          = 1;

  this.Updated          = false;
  this.SuppressUpdate   = false;

  /*****************************************************************************/
  // Constructor
  {
    var container = this.GetContainer(); 

    if(container)
    {
      this.ActualViewModel.Template  = Cheetah.Builder.InnerHTML(container);
      this.ActualViewModel.ModelPath = Cheetah.Builder.GetAttribute(container, "ch-model", true);
    }
  }
}

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.FixModel = function(model)
  {
    if(!model.$$id)
    {
      if(model.$$parent && model.$$path)
      {
        var parentModel = this.FixModel(model.$$parent);

        model = ch.GetModelValue(parentModel, model.$$path);
      }

      if(!model.$$id)
        model.$$Id = this.ModelID++;
    }

    return model;
  }
    
  /*****************************************************************************/
  _cheetah.ViewModel.prototype.GetContainer = function()
  {  
    return this.Container == "body" ? 
           Cheetah.Builder.FirstElementByName("body") : 
           Cheetah.Builder.FindElement(this.Container);
  }
  
  /*****************************************************************************/
  _cheetah.ViewModel.prototype.LoadModel = function(params, fnDone)
  {
    if(!ch.IsEmpty(this.ActualViewModel.ModelPath))
    {
      var self = this;

      this.GetModel(params,
                    function(data)
                    {
                      self.ProcessModel(data, fnDone);
                    }
                  );
      }
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.GetModel = function(params, fnDone)
  {
    var self = this;

    this.CreateService().LoadModel(this.ActualViewModel.ModelPath,
                                   this.ActualViewModel.ModelVerb,
                                   params,
                                   fnDone,
                                   function(err)
                                   {
                                     self.OnError(err);
                                   }
                                  );
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.ProcessModel = function(model, fnDone)
  {
    this.ActualViewModel.Model = model;

    this.PreProcessModel();
    model = this.ActualViewModel.Model;
    
    this.ReallyProcessModel(model, fnDone);
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.ReallyProcessModel = function(model, fnDone)
  {
    if(!CheckPrerequisites())
    {
      var self = this;

      setTimeout( function()
      {
        self.ReallyProcessModel(model, fnDone);
      }, 
      10);
      return;
    }

    this.ModelID = 1;

    var wContainer = this.GetContainer();

    if(wContainer != null)
    {
      var display = wContainer.style.display;

      Cheetah.Builder.ShowElement(wContainer, false);
      Cheetah.Builder.InnerHTML(wContainer, "");

      var templateNode = this.CreateTempNode();  

      Cheetah.Builder.InnerHTML(templateNode, this.ActualViewModel.Template);

      this.Watchers  = new _cheetah.WatcherList(this);
      this.Deferred  = [];
      this.Async     = [];

      this.RenderModel(templateNode, wContainer, this.ActualViewModel.Model);

      Cheetah.Builder.RemoveFromParent(templateNode);
      wContainer.style.display = (display == "none" || display == "") ? "block" : display;

      if(this.TemplateNode)
        Cheetah.Builder.RemoveFromParent(this.TemplateNode);
  
      this.ProcessDeferred();
      this.ProcessAsync(model, fnDone);
    }
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.CreateTempNode = function()
  {
    var node = Cheetah.Builder.AppendChild(Cheetah.Builder.FirstElementByName("body"), "div");
    
    Cheetah.Builder.ShowElement(node, false);

    return node;
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.CreateTemplate = function(html)
  {  
    if(!this.TemplateNode)
      this.TemplateNode = this.CreateTempNode();

    var templateNode = Cheetah.Builder.AppendChild(this.TemplateNode, "div");

    Cheetah.Builder.InnerHTML(templateNode, html);

    return templateNode;

   // return new _cheetah.Template(this, templateNode);

  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.ProcessDeferred = function()
  {
    this.Deferred.ForEach( function(fn)
    {
      ch.Do(fn);
    });

    this.Deferred = [];
  } 

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.ProcessAsync = function(model, fnDone)
  {
    if(!ch.IsEmpty(this.Async))
    {
      var self = this;

      setTimeout( function()
      {
        self.Async.ForEach( function(fn)
        {
          ch.Do(fn);
        });

        self.Async = [];
        self.ProcessAsync(model, fnDone);
      }, 
      20);
    }
    else
    {
      this.PostProcessModel(model);

      if(fnDone)
        fnDone(model);
    }
  }  

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.RenderModel = function(templateNode, wContainer, model)
  {
    model.$$parent = null;

    var ec = new _cheetah.DOMElement(this, null, templateNode, model);

    ec.NewElement = wContainer;

    ec.Render(templateNode, model);
    ec.PostProcess();

    return;
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.LoadRouteTable = function(name, callback, auto)
  {
    var self = this;

    this.CreateService().Get( name, function(data)
    {
      data.Routes.ForEach( function(route)
      {
        var r = new _cheetah.Route(self, route, ch.Coalesce(data.Defaults, {}));
      
        if(!ch.IsValid(self.Routes))
          self.Routes = {};

        self.Routes[route.Name] = r;

        if(self.FirstSubRoute == null)
          self.FirstSubRoute = r;
      });

      ch.Do(callback);

      if(auto && self.FirstSubRoute)
        self.FirstSubRoute.Run(null, true);
    });
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.RunRoute = function(name, callback, runFirstSubRoute)
  {
    var route = this.Routes[name];

    if(ch.IsValid(route))
      route.Run(callback, runFirstSubRoute);
  }  
  
  /*****************************************************************************/
  _cheetah.ViewModel.prototype.PreProcessModel = function()
  {
    this.ActualViewModel.PreProcessModel();
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.PostProcessModel = function(model)
  {
    this.ActualViewModel.PostProcessModel(model);
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.OnError = function(err)
  {
    this.ActualViewModel.OnError(err);
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.OnInfo = function(msg)
  {
    this.ActualViewModel.OnInfo(msg);
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.Confirm = function(msg, fn, title)
  {
    this.ActualViewModel.Confirm(msg, fn, title);
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.CreateService = function()
  {
    return(this.ActualViewModel.CreateService());
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.AddWatcher = function(watcher, priority, bEval)
  {
    this.Watchers.AddWatcher(watcher, priority);

    var self = this;

    if(bEval)
    {
      this.Deferred.push( function()
      {
        watcher.Eval(self, true);
      });
    }
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.RemoveWatcher = function(watcher)
  {
    this.Watchers.RemoveWatcher(watcher);
  }
  
  /*****************************************************************************/
  _cheetah.ViewModel.prototype.UpdateView = function()
  {
    if(!this.Updated && !this.SuppressUpdate) // Prevent infinite syncing
    {
      try
      {
        var self = this;

        this.Updated = true;

        this.Watchers.UpdateView();

        this.Synced.ForEach
        (
          function(vm)
          {
            vm.UpdateView();
          }
        );
      }
      catch(e)
      {
        Cheetah.Logger.Error(e.description);
      }

      this.Updated = false;
    }
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.Sync = function(vm, twoway)
  {
    this.Synced.push(vm);

    if(twoway)
      vm.Sync(this, false);
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.CreateCondition = function(expression)
  {
    var cond = this.Conditions[expression];

    if(cond == undefined)
    {
      cond = new Cheetah.Expression(this.ActualViewModel, expression, true);

      this.Conditions[expression] = cond;
    }
     
    return(cond);
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.CreateExpression = function(expression)
  {
    var expr = this.Expressions[expression];

    if(expr == undefined)
    {
      expr = new Cheetah.Expression(this.ActualViewModel, expression, false);

      this.Expressions[expression] = expr;
    }
     
    return(expr);
  }

  /*****************************************************************************/
  _cheetah.ViewModel.prototype.HandleClick = function(context, clickName, update, callback)
  {
    var vm = this;

    // Run an action
    if(clickName.indexOf("^") == 0)
    {
      var action = context.FindAction(clickName.substr(1));

      if(action != null)
      {
        return function(evt) 
               {
                 evt.$model    = ch.Coalesce(evt.$model, context.Model);
                 evt.$position = context.Position;
                 evt.$callback = callback;
               
                 if(!action.Run(evt) && update)
                   vm.UpdateView();

                 return(true);
               };
      }
    }
    else
    {
      var avm = vm.ActualViewModel;

      return function(evt) 
             {
               evt.$model    = ch.Coalesce(evt.$model, context.Model);
               evt.$position = context.Position;
             
               if(update)
               {
                 if(!avm[clickName](evt))
                   vm.UpdateView();

                return(true);
               }
               return avm[clickName](evt);
             };
    }  
  }

  /*****************************************************************************/
  function CheckPrerequisites()
  {
    var prerequisites = ch.ShallowClone(_cheetah.Prerequisites);

    return prerequisites.IfAll(function(item)
    {
      return item.IsMet;
    });
  }

}(_cheetah, document);

/*****************************************************************************/
/*** End _cheetah.ViewModel                                                ***/
/*****************************************************************************/  

/*****************************************************************************/
/*** Begin _cheetah.WatcherList                                           ***/
/*****************************************************************************/  

_cheetah.WatcherList = function(vm)
{
  this.ViewModel = vm;
  this.Count     = 0;
  this.Watchers  = [ {}, {} ];
}

  /*****************************************************************************/
  _cheetah.WatcherList.prototype.AddWatcher = function(watcher, priority)
  {
    if(priority == undefined)
      priority = _cheetah.Priority.Default;

    watcher.Id = String(++this.Count);

    // Only two priorites for now
    var priList = this.Watchers[priority == _cheetah.Priority.High ? 0 : 1];

    priList[watcher.Id] = watcher;
  }

  /*****************************************************************************/
  _cheetah.WatcherList.prototype.RemoveWatcher = function(watcher)
  {
    var id = watcher.Id;

    this.Watchers.ForEach
    (
      function(list)
      {
        if(ch.IsValid(list[id]))
        {
          list[id].Removed = true;
          delete list[id];
          return(false);
        }
        return(true);
      }, 
      true
    );
  }

  /*****************************************************************************/
  _cheetah.WatcherList.prototype.UpdateView = function()
  {
    var vm = this.ViewModel;

    this.Watchers.ForEach
    (
      function(list)
      {
        var listClone = ch.ShallowClone(list);

        $.each(listClone, 
          function(i, wv)
          {
            if(ch.IsValid(list[i]) && !wv.Removed)
            {
              try
              {
                wv.Eval(vm);
              }
              catch(e)
              {
                Cheetah.Logger.Error(e.description);
              }
            }
          }
        );
      }
    );
  }

/*****************************************************************************/
/*** End _cheetah.WatcherList                                              ***/
/*****************************************************************************/  

/*****************************************************************************/
/*** Begin _cheetah.Node et al                                             ***/
/*****************************************************************************/  

! function(_cheetah, document) {

"use strict";

/*****************************************************************************/
/*****************************************************************************/
_cheetah.Node = function(vm, parentElement, element, model)
{
  this.ParentContext    = parentElement; 
  this.ViewModel        = vm;
  this.Element          = element;
  this.NewElement       = null;
  this.Model            = model;
  this.Watchers         = [];
  this.Index            = parentElement ? parentElement.Children.length : 0;
  this.PreserveSpace    = parentElement ? parentElement.PreserveSpace : false;
  this.Watch            = true;
  this.Builder          = parentElement ? parentElement.Builder : Cheetah.Builder;
  this.IsRenderLess     = false;

  // Constructor
  {
    if(parentElement)
    {
      parentElement.Children.push(this);
      this.Watch = parentElement.Watch;
    }

    var watch = ch.AttributeValue(element, "ch-watch");

    if(!ch.IsEmpty(watch))
      this.Watch = ch.Evaluate(this.EvaluateText(vm, watch)) == "true";
  }
}

  /*****************************************************************************/
  _cheetah.Node.prototype.Clear = function(remove, finalize)
  {
  }

  /*****************************************************************************/
  _cheetah.Node.prototype.GetLastRenderedChildElement = function()
  {  
    return null;
  }

  /*****************************************************************************/
  _cheetah.Node.prototype.EvaluateText = function(vm, text)
  {  
    if(text == null || text == undefined)
      return "";

    if(!_cheetah.IsCheetahExpression(text))
      return $.trim(text);

    return new _cheetah.TextExpression(vm, this, text);
  }

  /*****************************************************************************/
  _cheetah.Node.prototype.ProcessElement = function(insert, renderParent)
  {
  }

  /*****************************************************************************/
  _cheetah.Node.prototype.GetVar = function(name)
  {
    if(this.ParentContext)
      return(this.ParentContext.GetVar(name));

    return(null);
  }

  /*****************************************************************************/
  _cheetah.Node.prototype.OnChange = function()
  {
    if(this.ParentContext)
      this.ParentContext.OnChange();
  }
 
  /*****************************************************************************/
  _cheetah.Node.prototype.AddWatcher = function(vm, watcher, priority, bEval)
  {
    this.Watchers.push(watcher);

    vm.AddWatcher(watcher, priority, bEval);
  }

/*****************************************************************************/
/*****************************************************************************/
_cheetah.TextNode = function(vm, parentElement, templateElement, model)
{
  _cheetah.Node.call(this, vm, parentElement, templateElement, model);

  if(vm)
  {
    var txt = templateElement.nodeValue;
    this.Expression = this.EvaluateText(vm, txt);

    if(this.Watch && typeof this.Expression != "string" && this.Expression.Expressions.length > 0)
      this.AddWatcher(vm, new _cheetah.TextNodeWatcher(vm, this, this.Expression));
  }
}

  _cheetah.TextNode.inherits(_cheetah.Node);

  /*****************************************************************************/
  _cheetah.TextNode.prototype.Clear = function(remove, finalize)
  {
    if(remove && this.NewElement)
    {
      this.Builder.RemoveFromParent(this.NewElement);
      this.NewElement = null;
    }
  }

  /*****************************************************************************/
  _cheetah.TextNode.prototype.RenderText = function(insert, renderParent, txt)
  {
    this.NewElement = this.Builder.RenderText(this.NewElement, insert, renderParent, txt);

    if(this.NewElement)
      this.NewElement.$context = this;
  }

  /*****************************************************************************/
  _cheetah.TextNode.prototype.ProcessElement = function(insert, renderParent)
  {
    var txt = ch.Evaluate(this.Expression);

    if(!this.PreserveSpace)
      txt = $.trim(txt);

    this.RenderText(insert, renderParent, txt);
  }

  /*****************************************************************************/
  _cheetah.TextNode.prototype.Render = function(element, model, vars, insert)
  {
    if(!ch.IsValid(model))
      return(false);

    this.Model = model;
    this.ProcessElement();

    return(true);
  }

/*****************************************************************************/
/*****************************************************************************/
_cheetah.VariableTextNode = function(vm, parentElement, templateElement, model, varElem)
{
  templateElement.nodeValue = $.trim(templateElement.nodeValue);

  _cheetah.TextNode.call(this, vm, parentElement, templateElement, model, true);

  this.VariableElement = varElem;
}

  _cheetah.VariableTextNode.inherits(_cheetah.TextNode);

    /*****************************************************************************/
  _cheetah.VariableTextNode.prototype.ProcessElement = function(insert, renderParent)
  {
    var obj = ch.Evaluate(this.Expression);

    if(typeof obj == "string")
      obj = $.trim(ch.NormalizeText(obj));

    this.VariableElement.ParentContext.SetVar(this.VariableElement.VariableName, obj);
  }

/*****************************************************************************/
/*****************************************************************************/
_cheetah.Element = function(vm, parentElement, templateElement, model)
{
  _cheetah.Node.call(this, vm, parentElement, templateElement, model);

  this.Children         = []; 
  this.Variables        = {};
  this.Actions          = {};
  this.Name             = "";
  this.TransformInstance  = {};
  this.InTransform      = parentElement != null ? parentElement.InTransform : null;
  this.OnRender         = null;
  this.IsCheetahElement = false;
  this.IgnoreText       = false;

  this.ResolveTransformInstance();
}

  _cheetah.Element.inherits(_cheetah.Node);

  /*****************************************************************************/
  _cheetah.Element.prototype.GetNonCheetahAncestor = function()
  {  
    var parent = this.ParentContext;
    var found  = false;

    while(parent != null)
    {
      if(!parent.IsCheetahElement && parent.Name.indexOf("ch-") == -1)
        return parent;

      parent = parent.ParentContext;
    }

    return null;
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.GetVar = function(name)
  {
    if(ch.IsValid(this.Variables[name]))
      return(this.Variables[name]);

    if(this.ParentContext)
      return(this.ParentContext.GetVar(name));

    return(null);
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.SetVar = function(name, val)
  {
    this.Variables[name] = ch.Convert(val);
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.CheckTemplateTransform = function(elem, params)
  {
    var transformName = params.name;
    var transform     = _cheetah.Transforms[transformName];

    if(transform && transform.UseTemplate)
    {
      params.name = "ch-call-template";
      params.templateName = transform.UseTemplate;

      var bind = ch.AttributeValue(elem, "ch-bind");

      if(bind)
        this.Builder.SetAttribute(elem, "bind", bind);
            
      this.Builder.SetAttribute(elem, "name", transform.UseTemplate);
      this.Builder.SetAttribute(elem, "data-transform", transformName);
    }
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.CreateChild = function(elem, vm, insert, parent, noWatch)
  {
    var name = elem.localName;

    if(name =="ch-else" || name =="ch-elseif")
    {
      if(!this.LastIf)
      {
        _cheetah.LogError(name =="ch-else" ? 2 : 0);
        return null;
      }
      else if(name =="ch-elseif")
      {
        this.LastIf.AddElseIf(elem);
        return null;
      }
      
      this.LastIf.AddElse(elem);
      this.ProcessLastIf();

      return null;
    }

    this.ProcessLastIf();

    var params = {name: name, templateName: null };

    this.CheckTemplateTransform(elem, params);

    try
    {
      switch(params.name)
      {
        case "ch-bind":
          return new _cheetah.BindElement(vm, this, elem, this.Model, noWatch);

        case "ch-if":
          this.LastIf = new _cheetah.IfElement(vm, this, elem, this.Model);
          return this.LastIf;

        case "ch-action":
          this.CreateAction(elem);
          return null;

        case "ch-variable":
          new _cheetah.Variable(vm, this, elem, this.Model);
          return null;

        case "ch-call-template":
          return new _cheetah.CallTemplate(vm, this, elem, this.Model, params.templateName);

        case "ch-template-contents":
          return new _cheetah.TemplateContents(vm, this, elem, this.Model);
          
        default:
          return new _cheetah.DOMElement(vm, this, elem, this.Model);
      }
    }
    catch(e)
    {
      Cheetah.Logger.Error("Error creating child element [" + name + "]: " + e.description);
      return null;
    }
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.Render = function(element, model, vars, insert)
  {
    if(!ch.IsValid(model))
      return(false);

    var self = this;
    var vm = self.ViewModel;

    model.$$id     = vm.ModelID++,
    model.$$index  = -1;

    this.ProcessChildren(insert);

    return(true);
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.ResolveTransformInstance = function()
  {  
    this.TransformInstance.$name = this.Name;
    this.TransformInstance.$parent = this.ParentContext ? this.ParentContext.TransformInstance : null;

    if(!this.TransformInstance.GetAncestor)
      this.TransformInstance.GetAncestor = function GetAncestor(name)
                                          {
                                            var obj = this;

                                            while(obj != null)
                                            {
                                              if(obj.$name == name)
                                                return obj;

                                              obj = obj.$parent;
                                            }

                                            return null;
                                          };
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.Clear = function(remove, finalize)
  {
    var vm = this.ViewModel;

    if(finalize)
    {
      this.Watchers.ForEach( function(w)
      {
        vm.RemoveWatcher(w);
      });

      this.Watchers = [];
    }

    this.Children.ForEach( function(child)
    {
      child.Clear(true, true);
    });

    if(this.NewElement != null)
    {
      if(remove)
      {
        this.Builder.RemoveFromParent(this.NewElement);
        this.NewElement = null;
      }
      else
        this.Builder.SetContents(this.NewElement, "");
    }

    this.Children = [];
  }

  /*****************************************************************************/
  _cheetah.ErrorMessages = [
                             "'ch-elseif' statement does not follow a 'ch-if' statement",
                             "An element with a 'ch-elseif' attribute does not follow an element with a 'ch-if' attribute",
                             "'ch-else' statement does not follow a 'ch-if' or 'ch-elseif' statement",
                             "An element with a 'ch-else' attribute does not follow an element with a 'ch-if' or 'ch-elseif' attribute",
                             "An action with the name '{0}' was not found!",
                             "Neither 'select' nor 'select-data' is specified for an action setter",
                             "'name' attribute missing on action setter",
                             "'select' attribute missing on action setter"
                           ];
      
  /*****************************************************************************/
  _cheetah.LogError = function(n)
  {
    Cheetah.Logger.Error(_cheetah.ErrorMessages[n]);
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.FindAction = function(name)
  {
    if(this.Actions[name])
      return(this.Actions[name]);

    if(this.ParentContext)
      return(this.ParentContext.FindAction(name));

    if(_cheetah.Actions[name])
    {
      var action = new _cheetah.Action(this.ViewModel, this, _cheetah.Actions[name]);

      this.AddAction(action);
      return action;
    }

    Cheetah.Logger.Error(_cheetah.ErrorMessages[4].replace("{0}", name));
    return(null);
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.AddAction = function(action)
  {
    this.Actions[action.Name] = action;
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.ProcessElement = function(insert, renderParent)
  {
    this.ProcessChildren();
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.GetLastRenderedChildElement = function()
  {  
    var nChildren = this.Children.length;

    for(var i = nChildren-1; i >= 0; --i)
    {
      var child = this.Children[i];

      if(child.IsRenderLess)
        continue;

      if(child.NewElement)
        return child.NewElement;

      var render = child.GetLastRenderedChildElement();

      if(render)
        return render;
    }

    return null;
  }

  /*****************************************************************************
   Get element to render children of this element after.
   *****************************************************************************/
  _cheetah.Element.prototype.GetChildrenRenderElement = function(insert)
  {
    if(this.NewElement)
    {
      if(this.NewElement.childNodes.length > 0)
      {
        insert.insert = 2;
        return this.NewElement.childNodes[0];
      }

      insert.insert = false;
      return this.NewElement;
    }

    return this.GetParentsChildrenRenderElement(insert);
  }

   /*****************************************************************************/
 _cheetah.Element.prototype.GetParentsChildrenRenderElement = function(insert)
  {
    if(!this.ParentContext)
      return null; // This is bad

    for(var i = this.Index-1; i >= 0; --i)
    {
      var sibling = this.ParentContext.Children[i];

      if(sibling.NewElement)
      {
        insert.insert = true;
        return sibling.NewElement;
      }

      var render = sibling.GetLastRenderedChildElement();

      if(render)
      {
        insert.insert = true;
        return render;
      }
    }

    return this.ParentContext.GetChildrenRenderElement(insert);
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.ProcessChildren = function(insert, parent)
  {
    var self       = this;
    var ec         = null;
    var index      = 0;
    var childNodes = this.Template != null ? this.Template.childNodes : this.Element.childNodes;
    
    if(!parent)
    {
      var rtn = {insert: insert};

      parent = this.GetChildrenRenderElement(rtn);
      insert = rtn.insert;
    }

    childNodes.ForEach(function(item)
    {
      if(item.nodeName == "#comment")
        return;

      if(item.nodeName == "#text")
      {
        if(!self.IgnoreText && $.trim(item.nodeValue) != "")
        {
          var newNode = null;

          if(self.Builder.CreateTextNode)
            newNode = self.Builder.CreateTextNode(self.ViewModel, self, item, self.Model);
          else
            newNode = new _cheetah.TextNode(self.ViewModel, self, item, self.Model);

          newNode.ProcessElement(insert, parent);
          ++index;
        }
      }
      else
      {
        var name = item.localName;

        ec = self.CreateChild(item, self.ViewModel);

        if(ec == null)
          return;

        ec.Index = index++;

        if(name == "ch-if")
          return;
        
        ec.ProcessElement(insert, parent);
        ec.PostProcess();

        if(insert)
        {
          var newInsertParent = ec.NewElement ? ec.NewElement : ec.GetLastRenderedChildElement();

          if(newInsertParent)
          {
            parent = newInsertParent;
            insert = 1;
          }
        }
      }
    });

    return;
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.CreateAction = function(element)
  {
    var action = new _cheetah.Action(this.ViewModel, this, element);

    if(!ch.IsEmpty(action.Name))
      this.AddAction(action);
    else
    {
      var parentName = this.Transform.NewName;
      var trigger    = action.Trigger;

      if(ch.IsEmpty(trigger))
      {
        switch(parentName)
        {
          case "button":
          case "a":
           trigger = "click";
           break;

          case "select":
           trigger = "change";
           break;

          default:
            trigger = "mouseup";
            break;
        }
      }

      if(trigger.indexOf("visibility") == -1 && trigger.indexOf("visible") == -1)
      {
        $(this.NewElement).on
        (
          trigger,
          function(e) 
          {
            action.Run(e); 
          }
        );
      }
      else if(ch.IsValid(this.VisibilityWatcher))
      {
        if(trigger.indexOf("true") != -1)
          this.VisibilityWatcher.ShowAction = action;
        else
          this.VisibilityWatcher.HideAction = action;
      }
    }

    return;
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.ProcessLastIf = function()
  {
    if(this.LastIf)
    {
      this.LastIf.ProcessElement();
      this.LastIf.PostProcess();
      this.LastIf = null;
    }
  }

  /*****************************************************************************/
  _cheetah.Element.prototype.PostProcess = function()
  {
    this.ProcessLastIf();

    if(this.OnRender)
      this.OnRender(this);
  }

/*****************************************************************************/
/*****************************************************************************/
// Non-rendered Cheetah element, i.e. ch-bind, ch-if, etc
_cheetah.CheetahElement = function(vm, parentElement, templateElement, model)
{
  _cheetah.Element.call(this, vm, parentElement, templateElement, model);

  this.IsCheetahElement = true;

  // Cheetah elements don't need the "ch-" prefix
  var ps = ch.AttributeValue(templateElement, "preserve-space");

  if(!ch.IsEmpty(ps))
    this.PreserveSpace = ps.toLowerCase() == "true";
}

  _cheetah.CheetahElement.inherits(_cheetah.Element);

 /*****************************************************************************/
/*****************************************************************************/
_cheetah.IfElement = function(vm, parentElement, element, model)
{
  _cheetah.CheetahElement.call(this, vm, parentElement, element, model);

  this.If            = element;
  this.Else          = null;
  this.ElseIf        = [];
  this.RenderedIndex = -1; /* -1 == nothing or not yet rendered, 0 == if, -2 == else, otherwise one of the elseifs */
  this.Watcher       = null;

  var test = ch.AttributeValue(element, "test", true);

  if(ch.IsEmpty(test))
    throw "Missing 'test' attribute for ch-if";

  this.Condition = vm.CreateCondition(test);

  if(this.Watch)
  {
    this.Watcher = new _cheetah.IfWatcher(vm, this);
    this.AddWatcher(vm, this.Watcher);
  }
}

  _cheetah.IfElement.inherits(_cheetah.CheetahElement);

  /*****************************************************************************/
  _cheetah.IfElement.prototype.Clear = function(remove, finalize)
  {
    if(finalize)
      this.Watcher = null;

    this.parent.Clear.call(this, remove, finalize)
  }

  /*****************************************************************************/
  _cheetah.IfElement.prototype.FindBlock = function(fn)
  {
    if(this.Condition.Eval(this))
    {
      fn(this.If, 0);
      return;
    }

    if(this.ElseIf.length > 0)
    {
      var index = 0;
      var self = this;

      if(this.ElseIf.IfAny( function(elseIf)
      {
        ++index;

        if(elseIf.Condition.Eval(self))
        {
          fn(elseIf.Element, index);
          return true;
        }

        return false;
      }))
        return;
    }

    if(this.Else)
      fn(this.Else, -2);
    else
      fn(null, -1);

    return;
  }

  /*****************************************************************************/
  _cheetah.IfElement.prototype.ProcessElement = function(insert, renderParent)
  {
    var self = this;
    var renderedIndex = this.RenderedIndex;

    if(this.Watcher == null)
    {
      this.Watcher = new _cheetah.IfWatcher(this.ViewModel, this);

      this.AddWatcher(this.ViewModel, this.Watcher);
    }

    this.FindBlock( function(elem, index)
    {
      if(elem && renderedIndex != index)
      {
        if(insert)
          self.Clear();

        self.Element = elem;
        self.ProcessChildren(insert, renderParent);
        self.Element = self.If;
        self.RenderedIndex = index;
      }
      else if(!elem)
      {
        self.Clear();
        self.RenderedIndex = -1;
      }
    });

    return;
  }

  /*****************************************************************************/
  _cheetah.IfElement.prototype.AddElseIf = function(element)
  {
    var condition = this.ViewModel.CreateCondition(ch.AttributeValue(element, "test", true));

    if(condition)
    {
      this.ElseIf.push({
                         Element:   element,
                         Condition: condition
                       });
    }
  }

  /*****************************************************************************/
  _cheetah.IfElement.prototype.AddElse = function(element)
  {
    this.Else = element;
  }

 /*****************************************************************************/
/*****************************************************************************/
_cheetah.Variable = function(vm, parentElement, element, model)
{
  _cheetah.CheetahElement.call(this, vm, parentElement, element, model);

  this.IsRenderLess = true;
  this.VariableName = ch.AttributeValue(element, "name", true);

  if(ch.IsEmpty(this.VariableName))
    throw "Missing variable name";

  var expr = this.Element.innerHTML;

  if(!_cheetah.IsCheetahExpression(expr) && expr.indexOf("<") == -1)
    this.ParentContext.SetVar(this.VariableName, expr);
  else
  {
    this.Builder = new _cheetah.VariableBuilder(this, this.VariableName);

    this.ProcessChildren();
  }
}

  _cheetah.Variable.inherits(_cheetah.CheetahElement);

  /*****************************************************************************/
  _cheetah.Variable.prototype.ProcessElement = function(insert, renderParent)
  {
    this.ProcessChildren();
  }

/*****************************************************************************/
/*****************************************************************************/  
_cheetah.VariableBuilder = function(context, name)
{
  this.VarContext = context;
  this.Context    = context.ParentContext;
  this.Name       = name;

  /*****************************************************************************/  
  this.CreateTextNode = function(vm, parentElement, templateElement, model)
  {
    return new _cheetah.VariableTextNode(vm, parentElement, templateElement, model, this.VarContext);
  }
}

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.FindElement = function(id)
  {
    return null;
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.GetContents = function(element)
  {
    return "";
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.SetContents = function(element, txt)
  {
    if(typeof txt == "string")
      txt = $.trim(ch.NormalizeText(txt));

    this.Context.SetVar(this.Name, txt);
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.RenderText = function(element, insert, renderParent, txt)
  {
    this.SetContents(null, txt);
  }

  function NonCheetahErr()
  {
    Cheetah.Logger.Error("Non Cheetah elements not allowed in a variable");
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.AppendChild = function(parent, childName)
  {
    NonCheetahErr();
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.InsertBefore = function(before, childName)
  {
    NonCheetahErr();
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.InsertAfter = function(after, childName)
  {
    NonCheetahErr();
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.MoveElement = function(element, newParent)
  {
    NonCheetahErr();
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.AppendText = function(parent, txt)
  {
    this.SetContents(null, txt);
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.InsertTextBefore = function(before, txt)
  {
    NonCheetahErr();
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.InsertTextAfter = function(after, txt)
  {
    NonCheetahErr();
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.RemoveChild = function(parent, child)
  {
    NonCheetahErr();
  }

  /*****************************************************************************/  
  _cheetah.VariableBuilder.prototype.RemoveFromParent = function(child)
  {
    NonCheetahErr();
  }

/*****************************************************************************/
_cheetah.Template = function(vm, elem)
{
  _cheetah.CheetahElement.call(this, vm, null, elem);

  this.IsCheetahElement = true;
}

  _cheetah.Template.inherits(_cheetah.CheetahElement);

/*****************************************************************************/
_cheetah.CallTemplate = function(vm, parentElement, elem, model, name)
{
  _cheetah.CheetahElement.call(this, vm, parentElement, elem, model);

  this.IsCheetahElement = true;
  this.ContentElement = elem;

  if(!name)
    name = ch.AttributeValue(elem, "name", true);

  if(!name)
  {
    Cheetah.Logger.Error("Missing template name");
    return;
  }

  name = ch.Evaluate(this.EvaluateText(vm, name));

  var templateRef = _cheetah.Templates[name];

  if(!templateRef)
  {
    Cheetah.Logger.Error("Undefined template: " + name);
    return;
  }

  var transformName = $(elem).data("transform");

  if(transformName)
  {
    this.Transform = _cheetah.Transforms[transformName];

    if(this.Transform)
    {
      if(this.Transform.CreateInstance)
        this.TransformInstance = this.Transform.CreateInstance();

      var self = this;

      if((this.TransformInstance && this.TransformInstance.OnRender) || this.Transform.OnRender)
      {
        this.OnRender = function()
        {
          if(self.Children.length > 0)
          {
            var child = self.Children[0];

            child.Transform = self.Transform;
            child.TransformInstance = self.TransformInstance;
            child.TransformOnRender();
          }
        }
      }
    }
  }

  this.Element = templateRef.GetTemplate(vm);

  var self = this;

  elem.attributes.ForEach( function(attr)
  {
    if(attr.localName != "name")
    {
      var w = new _cheetah.VariableWatcher(vm, self, attr.localName, attr.value)
          
      if(self.Watch)
        self.AddWatcher(vm, w, _cheetah.Priority.High); 

      w.Eval(vm, true);
    }
  });
}

  _cheetah.CallTemplate.inherits(_cheetah.CheetahElement);

/*****************************************************************************/
_cheetah.TemplateContents = function(vm, parentElement, elem, model)
{
  _cheetah.CheetahElement.call(this, vm, parentElement, elem, model);

  this.IsCheetahElement = true;

  var parent = this.ParentContext;

  while(ch.IsValid(parent))
  {
    if(parent.ContentElement)
    {
      this.Element = parent.ContentElement;
      break;
    }

    parent = parent.ParentContext;
  }

  if(!ch.IsValid(parent))
    Cheetah.Logger.Error("'ch-template-contents' element not found within a 'ch-template' element");
}

  _cheetah.TemplateContents.inherits(_cheetah.CheetahElement);

/*****************************************************************************/
/*****************************************************************************/
_cheetah.BindElement = function(vm, parentElement, element, model, noWatch)
{
  _cheetah.CheetahElement.call(this, vm, parentElement, element, model);

  this.BindPath         = ch.AttributeValue(this.Element, "on", true);
  this.Bind             = this.BindPath;
  this.IsCheetahElement = true;

  if(ch.IsEmpty(this.Bind))
    throw "Missing 'on' attribute for ch-bind";

  var shouldWatch = false;
  var array = true;

  if(Cheetah.IsExpressionText(this.Bind))
  {
    this.Bind = this.ViewModel.CreateExpression(this.Bind);
    shouldWatch = true;
  }
  else
  {
    this.Bind = ch.GetModelValue(this.Model, this.Bind, this);

    if(!Array.isArray(this.Bind))
      array = false;

    shouldWatch = true;
  }

  this.Sort = ch.AttributeValue(this.Element, "sort");

  if(shouldWatch && this.Watch && !noWatch)
  {
    if(array)
    {
      if(!ch.IsEmpty(this.Sort))
        this.Sort = this.EvaluateText(this.ViewModel, this.Sort);

      this.AddWatcher(this.ViewModel, new _cheetah.BindArrayWatcher(this));
    }
    else
      this.AddWatcher(this.ViewModel, new _cheetah.BindWatcher(this));
  }
}

  _cheetah.BindElement.inherits(_cheetah.CheetahElement);

  /*****************************************************************************/
  _cheetah.BindElement.prototype.EvaluateBind = function()
  {    
    if(!this.Bind)
    {
      //Cheetah.Logger.Error("Bind value is null");
      return null;
    }

    if(this.Bind.Eval)
      return this.Bind.Eval(this, this.Model);

    var oldBind = this.Bind;
    var model   = this.ViewModel.FixModel(this.Model);

    this.Bind = ch.GetModelValue(model, this.BindPath, this);

    if(!this.Bind)
    {
      //Cheetah.Logger.Error("Bind value is null");
    }
    else
      this.Bind.$$path = this.BindPath;

    return this.Bind;
  }

  /*****************************************************************************/
  _cheetah.BindElement.prototype.ProcessElement = function(insert, renderParent)
  {
    // We are binding to a model object?
    var data = this.EvaluateBind();

    if(data)
    {
      if(this.Sort && data.length != undefined && data.length != 0)
      {
        var sort = ch.Evaluate(this.Sort);

        if(!ch.IsEmpty(sort))
          ch.Sort(data, sort);
      }

      data.$$parent  = this.Model;

      var newContext = this.CreateChild(this.Element, this.ViewModel, true);

      newContext.Model = data;

      newContext.Render(this.Element, data);
    }

    return;
  }

  /*****************************************************************************/
  _cheetah.BindElement.prototype.Render = function(element, model, insert)
  {
    if(!ch.IsValid(model))
      return(false);

    model.$$id     = this.ViewModel.ModelID++,
    model.$$index  = -1;

    // Are we binding to array?
    if(typeof(model) != "string" && model.length != undefined)
    {
      var index  = 0;
      var rtn    = {insert: insert}
      var parent = this.GetChildrenRenderElement(rtn);
      var self   = this;
      var vm     = this.ViewModel;

      insert = rtn.insert;

      return(model.ForEach(function(i) 
              {
                if(ch.IsValid(i))
                {
                  i.$$id     = vm.ModelID++;
                  i.$$parent = model;
                  i.$$index  = index;
                  i.$$path   = "[" + index;

                  var ecNew = new _cheetah.DOMElement(vm, self, element, i);

                  ecNew.Position = index;
                  ecNew.NewElement = self.NewElement;
                  ecNew.IsArrayElement = true;

                  ecNew.ProcessChildren(insert, parent);
                  ecNew.PostProcess();

                  if(insert)
                  {
                    var newInsertParent = ecNew.NewElement ? ecNew.NewElement : ecNew.GetLastRenderedChildElement();

                    if(newInsertParent)
                    {
                      parent = newInsertParent;
                      insert = 1;
                    }
                  }
                }
                index++;
              }));
    }
    else
    {
     // this.Model = model;
     // this.ParentModel = model ? model.$$parent : null;

     // if(!this.ParentModel)
     //     console.error("Yikes!");

      this.ProcessChildren(insert);
    }

    return(true);
  }


/*****************************************************************************/
/*****************************************************************************/
_cheetah.DOMElement = function(vm, parentElement, element, model)
{
  _cheetah.Element.call(this, vm, parentElement, element, model);

  this.Transform        = null;
  this.Name             = this.TransformInstance.$name = element.localName;
  this.Position         = 0;
  this.RenderElement    = true;
  this.PreserveSpace    = false; // Don't inherit parent

  this.Sort             = null;
  this.Events           = [];
  this.Route            = "";
  this.Condition        = null;
  this.ConditionName    = null;
  this.Template         = null;
  this.Contents         = "";
  this.Bind             = "";
  this.Async            = false;

  this.Attributes       = null;
  this.Class            = "";
  this.Style            = "";
  this.CondResult       = true;

  /*****************************************************************************/
  // Constructor
  {
    this.Position = parentElement ? parentElement.Position : 0;
  }
}

  _cheetah.DOMElement.inherits(_cheetah.Element);

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.ProcessElement = function(insert, renderParent)
  {
    var self = this;

    if(this.PreProcess(insert, renderParent) && !this.Transform.DontRenderChildren)
    {
      // Call base class
      if(!this.Async)
        this.parent.ProcessElement.call(this, insert, renderParent);
      else
      {
        this.ViewModel.Async.push( function()
        {
          self.parent.ProcessElement.call(self, insert, renderParent);
        });
      }
    }

    if(this.RenderElement)
      this.Builder.EndElement();

    this.TransformMethod("PostProcess", function(transform)
    {
      transform.PostProcess(self.NewElement);
    });

    return;
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.SetAttribute = function(attrName, val)
  {
    var self = this;

    if(!this.TransformMethod("SetAttribute", function(transform)
    {
      transform.SetAttribute(self.NewElement, attrName, val);
    }))
      this.Builder.SetAttribute(this.NewElement, attrName, val);
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.OnChange = function()
  {
    if(this.OnRender)
      this.OnRender(this);

    this.parent.OnChange.call(this)
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.CheckTransform = function()
  {
    var transform = _cheetah.Transforms[this.Name];

    if(transform && transform.RequiredParent)
    {
      var parent = this.GetNonCheetahAncestor();
      var all    = transform.RequiredParent.split(",");

      if(!all.IfAny( function(item)
      {
        return item == parent.Name;
      }))
        Cheetah.Logger.Error(transform.Name + " must be a child of " + transform.RequiredParent + " (ignoring Cheetah elements)");
    }

    if(!ch.IsValid(transform))
    {
      transform = new IdentityTransform(this.Name);
      this.InTransform = this.ParentContext ? this.ParentContext.InTransform : false;
    }
    else
    {
      this.InTransform = transform;
      this.IgnoreText = transform.IgnoreText;

      if(ch.IsEmpty(transform.NewName))
        this.RenderElement = false;

      if(transform.CreateInstance)
      {
        this.TransformInstance = transform.CreateInstance();
        this.ResolveTransformInstance();
      }

      if(transform.CreateBuilder)
      {
        this.Builder = transform.CreateBuilder();

        if(this.TransformInstance && transform.CreateBuilder)
          this.TransformInstance.$builder = this.Builder;
      }
    }

    if(this.Name.indexOf("ch-") == -1 && this.ParentContext && this.ParentContext.InTransform && this.ParentContext.InTransform.AllowedChildren)
    {
      var all    = this.ParentContext.InTransform.AllowedChildren.split(",");
      var parent = this.ParentContext;
      var self   = this;

      if(!all.IfAny( function(item)
      {
        return item == self.Name;
      }))
        Cheetah.Logger.Error(this.Name + " is not allowed as a child of " + this.ParentContext.InTransform.Name + " (ignoring Cheetah elements)");
    }

    this.Transform = transform;
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.PreProcess = function(insert, renderParent)
  {
    this.CheckTransform();
    var self = this;

    if(this.Name.indexOf("ch-") == 0)
      if(this.ProcessCheetahElement())
        return(false);

    // Process the attributes of this element
    if(this.RenderElement)
    {
      this.ProcessAttributes(this.ViewModel);

      // Render the current element
      if(this.RenderNewElement(insert, renderParent))
        return(false);
    }
    // Allow renderless transforms to work
    else if(!this.Transform.IsIdentity)
    {
      // Allow transform to add or delete attributes
      this.TransformAttributes( function()
      {
        self.ProcessAttributes(self.ViewModel);
      });

      // Allow transform to do post-creation tasks
      this.TransformOnRender(null, this.Model);
    }

    return(true);
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.TransformOnRender = function(newElement, model)
  {  
    var self = this;

    this.TransformMethod("OnRender", function(transform)
    {
      transform.OnRender(newElement, model);
    });
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.TransformAttributes = function(fn)
  {  
    var self = this;

    this.TransformMethod("TransformAttributes", function(transform)
    {
      if(fn)
        fn();

      transform.TransformAttributes(self.Attributes);
    });
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.TransformMethod = function(name, fn)
  {  
    if(this.TransformInstance && this.TransformInstance[name])
      fn(this.TransformInstance);
    else if(this.Transform[name])
      fn(this.Transform);
    else
      return false;

    return true;
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.ProcessCheetahElement = function()
  {
    var vm = this.ViewModel;

    this.IsCheetahElement = true;

    switch(this.Name.substr(3))
    {
      case "include":
      case "template":
      {
        // Ignore templates declared inside of a view. They are loaded globally.
        return(true);
      }

      default:
        Cheetah.Logger.Warning("Unknown Cheetah element: '" + this.Name + "'");
        return(true);
    }

    return(false);
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.ProcessAttributes = function(vm)
  {  
    var aAttributes = this.Element.attributes;
    var aReturn     = [];

    if(aAttributes != null)
    {
      var nAttributes = aAttributes.length;

      for(var i = 0; i < nAttributes; ++i)
      {
        var attr = aAttributes[i];
        var name = attr.localName;

        if(name.indexOf("data-ch-") == 0)
          name = name.substr(5);

        if(name.indexOf("ch-") == 0)
        {
          switch(name.substr(3))
          {
            case "bind":
              this.Bind = ch.Evaluate(this.EvaluateText(vm, attr.value));
              break;

            case "async":
              this.Async = attr.value.toLowerCase() == "true";
              break;

            case "preserve-space":
              this.PreserveSpace = attr.value.toLowerCase() == "true";
              break;

            case "format":
              this.Format = this.EvaluateText(vm, attr.value);
              break;

            case "deformat":
              this.Deformat = this.EvaluateText(vm, attr.value);
              break;

            case "filter":
            {
              this.Filter = attr.value;

              if(this.Filter)
                this.Filter = new RegExp(this.Filter.replaceAll("\\\\", "\\"));

              break;
            }

            case "watch":
              // Taken care of in constructor
              break;

            case "visible":
              if(this.Watch)
                this.AddWatcher(vm, new _cheetah.VisibilityWatcher(vm, this, attr.value), _cheetah.Priority.Default, true);

              break;

            case "html":
              if(this.Watch)
                this.AddWatcher(vm, new _cheetah.HtmlWatcher(vm, this, attr.value), _cheetah.Priority.Default, true);

              break;

            case "click":
            case "blur":
            case "focus":
            case "mouseover":
            case "mouseenter":
            case "mouseleave":
              this.Events.push( { Name: name.substr(3), Value: attr.value} );
              break;

            case "checked":
            case "disabled":
            case "readonly":
            case "selected":
              if(this.Watch)
                this.AddWatcher(vm, new _cheetah.AttributeWatcher(vm, this, name.substr(3), attr.value, 1), _cheetah.Priority.Default, true);

              break;

            case "style":
              this.Style = attr.value;
              break;

            case "class":
              this.Class = attr.value;
              break;

            case "route":
              this.Route = ch.Evaluate(this.EvaluateText(vm, attr.value));
              break;

            default:
              Cheetah.Logger.Warning("Unknown Cheetah attribute: '" + name + "'");
              break;
          }
        }
        else
        {
          if(this.Watch && _cheetah.IsCheetahExpression(attr.value))
          { 
            var watcher =  new _cheetah.AttributeNodeWatcher(vm, this, name, attr.value);

            this.AddWatcher(vm, watcher, _cheetah.Priority.Default, false);
          }

          var val = String(ch.Evaluate(this.EvaluateText(vm, attr.value)));

          if(attr.localName == "href")
            val = val.replaceAll(" ", "");

          aReturn.push(new Cheetah.Attribute(attr.localName, val.replaceAll("\"", "'")));
        }
      }
    }

    this.Attributes = aReturn;
    return;
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.GetRenderParent = function()
  {  
    var parent    = null;
    var parentCxt = this.ParentContext;

    while(!parent && parentCxt)
    {
      parent    = parentCxt.NewElement;
      parentCxt = parentCxt.ParentContext;
    }

    if(parent == null)
      parent = this.Builder.FindElement(this.ViewModel.Container);

    return parent;
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.RenderNewElement = function(insert, renderParent)
  {
    var self   = this;
    var vm     = this.ViewModel;
    var ret    = false;
    var parent = renderParent;

    if(!parent)
    {
      var parInsert = {insert: insert};

      parent = this.GetParentsChildrenRenderElement(parInsert);
      insert = parInsert.insert;
    }

    // Create the new html element
    if(insert == 2)
      this.NewElement = this.Builder.InsertBefore(parent, this.Transform.NewName);
    else                             
      this.NewElement = insert ? this.Builder.InsertAfter(parent, this.Transform.NewName)  
                               : this.Builder.AppendChild(parent, this.Transform.NewName);  

    if(this.NewElement)
      this.NewElement.$context = this;

    // Allow transform to add or delete attributes
    this.TransformAttributes();

    // Copy attributes from template to new element
    if(!this.IsCheetahElement)
    {
      var newElem = this.NewElement;

      this.Attributes.ForEach(function(attr)
      {
        self.Builder.SetAttribute(newElem, attr.Name, attr.Value);
      });      
    }

    // Allow transform to do post-creation tasks
    this.TransformOnRender(this.NewElement, this.Model);

    // Cheetah elements don't get any of the following
    if(this.IsCheetahElement)
      return(ret);

    // Should we render the contents?
    if(this.Condition != null && !this.CondResult)
      return(ret);

    if(this.Transform.IsEditable && this.Bind != "")
    {
      if(this.Watch)
      {
        this.TransformMethod("OnBind", function()
        {
          try
          {
            self.AddWatcher(vm, new _cheetah.PropertyWatcher(vm, self), _cheetah.Priority.Default, true);
          }
          catch(e)
          {
            // Binding failed. Log it and move on.
            Cheetah.Logger.Error(e.description);
          }
        });
      }

      this.ProcessChildren();
      ret = true;
    }

    // Render dynamic classing
    if(this.Watch && !ch.IsEmpty(this.Class))
      this.AddWatcher(vm, new _cheetah.ClassWatcher(vm, this, this.Class), _cheetah.Priority.Default, true);

    if(this.Watch && !ch.IsEmpty(this.Style))
      this.AddWatcher(vm, new _cheetah.StyleWatcher(vm, this, this.Style), _cheetah.Priority.Default, true);

    // Set up event handlers
    this.Events.ForEach( function(event)
    {
      self.RenderEvent(vm, event.Name, event.Value);
    });

    // Do we need to set up a route (click handler)?
    if(this.Route != "")
    {
      var r = this.Route;

      $(this.NewElement).click( function(e) 
      {
        vm.RunRoute(r, null, true);
      });
    }

    return(ret);
  }

  /*****************************************************************************/
  _cheetah.DOMElement.prototype.RenderEvent = function(vm, name, value)
  {
    if(ch.IsEmpty(value))
      return;

    var self = this;

    // Shortcut for Action with ModelSetter
    if(value.indexOf(":") != -1)
    {
      var vals = value.split(":");

      if(vals.length != 2)
        Cheetah.Logger.Error("Syntax error on 'ch-'" + name + " attribute");
      else
      {
        var prop = $.trim(vals[0]);
        var val  = vm.CreateExpression($.trim(vals[1])); 

        $(this.NewElement).on( name, 
        function(e) 
        {
          var newVal = val.Eval(self);

          ch.SetModelValue(self.Model, prop, ch.Clone(newVal));
          vm.UpdateView();
        });
      }
    }
    // Do we need to set up a click handler?
    else 
    {
      var fn = vm.HandleClick(this, value, true);

      $(self.NewElement).on( name, fn );
    }

    return;
  }

}(_cheetah, document);

/*****************************************************************************/
/*** End _cheetah.Node et al                                               ***/
/*****************************************************************************/  

/*****************************************************************************/
/*****************************************************************************/
Cheetah.Attribute = function(name, val)
{
  this.Name = name;
  this.Value = val;
}

/*****************************************************************************/
_cheetah.Action = function(vm, context, element, parent)
{
  this.Steps           = [];
  this.ViewModel       = vm;
  this.Name            = !element ? "" : ch.AttributeValue(element, "name");
  this.NumAnimations   = 0;
  this.Trigger         = !element ? "" : ch.AttributeValue(element, "trigger");
  this.Parent          = parent;
  this.OnFail          = null;

  /*****************************************************************************/
  this.Run = function(evt, suppressUpdate)
  {
    try
    {
      var update = false;

      this.NumAnimations = 0;

      this.Steps.ForEach
      (
        function(fn)
        {
          update = fn(evt) || update;
        },
        false
      )

      if(update && !suppressUpdate)
        this.ViewModel.UpdateView();
      
      return update;
    }
    catch(e)
    {
      Cheetah.Logger.Error(e.description);
    }

    return false;
  }

  /*****************************************************************************/
  // Constructor
  {
    var self = this;

    try
    {
      element.childNodes.ForEach(function(childNode)
      {
       self.HandleStep(context, childNode);
      });
    }
    catch(e)
    {
      Cheetah.Logger.Error("Error creating action [" + this.Name + "]: " + e.description);
    }
  }
}

  /*****************************************************************************/
  _cheetah.Action.prototype.EvalExpression = function(evt, context, value)
  {  
    if(!value)
      return value;

    if(value.indexOf("$$") == -1 && !_cheetah.IsCheetahExpression(value))
      return ch.Convert(value);

    var vm    = this.ViewModel;
    var model = ch.Coalesce(evt.$model, context.Model);

    if(value == "$$target" || value == "//$$target//")
      return model;

    var inject =  {};

    if(value.indexOf("$$result") != -1)
      inject["$$result"] = evt.$$result;

    var expr  = context.EvaluateText(this.ViewModel, value.replaceAll("$$target.", ""));

    return ch.Convert(ch.Evaluate(expr, model, inject));
  }
  
  /*****************************************************************************/
  _cheetah.Action.prototype.EvalSetter = function(action, context, childNode, fnSet)
  {
    var data = ch.AttributeValue(childNode, "data");

    if(ch.IsEmpty(data))
    {
      var value = "";

      if(ch.IsValid(childNode.attributes["value"]))
        value = ch.AttributeValue(childNode, "value");
      else
        value = childNode.innerHTML;

      if(!ch.IsValid(value))
      {
        _cheetah.LogError(5);
        return;
      }
      
      if(ch.IsEmpty(value))
        value = "";

      var vm        = this.ViewModel;
      var condition = CreateCondition(vm, childNode);
      var self      = this;

      this.Steps.push(function(evt) 
      {
        if(!EvalCondition(condition, evt, context))
          return false;
     
        var newVal = self.EvalExpression(evt, context, value);

        return fnSet(evt, newVal);
      });
    }
    else
    {
      this.Steps.push(function(evt) 
      {
        if(!EvalCondition(condition, evt, context))
          return false;

        var val = $(ch.EventTarget(evt)).data(data);

        return fnSet(evt, val);
      });
    }
  }

  /*****************************************************************************/
  _cheetah.Action.prototype.EvalNamedSetter = function(action, context, childNode, fnSet)
  {
    var name = ch.AttributeValue(childNode, "name");

    if(ch.IsEmpty(name))
    {
      _cheetah.LogError(6);
      return;
    }

    name = ch.Evaluate(context.EvaluateText(context.ViewModel, name));

    this.EvalSetter(action, context, childNode, function(evt, val)
    {
      return fnSet(evt, name, val);
    });
  }

  /*****************************************************************************/
  _cheetah.Action.prototype.EvalSelectSetter = function(action, context, childNode, bName, fnSet)
  {
    var sel = ch.AttributeValue(childNode, "select");

    if(ch.IsEmpty(sel))
    {
      _cheetah.LogError(7);
      return;
    }
   
    if(bName)
    {
      this.EvalNamedSetter(action, context, childNode, function(evt, name, val)
      {
        var $target = ch.SelectTarget(evt, sel);

        fnSet($target, name, val);
      });
    } 
    else 
    {
      this.EvalSetter(action, context, childNode, function(evt, val)
      {
        var $target = ch.SelectTarget(evt, sel);

        fnSet($target, val);
      });
    }
  }

  /*****************************************************************************/
  _cheetah.Action.prototype.EvalClassSetter = function(context, childNode)
  {
    var sel    = ch.AttributeValue(childNode, "select");
    var add    = ch.AttributeValue(childNode, "add");
    var rem    = ch.AttributeValue(childNode, "remove");
    var toggle = ch.AttributeValue(childNode, "toggle");

    this.SetActionStep(context, childNode, function(evt) 
    {
      var $target = ch.SelectTarget(evt, sel);

      if(rem)
        $target.removeClass(rem);

      if(add)
        $target.addClass(add);

      if(toggle)
      {
        if(!$target.hasClass(toggle))
          $target.addClass(toggle);
        else
          $target.removeClass(toggle);
      }

      return false;
    });
  }

  /*****************************************************************************/
  _cheetah.ShowElement = function(elem, show)
  {  
    var $elem = null;

    if(elem instanceof jQuery)
      $elem = elem;
    else if(typeof elem === "string")
      $elem = $("#" + elem);
    else
      $elem = $(elem);

    if($elem)
    {
      $elem.each
      ( 
        function()
        {
          if(this.$context && this.$context.VisibilityWatcher)
            this.$context.VisibilityWatcher.Eval(this.$context.ViewModel, show);
          else if(show)
            $(this).show();
          else
            $(this).hide();
       }
      )
    }
  }

  /*****************************************************************************/
  function EvalAttribute(context, childNode, attrName)
  {
    return context.EvaluateText(context.ViewModel, ch.AttributeValue(childNode, attrName))
  }

  /*****************************************************************************/
  _cheetah.Action.prototype.EvalVisibilitySetter = function(context, childNode)
  {
    var show  = ch.AttributeValue(childNode, "show");
    var hide  = ch.AttributeValue(childNode, "hide");
    var sel   = "";
    var bShow = true;
    var self  = this;

    if(ch.IsEmpty(show) && ch.IsEmpty(hide))
    {
      sel = ch.AttributeValue(childNode, "select");
    
      bShow = ch.Convert(ch.AttributeValue(childNode, "value"));
    }

    this.SetActionStep(context, childNode, function(evt) 
    {
      if(ch.IsEmpty(hide) && ch.IsEmpty(show))
      {
        _cheetah.ShowElement(ch.SelectTarget(evt, self.EvalExpression(evt, context, sel)), bShow);
      }
      else
      {
        if(!ch.IsEmpty(hide))
          _cheetah.ShowElement(ch.SelectTarget(evt, self.EvalExpression(evt, context, hide)), false);

        if(!ch.IsEmpty(show))
          _cheetah.ShowElement(ch.SelectTarget(evt, self.EvalExpression(evt, context, show)), true);
      }

      return false;
    });
  }

  /*****************************************************************************/
  _cheetah.Action.prototype.EvalChildConditionalSetter = function(context, childNode, action, param, title)
  {
    var childAction = this.CreateChild(context, childNode); 

    if(childAction == null)
    {
      Cheetah.Logger.Error("No child steps for " + action + " step in action");
    }
    else
    {
      var vm = this.ViewModel;

      this.SetActionStep(context, childNode, function(evt) 
      { 
        var update = false;

        vm[action](param, function()
        {
          update = childAction.Run(evt, true);
        },
        title);

        return update;
      });
    }
  }

  /*****************************************************************************/
  _cheetah.Action.prototype.SetActionStep = function(context, childNode, fn)
  {
    var condition = CreateCondition(this.ViewModel, childNode);

    this.Steps.push(function(evt)
    {
      if(EvalCondition(condition, evt, context))
        return fn(evt);            

      return false;
    });
  }

  /*****************************************************************************/
  _cheetah.Action.prototype.HandleStep = function(context, childNode)
  {
    if(!childNode.localName)
      return;

    var stepName = childNode.localName.toLowerCase();
    var vm = this.ViewModel;

    switch(stepName)
    {
      case null:
        break;

      case "propertysetter":
        this.EvalSelectSetter(self, context, childNode, true, function($q, name, val)
        {
          $q.attr(name, val);
          return(false);
        });
        break;

      case "stylesetter":
        this.EvalSelectSetter(self, context, childNode, true, function($q, name, val)
        {
          $q.css(name, val);
          return(false);
        });
        break;

      case "classsetter":
        this.EvalClassSetter(context, childNode);
        break;

      case "visibilitysetter":
        this.EvalVisibilitySetter(context, childNode);
        break;

      case "modelsetter":
        this.EvalNamedSetter(self, context, childNode, function(evt, name, val)
        {
          var model = null;

          if(name.indexOf("$$root.") == 0)
          {
            model = vm.ActualViewModel.Model;
            name = name.substr("$$root.".length);
          }
          else
            model = ch.Coalesce(evt.$model, context.Model);

          if(typeof val === "object" && val.$$id)
          {
            var previousValue = ch.GetModelValue(model, name);

            val          = ch.Clone(val);
            val.$$id     = vm.ModelID++,
            val.$$index  = -1;

            if(previousValue)
            {
              val.$$path = previousValue.$$path;
              val.$$parent = previousValue.$$parent;
            }
          }

          ch.SetModelValue(model, name, val);
          return(true);
        });
        break;

      case "remove":
        this.EvalSelectSetter(self, context, childNode, false, function($q, name, val)
        {
          $q.remove();
        });
        break;

      case "reloadmodel":
        this.SetActionStep(context, childNode, function(evt) 
        {
          vm.SuppressUpdate = true;
          vm.ActualViewModel.LoadModel();
          return false;
        });
        break;

      case "call":
      {
        var fnName = ch.AttributeValue(childNode, "function");
        var isAttribute = true;
        var isAction = false;

        if(!fnName)
        {
          fnName = ch.AttributeValue(childNode, "action");

          if(fnName)
          {
            fnName = "^" + fnName.replace("^", "");
            isAction = true;
          }
          else
          {
            fnName = $.trim(childNode.innerHTML);
            isAttribute = false;
          }
        }

        fnName = ch.Evaluate(context.EvaluateText(this.ViewModel, fnName));
        
        var childAction = isAttribute ? this.CreateChild(context, childNode) : null; 
        var fn          = this.ViewModel.HandleClick(context, fnName, false, childAction);

        this.SetActionStep(context, childNode, function(evt) 
        {
          var result = fn(evt);

          if(result && !isAction && childAction)
          {
            evt.$callback = null;
            return childAction.Run(evt, true);
          }
          return result;
        });

        break;
      }

      case "callback":
      {      
        this.SetActionStep(context, childNode, function(evt) 
        {
          if(evt.$callback)   
          { 
            var callback = evt.$callback;
            evt.$callback = null;
            return callback.Run(evt, true);
          }
          return false;
        });
        break;
      }

      case "run":
      {
        var expr = ch.AttributeValue(childNode, "expr");

        if(ch.IsEmpty(expr))
          expr = $.trim(childNode.innerHTML);

        expr = _cheetah.RemoveExpressionDelimiters(expr);
        expr = this.ViewModel.CreateExpression(expr);
        
        this.SetActionStep(context, childNode, function(evt) 
        {
          var inject =  {};

          inject["$$target"] = evt.$model;

          expr.Eval(context, evt.$model, inject);   
          
          return true;
        });

        break;
      }

      case "writeconsole":
      {
        var txt = $.trim(childNode.innerHTML);

        txt = context.EvaluateText(this.ViewModel, txt);

        this.SetActionStep(context, childNode, function(evt) 
        {
          var injected = {};

          if(evt.$$result)
            injected.$$result = evt.$$result;

          Cheetah.Logger.Error(ch.Evaluate(txt, null, injected));           
        });

        break;
      }

      case "message":
      {
        var txt   = $.trim(childNode.innerHTML);
        var type  = ch.AttributeValue(childNode, "type");
        var title = ch.AttributeValue(childNode, "title");

        if(title)
          title = context.EvaluateText(this.ViewModel, title);

        txt = context.EvaluateText(this.ViewModel, txt);

        this.SetActionStep(context, childNode, function(evt) 
        {
          var injected = {};

          if(evt.$$result)
            injected.$$result = evt.$$result;

          txt = ch.Evaluate(txt, null, injected);

          if(title)
          title = ch.Evaluate(title, null, injected);

          switch(type)
          {
            case "error": vm.OnError(txt, title); break;
            default:      vm.OnInfo(txt, title); break;
          }
        });

        break;
      }

      case "confirm":
      {
        var msg = ch.AttributeValue(childNode, "message");
        var title = ch.AttributeValue(childNode, "title");

        if(title)
          title = context.EvaluateText(this.ViewModel, title);

        this.EvalChildConditionalSetter(context, childNode, "Confirm", msg, title);
        break;
      }

      case "validate":
      {
        var validator = new _cheetah.Validator(this.ViewModel, context, childNode, this);

        if(validator.IsValid)
        {
          this.Steps.push(function(evt) 
          {
            validator.Validate(evt);
          });
        }

        break;
      }

      case "redirect":
      {
        var url = $.trim(childNode.innerHTML);

        this.SetActionStep(context, childNode, function(evt) 
        {
          ch.Redirect(url);
        });

        break;
      }

      case "onfail":
      {
        if(this.Parent)
          this.OnFail = this.CreateChild(context, childNode);
  
        break;
      }

      case "delay":
      {
        var amt = EvalAttribute(context, childNode, "for");
        var childAction = this.CreateChild(context, childNode);

        this.SetActionStep(context, childNode, function(evt) 
        {
          var delay = Number(ch.Evaluate(amt));

          if(!ch.IsValidNumber(delay))
            delay = 100;

          setTimeout( function()
          {
            childAction.Run(evt);
          }, 
          delay);
        });

        break;
      }

      default:
        this.HandleCustomStep(context, childNode, stepName);
        break;
    }
  }

  /*****************************************************************************/
  _cheetah.Action.prototype.CreateChild = function(context, elem)
  {    
    if(!ch.IsEmpty(elem.childNodes))
    {
      var childAction = new _cheetah.Action(this.ViewModel, context, elem, this);

      if(childAction.Steps.length != 0)
        return childAction;
    }
    
    return null;
  }

  /*****************************************************************************/
  _cheetah.Action.prototype.HandleCustomStep = function(context, childNode, stepName)
  {  
    var step = _cheetah.ActionSteps[stepName];
    var self = this;

    if(!step)
      Cheetah.Logger.Warning("Unknown Action step: " + childNode.localName);
    else
    {
      var params = {};
      var childAction = null;
      var vm = this.ViewModel;

      if(step.ProcessAttributes)
        params = step.ProcessAttributes(childNode.attributes, childNode) || {};

      if(step.AllowChildren)
        childAction = this.CreateChild(context, childNode);

      this.SetActionStep(context, childNode, function(evt) 
      {
        try
        {
          if(step.IsAnimation)
            ++self.NumAnimations;

          var avm = vm.ActualViewModel;
          var evalParams = ch.Clone(params);

          // See if we need to evaluate any expression
          for(var attr in evalParams)
          {
            var val = evalParams[attr];

            if(_cheetah.IsCheetahExpression(val) || val == "$$target")
              evalParams[attr] = self.EvalExpression(evt, context, val);
          }

          if(childAction == null)
            return step.Run(evt, context.NewElement, avm, evalParams);

          var target = ch.IsValid(context.ParentContext) ? context.ParentContext.NewElement : null;

          evt.$$result = {};

          var fnError = null;

          if(childAction.OnFail)
            fnError = function() 
                      { 
                        childAction.OnFail.Run(evt); 
                      };

          return step.Run(evt, target, avm, evalParams, 
                          function() 
                          { 
                            childAction.Run(evt); 
                          },
                          fnError);
        }
        catch(e)
        {
          Cheetah.Logger.Error(e.description);
          return false;
        }
      });
    }
  }


/*****************************************************************************/
/*****************************************************************************/
_cheetah.ValidatorItem = function(vm, context, element)
{
  var _name         = ch.AttributeValue(element, "name");
  var _validators   = [];
  var _expr         = CreateCondition(vm, element);
  var _context      = context;

  this.IsValid = !ch.IsEmpty(_name);
  this.ErrorMessage = "";

  /*****************************************************************************/
  this.AddValidator = function(vm, element, name, fn)
  {  
    var value = ch.AttributeValue(element, name);

    if(!ch.IsEmpty(value))
      _validators.push( new ValidatorAttribute(vm, _context, element, name, value, fn));
  } 

  /*****************************************************************************/
  function ValidatorAttribute(vm, context, element, name, value, fn)
  {
    var _value = "";
    var _fn    = fn;

    this.ErrorMessage  = "";

    var index = value.indexOf(";");

    _value = value;

    if(index != -1)
    {
      this.ErrorMessage = context.EvaluateText(vm, value.substr(index+1));
      _value = context.EvaluateText(vm, value.substr(0, index));
    }

    /*****************************************************************************/
    this.Validate = function(vm, model) 
    {  
      var injected = {$$root: vm.Model};
      var val      = ch.Convert(ch.Evaluate(_value, model, injected));

      if(ch.IsEmpty(val))
        return true;

      return _fn(val, model);
    }
  }

  /*****************************************************************************/
  this.Validate = function(vm, evt, context, msgs, firstOnly) 
  {
    if(!EvalCondition(_expr, evt, context))
      return true;

    var model   = ch.Coalesce(evt.$model, context.Model);
    var isValid = true;

    model = ch.GetBindData(_name, model);

    _validators.ForEach( function(validator)
    {
      if(!validator.Validate(vm, model))
      {
        isValid = false;

        var injected = {$$root: vm.Model};

        msgs.push({
                    "Name": _name,
                    "Message": ch.Evaluate(validator.ErrorMessage, model, injected)
                  });

        if(firstOnly)
          return false;
      }

      return true;
    },
    true);

    return isValid;
  }

  /*****************************************************************************/
  // Constructor
  {
    if(!this.IsValid)
      Cheetah.Logger.Error("Validate action step is missing a name for Model item.");
    else
    {
      this.AddValidator(vm, element, "required", function(val, model)
      {
        return !val || !ch.IsEmpty(model);
      });

      this.AddValidator(vm, element, "minlength", function(val, model)
      {
        return val == 0 || (!ch.IsEmpty(model) && model.length >= val);
      });

      this.AddValidator(vm, element, "minvalue", function(val, model)
      {
        return Number(model) >= val;
      });

      this.AddValidator(vm, element, "maxvalue", function(val, model)
      {
        return Number(model) <= val;
      });
    } 
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.Validator = function(vm, context, element, parent)
{
  var _vm           = vm;
  var _context      = context;
  var _reportSilent = ch.Convert(ch.AttributeValue(element, "report-silent"));
  var _reportAll    = ch.Convert(ch.AttributeValue(element, "report-all"));
  var _reportTo     = ch.AttributeValue(element, "report-to");
  var _condition    = CreateCondition(vm, element);
  var _childAction  = null;
  var _failAction   = null;
  var _items        = [];

  this.IsValid = true;

  /*****************************************************************************/
  {
    element.childNodes.ForEach(function(childNode)
    {
      if(ch.IsValid(childNode.localName))
      {
        switch(childNode.localName.toLowerCase())
        {
          // Model is only thing we know how to validate
          case "model":
          {
            var item = new _cheetah.ValidatorItem(vm, _context, childNode);

            if(item.IsValid)
              _items.push(item);

            break;
          }

          case "onvalidate":
            _childAction = parent.CreateChild(context, childNode);
            break;

          case "onfail":
            _failAction = parent.CreateChild(context, childNode);
            break;

          default:
            Cheetah.Logger.Error("Unknown child step for Validate action step.");
            break;
        }
      }
    });
  }

  /*****************************************************************************/
  this.Validate = function(evt) 
  { 
    if(EvalCondition(_condition, evt, _context))
    {
      var msgs = [];
      var isValid = true;

      _items.ForEach( function(item)
      {
        if(!item.Validate(_vm, evt, _context, msgs, !_reportAll))
        {
          isValid = false;

          if(!_reportAll)
            return false;
        }

        return true;
      },
      true);

      if(!isValid)
      {
        if(!_reportSilent)
        {
          var msg = "Validation failed!";
  
          if(msgs.length > 0)
          {
            if(_reportAll)
            {
              if(ch.IsEmpty(_reportTo))
                msg = msgs.Pack("\r\n", function(item) {return item.Message;} );
              else
                msg = "<ul>" + msgs.Pack("\r\n", 
                                         function(item)
                                         {
                                           return "<li>" + item.Message + "</li>"
                                         }
                                        ) + "</ul>";
            }
            else
              msg = "<ul><li>" + msgs[0].Message + "</li></ul>";
          }
  
          if(ch.IsEmpty(_reportTo))
            _vm.OnError(msg);
          else
             $(_reportTo).html(msg);
        }

        if(_failAction)
        {
          evt.$$result = msgs;
          _failAction.Run(evt);
        }

        return;
      }

      if(_childAction != null)
        _childAction.Run(evt);
    }
  }
}

/*****************************************************************************/
function CreateCondition(vm, childNode)
{  
  var ifExpr = ch.AttributeValue(childNode, "if");

  if(!ch.IsEmpty(ifExpr))
    return(vm.CreateCondition(ifExpr));

  return null;
}

/*****************************************************************************/
function EvalCondition(condition, evt, context)
{
  if(condition == null)
    return(true);

  var model = ch.Coalesce(evt.$model, context.Model);
        
  return condition.Eval(context, model);
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.Watcher = function(vm)
{
  this.IsWatcher = true;
  this.ViewModel = vm;

  /*****************************************************************************/
  this.Eval = function(vm, force)
  {
    // Abstract method
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.ElementWatcher = function(vm, context)
{
  _cheetah.Watcher.call(this, vm);

  this.Context = context;

  /*****************************************************************************/
  this.ReRender = function(model, render, context, clear)
  {
    context = ch.Coalesce(context, this.Context);

    context.Clear(clear, clear);

    if(render == undefined || render)
    {
      context.Render(context.Element, model, true);

      this.ViewModel.ProcessDeferred();
    }
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.Property = function(prop, model)
{
  var _prop = (prop.indexOf(".") != -1) ? prop.split(".") : prop;
  var _model = model;

  /*****************************************************************************/
  this.SetValue = function(val)
  {  
    ch.SetModelValue(_model, _prop, val);
  }

  /*****************************************************************************/
  this.GetValue = function(model) 
  {
    if(_prop == "__expr__")
        return _prop;

    if(model)
      _model = model;

    return ch.GetModelValue(_model, _prop);
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.PropertyWatcher = function(vm, context)
{
  _cheetah.ElementWatcher.call(this, vm, context);

  var _updating = false;
  var _bind     = context.Bind;

  /*****************************************************************************/
  this.OnChange = function(newVal)
  {
    if(!_updating)
    {
      _updating = true;

      if(context.Deformat)
        newVal = ch.Evaluate(context.Deformat, null, {$$value: newVal});

      _bind.SetValue(newVal);
      this.ViewModel.UpdateView();
      _updating = false;
    }
  }

  /*****************************************************************************/
  this.OnBlur = function()
  {
    if(!_updating)
    {
      _updating = true;

       var newVal = Cheetah.Builder.GetValue(context.NewElement);

       newVal = ch.Evaluate(context.Format, null, {$$value: newVal});

      Cheetah.Builder.SetValue(context.NewElement, newVal);
      _updating = false;
    }
  }

  /*****************************************************************************/
  this.OnKeyPress = function(evt)
  {
    if(context.Filter.test(String.fromCharCode(event.keyCode)))
      return event.returnValue = true;

    return event.returnValue = false;
  }

  /*****************************************************************************/
  this.OnPaste = function(evt)
  {
    var txt = clipboardData.getData("text");

    if(txt)
    {
      var len = txt.length;

      for(var i = 0; i < len; ++i)
      {
        if(!context.Filter.test(txt[i]))
          return event.returnValue = false;
      }
    }

    return event.returnValue = true;
  }

  /*****************************************************************************/
  this.Eval = function(vm, force)
  {
    if(!_updating)
      _SetValue(this.Context);
  }

  /***************************************************************************************/
  function _SetValue(context) 
  {
    context.TransformMethod("SetValue", function(transform)
    {
      if(!context.Model.$$id)
        context.Model = vm.FixModel(context.Model);

      var val = _bind.GetValue(context.Model);

      if(context.Format)
        val = ch.Evaluate(context.Format, null, {$$value: val});

      if(!val)
        val = "";

      transform.SetValue(context.NewElement, val);
    });
  }

  /*****************************************************************************/
  {
    var bindings = _bind.split(":");

    if(bindings.length == 2)
      _bind = $.trim(bindings[0]);

    var self = this;
    var bindExpr = _bind;

    _bind = new _cheetah.Property(_bind, context.Model);

    context.TransformMethod("OnBind", function(transform)
    {
      transform.OnBind(context.NewElement, bindExpr, function(newVal)
      {
        self.OnChange(newVal);
      });
    });

    if(context.Transform.NewName == "input" || context.Transform.NewName == "textarea")
    {
      if(context.Format)
      {
        $(context.NewElement).on("blur", function()
        {
          self.OnBlur();
        });
      }

      if(context.Filter)
      {
        $(context.NewElement).on("keypress", function(evt)
        {
          return self.OnKeyPress(evt);
        });

        $(context.NewElement).on("paste", function(evt)
        {
          return self.OnPaste(evt);
        });
      }
    }
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.ModelWatcher = function(vm, context)
{
  _cheetah.ElementWatcher.call(this, vm, context);

  var _attributes = new Cheetah.KeyedSet();
  var _variables  = new Cheetah.KeyedSet();

  /*****************************************************************************/
  this.ModelChanged = function(model, newModel, clear)
  {
    var context = this.Context;

    model = ch.Coalesce(model, context.Model);

    if(!model)
      return true;

    var modelCompare = model;

    if(!ch.IsEmpty(model.$$path))
      modelCompare = ch.GetModelValue(model.$$parent, model.$$path, this.Context);

    if(!modelCompare || modelCompare.$$id == undefined || modelCompare.$$id != model.$$id)
    {
      if(modelCompare)
        modelCompare.$$parent = model.$$parent;
      else if(model.$$parent)
      {
        // Item is being deleted, force the parent to redraw
        delete model.$$parent.$$id;
        return true;
      }

      this.ReRender(modelCompare, null, null, clear);
      return(false);
    }

    if(newModel != undefined)
       newModel.Model = modelCompare;

    if(_attributes.IfAny( function(item)
    {
      return(item.Changed(model));
    }))
      return(true);

    return _variables.IfAny( function(item)
    {
      return(item.Changed(context));
    });
  }

  /*****************************************************************************/
  /*****************************************************************************/
  function AttributeWatch(context, attr)
  {
    this.Attribute = new _cheetah.Property(attr, context.Model);
    this.Value     = this.Attribute.GetValue();

    /*****************************************************************************/
    this.Changed = function(model)
    {
      var newVal  = this.Attribute.GetValue();

      if(newVal == "__expr__")
        return true;

      var changed = this.Value != newVal;

      this.Value = newVal;

      return(changed);
    }
  }

  /*****************************************************************************/
  /*****************************************************************************/
  function VariableWatch(context, name)
  {
    this.Name  = name;
    this.Value = context.GetVar(name);

    /*****************************************************************************/
    this.Changed = function(context)
    {
      var newVal  = context.GetVar(this.Name);
      var changed = this.Value != newVal;

      this.Value = newVal;

      return(changed);
    }
  }

  /*****************************************************************************/
  this.AddProperty = function(context, prop)
  {  
    if(!_attributes.Contains(prop))
      _attributes.Add(prop, new AttributeWatch(context, prop));
  }

  /*****************************************************************************/
  this.AddVariable = function(context, varr)
  {  
    if(!_variables.Contains(varr))
      _variables.Add(varr, new VariableWatch(context, varr));
  }

  /*****************************************************************************/
  this.AddProperties = function(context, props)
  {  
    if(ch.IsValid(props))
    {
      if(typeof props == "string")
        this.AddProperty(context, props);

      var self = this;

      if(ch.IsValid(props.length))
      {
        props.ForEach(function(item)
        {
          self.AddProperty(context, item);
        });
      }
    }
  }

  /*****************************************************************************/
  this.AddVars = function(context, vars)
  {  
    if(ch.IsValid(vars))
    {
      if(typeof vars == "string")
        this.AddVariable(context, vars);

      var self = this;

      if(ch.IsValid(vars.length))
      {
        vars.ForEach(function(item)
        {
          self.AddVariable(context, item);
        });
      }
    }
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.BindWatcher = function(context)
{
  _cheetah.ModelWatcher.call(this, context.ViewModel, context);

  var _vm        = context.ViewModel;
  var _rendered  = false;
  var _model     = CloneModel(context.EvaluateBind());

  this.BaseReRender = this.ReRender;
  this.BaseModelChanged = this.ModelChanged;

  /*****************************************************************************/
  this.ModelChanged = function()
  {
    _rendered = false;

    var newModel = {};
    var oldModel = _model;

    var checkModel = this.Context.EvaluateBind();

    if(checkModel)
    {
      checkModel.$$parent = this.Context.Model;

      if(oldModel)
        checkModel.$$path = oldModel.$$path;
    }

    if(this.BaseModelChanged(checkModel, newModel))
    {
      _model = CloneModel(checkModel);
      return(true);
    }

    return false;
  }

   /*****************************************************************************/
  this.ReRender = function(model, render, context, clear)
  {
    ForceRedraw(this.Context);
  }

  /*****************************************************************************/
  function ForceRedraw(context)
  {
    if(context.Children)
    {
      context.Children.ForEach
      (
        function(child)
        {
          if(context.Model && context.Model.$$id)
            delete context.Model.$$id;

          ForceRedraw(child);
        }
      );
    }
  }

  /*****************************************************************************/
  this.Eval = function(vm, force)
  {
    if(this.ModelChanged())
      this.ReRender(_model);
  }
}

/*****************************************************************************/
/*****************************************************************************/
function HasArrayChanged(newArray, oldArray)
{
  if(!newArray.$$parent || !newArray.$$id || !newArray.$$path)
    return true;

  if(oldArray)
  {
    if(oldArray.length != newArray.length)
      return true;

    if(oldArray.$$id != newArray.$$id)
      return true;

    if(oldArray.$$path != newArray.$$path)
      return true;
  }

  var len = newArray.length;

  for(var i = len-1; i >= 0; --i)
  {
    var child = newArray[i];

    if(!child.$$parent || !child.$$id)
      return true;

    if(child.$$index != i)
      return true;
  }

  return false;
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.BindArrayWatcher = function(context)
{
  _cheetah.ModelWatcher.call(this, context.ViewModel, context);

  var _model = context.EvaluateBind();
  var _len   = _model.length;

  /*****************************************************************************/
  this.FixArray = function(newModel, oldModel, sort)
  {  
    if(sort || newModel.length > _len || !newModel.$$parent || !newModel.$$id)
    {
      if(this.Context.Sort)
        ch.Sort(newModel, ch.Evaluate(this.Context.Sort));
    }

    _len = newModel.length;

    newModel.$$parent = this.Context.Model;
    newModel.$$path   = this.Context.BindPath;

    return newModel;
  }
  
  /*****************************************************************************/
  this.ModelChanged = function()
  {
    var checkModel = this.Context.EvaluateBind();

    if(_len != _model.length || checkModel && HasArrayChanged(checkModel, _model))
    {
      _model = this.FixArray(checkModel, _model, true);
      return true;
    }

    return false;
  }

  /*****************************************************************************/
  this.Eval = function(vm, force)
  {
    if(this.ModelChanged())
      this.ReRender(_model);
  }
}

  /*****************************************************************************/
  function CloneModel(model, oldModel)
  {  
    var newModel = ch.ShallowClone(model);
    FixArray(newModel, oldModel ? oldModel : model);

    return newModel;
  }
  
  /*****************************************************************************/
  function FixArray(arr, copy)
  {
    if(Array.isArray(arr))
    {
      var index = 0;
  
      arr.ForEach( function(item)
      {
        item.$$parent = arr;
        item.$$index = index++;
      });
    }

    if(copy)
      CopyCheetahAttributes(arr, copy)
  }

  /*****************************************************************************/
  function CopyCheetahAttributes(obj1, obj2)
  {
    obj1.$$id     = obj2.$$id;
    obj1.$$index  = obj2.$$index;
    obj1.$$parent = obj2.$$parent;
    obj1.$$path   = obj2.$$path;
  }

/*****************************************************************************/
/*****************************************************************************/
_cheetah.IfWatcher = function(vm, context)
{
  _cheetah.ElementWatcher.call(this, vm, context);

  var _if    = [];
  var _val   = [];
  var _model = ch.ShallowClone(context.Model);

  _if.push(context);
  _val.push(context.Condition.Eval(context));

  /*****************************************************************************/
  this.AddElse = function(context)
  {
    _if.push(context);
    _val.push(context.Condition.Eval(context));
  }

  /*****************************************************************************/
  this.Eval = function(vm, force)
  {
    this.Context.ProcessElement(true, null);
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.TextExpression = function(vm, context, text)
{
  this.ViewModel      = vm;
  this.Context        = context;
  this.OriginalText   = text;
  this.Parts          = [];
  this.Expressions    = [];

  this.Init(text);
}

  /*****************************************************************************/
  _cheetah.TextExpression.prototype.Evaluate = function(model, injected)
  {
    if(this.Expressions.length == 0)
      return(this.Parts.Pack(""));

    if(this.Expressions.length == 1 && this.Parts.length == 1)
      return this.Parts[0].Eval(this.Context, model, injected);

    var self = this;

    return(this.Parts.Reduce
    (
      function(str, part)
      {
        if(typeof part == "string")  
          return(str + part);

        return(str + ch.NormalizeText(part.Eval(self.Context, model, injected)))
      },          
      ""
    ));
  }

  /*****************************************************************************/
  // Constructor
  _cheetah.TextExpression.prototype.Init = function(text)
  {
    var index    = text.indexOf(Cheetah.StartDelimiter);
    var original = text;

    while(index != -1)
    {
      if(index > 0)
        this.Parts.push(text.substr(0, index));

      text = text.substr(index + Cheetah.StartDelimiter.length);

      index = text.indexOf(Cheetah.EndDelimiter)

      if(index == -1) // This would be a syntax error
        break;

      var varName = $.trim(text.substr(0, index));

      text = text.substr(index + Cheetah.EndDelimiter.length);

      var expr = this.ViewModel.CreateExpression(varName);

      this.Parts.push(expr);
      this.Expressions.push(expr);

      index = text.indexOf(Cheetah.StartDelimiter)
    }

    if(text != "")
      this.Parts.push(text);

    return;
  }


/*****************************************************************************/
/*****************************************************************************/
_cheetah.TextExpressionWatcher = function(vm, context, texpr, index)
{
  _cheetah.ModelWatcher.call(this, vm, context);

  var _expression = (typeof texpr == "string") ? new _cheetah.TextExpression(vm, context, texpr) : texpr;

  /*****************************************************************************/
  this.Eval = function(vm, force)
  {
    if(force || this.ModelChanged())
      this.Resolve( _expression.Evaluate());
  }

  /*****************************************************************************/
  this.Resolve = function(newVal)
  {
  }

  /*****************************************************************************/
  // Constructor
  {
    var self = this;

    _expression.Expressions.ForEach( function(expr)
    {
      self.AddProperties(context, expr.ModelTokens);
      self.AddVars(context, expr.VarTokens);
    });
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.TextNodeWatcher = function(vm, context, texpr)
{
  _cheetah.TextExpressionWatcher.call(this, vm, context, texpr);

  /*****************************************************************************/
  this.Resolve = function(newVal)
  {
    this.Context.RenderText(null, null, newVal);
    this.Context.OnChange();
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.AttributeNodeWatcher = function(vm, context, name, texpr)
{
  _cheetah.TextExpressionWatcher.call(this, vm, context, texpr);

  var _name = name;

  /*****************************************************************************/
  this.Resolve = function(newVal)
  {
    this.Context.SetAttribute(_name, newVal);
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.VariableWatcher = function(vm, context, name, texpr)
{
  _cheetah.TextExpressionWatcher.call(this, vm, context, texpr);

  var _name = name;

  /*****************************************************************************/
  this.Resolve = function(newVal)
  {
    this.Context.SetVar(_name, newVal);
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.ClassWatcher = function(vm, context, expr)
{
  _cheetah.ModelWatcher.call(this, vm, context);

  this.Static = context.EvaluateText(vm, ch.AttributeValue(context.NewElement, "class"));
  this.Parts  = [];
  
  /*****************************************************************************/
  this.Eval = function(vm, force)
  { 
    if(force || this.ModelChanged())
    {
      var self = this;

      this.Parts.ForEach
      (
        function(cs)
        {
          return !cs.Set(self.Context, self.Static);
        },
        true
      );
    }
  }

  /*****************************************************************************/
  // Constructor
  { 
    var parts = expr.split(",");
    var self  = this;

    parts.ForEach( function(p) 
    { 
      var cs = new AttributeSetter(p);

      self.Parts.push(cs); 

      if(cs.Condition != null)
      {
        self.AddProperties(context, cs.Condition.ModelTokens);
        self.AddVars(context, cs.Condition.VarTokens);
      }
    });
  }

  /*****************************************************************************/
  /*****************************************************************************/
  function AttributeSetter(expr)
  {
    var indx = expr.indexOf(":");

    if(indx == -1)
    {
      this.Name = expr;
      this.Condition = null;
    }
    else
    {
      this.Name = $.trim(expr.substr(0, indx));
      this.Condition = vm.CreateCondition(expr.substr(indx+1));
    }

    /*****************************************************************************/
    this.Set = function(context, staticC)
    {
      var set = this.Condition == null;

      if(!set)
        set = this.Condition.Eval(context);

      var c = "";

      if(!ch.IsEmpty(staticC))
          c = ch.Evaluate(staticC) + " ";

      if(set)
        c += this.Name;

      context.NewElement.className = $.trim(c);

      return(set);
    }
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.StyleWatcher = function(vm, context, expr)
{
  _cheetah.ModelWatcher.call(this, vm, context);

  this.Static = context.EvaluateText(vm, ch.AttributeValue(context.NewElement, "style"));
  this.Parts  = [];
  
  /*****************************************************************************/
  this.Eval = function(vm, force)
  { 
    if(force || this.ModelChanged())
    {
      var self =  this;
      
      // First do the static parts
      if(!ch.IsEmpty(this.Static))
      {
        var staticParts = this.Static.split(";");
 
        staticParts.ForEach
        (
          function(style)
          {
            var parts = style.split(":");

            Cheetah.Builder.css(self.Context.NewElement, parts[0], parts[1]);
          }
        );
      }

      // Then do dynamic parts (they'll override static if the same name)
      this.Parts.ForEach
      (
        function(ss)
        {
          var val = ss.Eval(self.Context);

          Cheetah.Builder.css(self.Context.NewElement, ss.Name, val);
        }
      );
    }
  }

  /*****************************************************************************/
  // Constructor
  { 
    var parts = expr.split(";");
    var self  = this;

    parts.ForEach( function(p) 
    { 
      var ss = new StyleSetter(p);

      self.Parts.push(ss); 
      self.AddProperties(context, ss.Expression.ModelTokens);
    });
  }

  /*****************************************************************************/
  /*****************************************************************************/
  function StyleSetter(expr)
  {
     var indx = expr.indexOf(":");

     this.Name       = $.trim(expr.substr(0, indx));
     this.Expression = vm.CreateExpression(expr.substr(indx+1));

     /*****************************************************************************/
     this.Eval = function(context)
     {
       return this.Expression.Eval(context);
     }
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.AttributeWatcher = function(vm, context, name, expr, type)
{
  _cheetah.ModelWatcher.call(this, vm , context);

  var _isConditional = type == 1;
  var _name          = name;
  var _expression    = type == 1 ? vm.CreateCondition(expr) : vm.CreateExpression(expr);

  /*****************************************************************************/
  this.Eval = function(vm, force)
  {
    if(force || this.ModelChanged())
    {
      var res = _expression.Eval(this.Context);

      if(_isConditional)
      {
        if(res)
          this.Context.SetAttribute(_name, _name);
        else
          this.Context.Builder.RemoveAttribute(this.Context.NewElement, _name);
      }
      else
          this.Context.SetAttribute(_name, res);
    }
  }

  /*****************************************************************************/
  // Constructor
  {
    if(!ch.IsEmpty(_expression.ModelTokens))
      this.AddProperties(context, _expression.ModelTokens);
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.HtmlWatcher = function(vm, context, modelName)
{
  _cheetah.ModelWatcher.call(this, vm, context);

  var _modelName = modelName;
  var _context   = context;
  var _model     = ch.GetModelValue(context.Model, _modelName, context);

  /*****************************************************************************/
  this.ReRender = function(model)
  {
    _context.Builder.SetContents(_context.NewElement, model ? model : "");
  }

  /*****************************************************************************/
  this.Eval = function(vm, force)
  {
    var model  = _context.Model;

    if(model.$$parent && model.$$path)
      model = model.$$parent[model.$$path];

    var newVal = ch.GetModelValue(model, _modelName, _context);

    if(force || newVal != _model)
      this.ReRender(_model = newVal);
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.VisibilityWatcher = function(vm, context, cond)
{
  _cheetah.ElementWatcher.call(this, vm, context);

  this.Condition      = vm.CreateCondition(cond);
  this.HideAction     = null;
  this.ShowAction     = null;
  this.PreviousResult = undefined;

  context.VisibilityWatcher = this;

  /*****************************************************************************/
  this.Eval = function(vm, forceResult)
  { 
    var result = this.Condition.Eval(this.Context);

    if(forceResult || this.PreviousResult == undefined || result != this.PreviousResult)
    {
      var action = result ? this.ShowAction : this.HideAction;

      this.PreviousResult = result;

      if(action != null)
      {
        action.Run();

        if(action.NumAnimations > 0)
          return;
      }

      Cheetah.DOMBuilder.prototype.ShowElement(this.Context.NewElement, result);
    }
  }
}

  /*****************************************************************************/
  /*****************************************************************************/
  function IdentityTransform(name)
  {
    Cheetah.Transform.call(this);

    this.Name       = name;
    this.NewName    = name;
    this.IsEditable = name == "input" || name == "select" || name == "textarea";
    this.IsIdentity = true;
    this.IgnoreText = false;
  }

/*****************************************************************************/
/*****************************************************************************/
Cheetah.Transform = function()
{
  /*****************************************************************************/
  this.GetValue = function(elem)
  {
    return Cheetah.Builder.GetValue(elem);
  }

  /*****************************************************************************/
  this.SetValue = function(elem, val)
  {
    Cheetah.Builder.SetValue(elem, val);
  }

  /*****************************************************************************/
  this.OnBind = function(elem, bindExpr, onchange)
  {
    var evts = [ "change" ];

    switch(this.NewName)
    {
      case "textarea": 
        evts.push("keyup");
        evts.push("paste");
        evts.push("cut");
        break;

      case "input":
      {
        switch(elem.type)
        {
          case "text":  
          case "password":  
          case "email":  
          case "date":  
          case "number":  
          case "url":  
            evts.push("keyup"); 
            evts.push("paste"); 
            evts.push("cut"); 
            evts.push("input"); 
            break;

          default:      
            break;
        }
      }
    }

    var bindings = bindExpr.split(":");

    if(bindings.length == 2)
    {
      evts = evts.splice(0, evts.length);
      evts.push($.trim(bindings[1]));
    }

    var self = this;

    evts.ForEach( function(evt)
    {
      if(evt)
      {
        $(elem).on(evt, function(evt) 
        { 
          var val = self.GetValue(ch.EventTarget(evt));

          onchange(val);
        });
      }
    });
  }
}

/*****************************************************************************/
/*** Begin Cheetah.Service                                                 ***/
/*****************************************************************************/  

Cheetah.Service = function()
{
  this.RootFolder = ch.UrlRoot();
}

  /***************************************************************************************/
  Cheetah.Service.prototype.GetResult = function(response)
  {
    if(!ch.IsValid(response))
      return(null);

    if(ch.IsValid(response.Result))
      return(response.Result);

    return(response);
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.IsResultError = function(result)
  {
    return(ch.IsValid(result.Errors) || ch.IsValid(result.Error));
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.GetErrorResult = function(result)
  {
    return(result);
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.OnError = function(result, err_callback)
  {
    if(ch.IsValid(err_callback))
      err_callback(result);
    else
      alert(result);
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.NormalizeUrl = function(url, folder)
  {  
    url = url.replaceAll("\\" , "/");

    if(url.indexOf("~") == -1)
    {
      if(url.indexOf("/") == -1 && !ch.IsEmpty(folder))
        return(this.RootFolder.EnsureEndsWith("/") + (folder ? folder + "/" : "") + url);

      return(url);
    }

    return(url.replace("~/", this.RootFolder.EnsureEndsWith("/")));
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.LoadModel = function(url, verb, params, callback, err_callback)
  {  
    this.QueryFolder(url, verb, "models", params, callback, err_callback, "LoadModel");
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.LoadView = function(url, verb, params, callback, err_callback)
  {  
    this.QueryFolder(url, verb, "views", params, callback, err_callback, "LoadView");
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.DoAction = function(url, params, callback, err_callback)
  { 
    this.QueryFolder(url, "POST", "actions", params, callback, err_callback, "DoAction");
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.QueryFolder = function (url, verb, folder, params, callback, err_callback, name)
  {  
    if(verb == "POST" || verb == "GET")
      this.Query(this.NormalizeUrl(url, folder), verb, params, callback, err_callback);
    else
      Cheetah.Logger.Error("Only 'POST' or 'GET' for Cheetah.Service." + name);
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.Post = function(url, params, callback, err_callback)
  {
    this.Query(url, "POST", params, callback, err_callback);
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.Put = function(url, params, callback, err_callback)
  {
    this.Query(url, "PUT", params, callback, err_callback);
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.Get = function(url, callback, err_callback)
  {
    this.Query(url, "GET", null, callback, err_callback);
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.Delete = function(url, callback, err_callback)
  {
    this.Query(url, "DELETE", null, callback, err_callback);
  }

  /***************************************************************************************/
  Cheetah.Service.prototype.Query = function(url, verb, params, callback, err_callback, options)
  {
    var self = this;

    if(!options)
      options = {};

    options.url    = url;
    options.method = verb;
    options.data   = params;

    jQuery.ajax(options)
                .done
                (
                  function(result)
                  {
                    result = self.GetResult(result);

                    if(ch.IsValid(result))
                    {
                      if(self.IsResultError(result))
                        self.OnError(self.GetErrorResult(result), err_callback);
                      else if(ch.IsValid(callback))
                        callback(result);
                    }
                  }
                ).fail
                (
                  function(jqXHR, textStatus, errorThrown)
                  {
                    if(errorThrown == "Not Found")
                      errorThrown += ": " + url;

                    self.OnError(errorThrown, err_callback);
                  }
                );
  }

/*****************************************************************************/
/*** End Cheetah.Service                                                   ***/
/*****************************************************************************/  

/*****************************************************************************/
/*****************************************************************************/
_cheetah.Route = function(vm, data, defaults)
{
  var _name            = data.Name;
  var _target          = ch.Coalesce(data.Target,     defaults.Target);
  var _model           = ch.Coalesce(data.Model,      defaults.Model);
  var _modelVerb       = ch.Coalesce(data.ModelVerb,  defaults.ModelVerb, "POST");
  var _viewModelName   = ch.Coalesce(data.ViewModel,  defaults.ViewModel);
  var _viewPath        = ch.Coalesce(data.View,       defaults.View);
  var _viewVerb        = ch.Coalesce(data.ViewVerb,   defaults.ViewVerb, "POST");
  var _routeTable      = ch.Coalesce(data.RouteTable, defaults.RouteTable);

  var _viewModel       = null;
  var _view            = null;
  var _parentViewModel = vm;
  var _createViewModel = null;
  
  /*****************************************************************************/
  this.Run = function(callback, runFirstSubRoute)
  {
    var self = this;
    var ver = "?v=" + Math.floor(Math.random() * 100);

    if(_view == null && !ch.IsEmpty(_viewPath))
    {
      _parentViewModel.CreateService().LoadView(_viewPath + ver, _viewVerb, null, function(result)
      {
        _view = result;
        self.Run(callback, runFirstSubRoute);
      });

      return;
    }

    if(_viewModel == null)
    {
      _viewModel = _createViewModel();
      _viewModel.ModelPath = _model + ver;
      _viewModel.ModelVerb = _modelVerb;
      _viewModel.Template  = _view;
    }

    if(!ch.IsEmpty(_routeTable) && !_viewModel.HaveRoutes())
    {
      _viewModel.LoadRouteTable(_routeTable, function()
      {
        self.Run(callback, runFirstSubRoute);
      });

      return;
    }

    var cb = callback;
    var self = this;

    if(runFirstSubRoute)
      cb = function()
      {
        if(ch.IsValid(_viewModel.FirstSubRoute))
          _viewModel.FirstSubRoute.Run(callback);
        else
          ch.Do(callback);
      };

    _viewModel.LoadModel(null, cb);
  }

  /*****************************************************************************/
  // Constructor
  {
    var vmName = "Cheetah.ViewModel";

    if(!ch.IsEmpty(_viewModelName))
      vmName = _viewModelName;

    var code = "return new " + vmName + "('" + _target + "')";

    _createViewModel = new Function(code);

    // Preload the view if it's just a pre-loaded template
    if(!ch.IsValid(_viewPath) && ch.IsValid(_target))
      _view = $("#" + _target).html();
  }
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.LoadFileTask = function(svc, path)
{
  Cheetah.Task.call(this);

  var _svc  = svc;
  var _path = path;

  this.Html = "";

  /***************************************************************************************/
  this.Start = function()
  {
    var self = this;

    _svc.Get( _svc.NormalizeUrl(_path), 
              function(data)
              {
                self.Html = data;
                self.Complete = true;
                self.OnComplete();
              }, 
              function(err)
              {
                Cheetah.Logger.Error(err);
                self.Complete = true;
                self.OnComplete();
              }
             );
  }
}

/***************************************************************************************/
_cheetah.RequireAttribute = function(elem, name, msg, fn)
{
  var attr = ch.AttributeValue(elem, name);

  if(ch.IsEmpty(attr))
  {
    if(msg)
      Cheetah.Logger.Error(msg);

    return false;
  }

  if(fn)
    fn(attr);

  return true;
}

/***************************************************************************************/
_cheetah.RequireContent = function(elem, msg, fn)
{
  var txt = Cheetah.Builder.InnerText(elem);

  if(ch.IsEmpty(txt))
  {
    if(msg)
      Cheetah.Logger.Error(msg);

    return false;
  }

  if(fn)
    fn(txt);

  return true;
}

/*****************************************************************************/
_cheetah.IsCheetahExpression = function(text)
{   
  if(!text || typeof text !== "string")
    return false;

  var index = text.indexOf(Cheetah.StartDelimiter);

  if(index == -1)
    return false;

  var index2 = text.indexOf(Cheetah.EndDelimiter, index + Cheetah.StartDelimiter.length);

  return index2 != -1;
}

/*****************************************************************************/
_cheetah.RemoveExpressionDelimiters = function(text)
{   
  text = $.trim(text);
  
  if(text.indexOf(Cheetah.StartDelimiter) == 0)
  {
    text = text.substr(Cheetah.StartDelimiter.length);

    if(text.lastIndexOf(Cheetah.EndDelimiter) == (text.length - Cheetah.EndDelimiter.length))
      text = text.substr(0, text.length - Cheetah.EndDelimiter.length);
  }

  return text;
}

/*****************************************************************************/
/*****************************************************************************/
_cheetah.TemplateReference = function(html)
{
  this.Html = html;
  this.Template = null;
}
  
  /*****************************************************************************/
  _cheetah.TemplateReference.prototype.GetTemplate = function(vm)
  {
    if(!this.Template)
      this.Template = vm.CreateTemplate(this.Html);

    return this.Template;
  }
  
/*****************************************************************************/
var LoadTemplates = new function()
{ 
  var _includes = [];

  /***************************************************************************************/
  /***************************************************************************************/
  var TemplateLoader = new function()
  {
    this.IsMet = false;

    // Let it be known there is async work that needs to be done
    Cheetah.RegisterPrerequisite(this);

    /***************************************************************************************/
    this.Start = function(newDiv)
    {
      Cheetah.Builder.ProcessElementsByName
      (
        "ch-template", 
        function(item)
        {
          _cheetah.RequireAttribute(item, "name", "Missing template name", function(name)
          {
            _cheetah.Templates[name] = new _cheetah.TemplateReference(Cheetah.Builder.InnerHTML(item));
          });
        },
        true
      );

      this.IsMet = true;
    }
  }

  /***************************************************************************************/
  /***************************************************************************************/
  var ActionLoader = new function()
  {
    this.IsMet = false;

    // Let it be known there is aysnc work that needs to be done
    Cheetah.RegisterPrerequisite(this);

    /***************************************************************************************/
    this.Start = function(newDiv)
    {
      if(newDiv)
      {
        newDiv.childNodes.ForEach( function(item)
        {
          if(item && item.localName && item.localName == "ch-action")
          {
            _cheetah.RequireAttribute(item, "name", "Missing action name", function(name)
            {
              _cheetah.Actions[name] = item;
            });
          }
        });

        Cheetah.Builder.RemoveFromParent(newDiv);
      }

      this.IsMet = true;
    }
  }

  /***************************************************************************************/
  /***************************************************************************************/
  var IncludeFilesLoader = new function()
  {  
     this.IsMet = false;

    // Let it be known there is aysnc work that needs to be done
    Cheetah.RegisterPrerequisite(this);

    /***************************************************************************************/
    this.Start = function(newDiv)
    {
      var svc      = new Cheetah.Service();
      var self     = this;    
      var taskList = new Cheetah.TaskList(999999);
      var tasks    = [];

      _includes.ForEach( function(path)
      {
        var task = new _cheetah.LoadFileTask(svc, path);

        tasks.push(task);
        taskList.Add(task);
      });

      taskList.Run(function()
      {
        var sb = new Cheetah.StringBuilder();

        tasks.ForEach( function(item)
        {
          sb.Append(item.Html);
        });

        newDiv.innerHTML = sb.ToString("\r\n");
      
        self.IsMet = true;
        TemplateLoader.Start(newDiv);
        ActionLoader.Start(newDiv);
      });
    }
  }

  /***************************************************************************************/
  function _LoadIncludes(includes)
  {  
    var newDiv = null;

    if(Cheetah.Builder.ProcessElementsByName
    (
      "ch-include", 
      function(item)
      {
        _cheetah.RequireContent(item, "Missing include path", function(path) 
        {
          includes.push(path);
        });
      },
      true
    ) > 0)
    {
      var body   = Cheetah.Builder.FirstElementByName("body");     
      var newDiv = Cheetah.Builder.AppendChild(body, "div", function(elem)
      {
        elem.style.display = "none";
      });
    }

    return(newDiv)
  }

  /***************************************************************************************/
  this.Init = function()
  {
    var self = this;          
    
    // Load all include paths
    var newDiv = _LoadIncludes(_includes);       

    if(_includes.length != 0)
      IncludeFilesLoader.Start(newDiv)   
    else
    {
      IncludeFilesLoader.IsMet = true;
      TemplateLoader.Start(newDiv); 
      ActionLoader.Start(newDiv); 
    }
  }
}

/***************************************************************************************/
/***************************************************************************************/
$(document).ready(function () 
{
  Cheetah.Builder = new Cheetah.DOMBuilder();
  Cheetah.Logger  = new Cheetah.ConsoleLogger();

  LoadTemplates.Init();

  try
  {
    var body = Cheetah.Builder.FirstElementByName("body");      
    var mode = Cheetah.Builder.GetAttribute(body, "ch-mode", true);

    if(mode == "auto")
    {
      var rt = Cheetah.Builder.GetAttribute(body, "ch-route-table", true);

      if(!ch.IsEmpty(rt))
      {
        var vm = new Cheetah.ViewModel("body");

        vm.LoadRouteTable(rt, null, true);
      }
    } 
  }
  catch(e)
  {
    Cheetah.Logger.Error(e.description);
  }
  
});

}(Cheetah, document);

