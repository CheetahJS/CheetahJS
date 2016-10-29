
! function(Cheetah, document) {

"use strict";

/*****************************************************************************/
/*****************************************************************************/
Cheetah.StringBuilder = function(s)
{
  this._parts = [];

  /*****************************************************************************/
  // Constructor
  {
    if(ch.IsValid(s))
      this.Append(s);
  }
}

  /*****************************************************************************/
  Cheetah.StringBuilder.prototype.Clear = function(s)
  {
    this._parts = [];
  }

  /*****************************************************************************/
  Cheetah.StringBuilder.prototype.Append = function(s)
  {
    this._parts.push(s);
  }

  /*****************************************************************************/
  Cheetah.StringBuilder.prototype.AppendLine = function(s)
  {
    this.Append(s + "\r\n");
  }

  /*****************************************************************************/
  Cheetah.StringBuilder.prototype.ToString = function(sep)
  {
    if(!ch.IsValid(sep))
      sep = "";

    return(this._parts.join(sep));
  }

  /*****************************************************************************/
  Cheetah.StringBuilder.prototype.ForEach = function(fn, stop)
  {
    return this._parts.ForEach(fn, stop);
  }

  /*****************************************************************************/
  Cheetah.StringBuilder.prototype.Replace = function(i, part)
  {
    this._parts[i] = part;
  }

/*****************************************************************************/
/*****************************************************************************/
Cheetah.KeyedSet = function()
{
  var _list = [];
  var _dict = {};

  /*****************************************************************************/
  this.Add = function(k, v)
  {
    if(!this.Contains(k))
    {
      _list.push(v);
      _dict[k] = v;
    }
  }

  /*****************************************************************************/
  this.Contains = function(k)
  {
    return(_dict[k] != undefined);
  }

  /*****************************************************************************/
  this.IfAny = function(fn)
  {
    return(_list.IfAny(fn));
  }
}

/***************************************************************************************/
/***************************************************************************************/
Cheetah.Session = new function()
{
  /***************************************************************************************/
  this.SetValue = function(id, value, expires)
  {
    if(typeof(Storage) !== "undefined")
      sessionStorage.setItem(id, value);
    else
      Cheetah.Cookie.SetValue(id, value); // Expires on browser close
  }

  /***************************************************************************************/
  this.GetValue = function(id)
  {
    if(typeof(Storage) !== "undefined")
      return(sessionStorage.getItem(id));

    // Fallback
    return(Cheetah.Cookie.GetValue(id)); 
  }

  /***************************************************************************************/
  this.GetClearValue = function(id)
  {
    var val = this.GetValue(id); 

    this.ClearValue(id);

    return(val);
  }

  /***************************************************************************************/
  this.GetInt = function(id)
  {
    var val = this.GetValue(id);

    if(ch.IsEmpty(val))
      return(0);

    return(parseInt(val));
  }

  /***************************************************************************************/
  this.ClearValue = function(id)
  {
    if(typeof(Storage) !== "undefined")
      sessionStorage.removeItem(id);
    else
      Cheetah.Cookie.ClearValue(id); 
  }
}

/***************************************************************************************/
/***************************************************************************************/
Cheetah.Storage = new function()
{
  /***************************************************************************************/
  this.SetValue = function(id, value)
  {
    if(typeof(Storage) !== "undefined")
      localStorage.setItem(id, value);
    else
      Cheetah.Cookie.SetValue(id, value, 3650 * 24 * 60); // Expires in 10 years
  }

  /***************************************************************************************/
  this.GetValue = function(id)
  {
    if(typeof(Storage) !== "undefined")
      return(localStorage.getItem(id));

    // Fallback
    return(Cheetah.Cookie.GetValue(id)); 
  }

  /***************************************************************************************/
  this.GetClearValue = function(id)
  {
    var val = this.GetValue(id); 

    this.ClearValue(id);

    return(val);
  }

  /***************************************************************************************/
  this.GetInt = function(id)
  {
    var val = this.GetValue(id);

    if(ch.IsEmpty(val))
      return(0);

    return(parseInt(val));
  }

  /***************************************************************************************/
  this.ClearValue = function(id)
  {
    if(typeof(Storage) !== "undefined")
      localStorage.removeItem(id);
    else
      Cheetah.Cookie.ClearValue(id); 
  }
}

/***************************************************************************************/
/***************************************************************************************/
Cheetah.Cookie = new function()
{
  /***************************************************************************************/
  this.SetValue = function(name, value, expires)
  {
    if (!expires)
      document.cookie = name + "=" + escape(value);
    else
    {
      // If value is already a full cookie string
      if(!ch.IsEmpty(value) && value.indexOf("=") != -1 && !ch.IsValid(expires))
        document.cookie = value;
      else if(ch.IsValid(expires))
      {
        var dtExpires = new Date( Date.now() + (expires ? (expires * 60000) : 0));

        document.cookie = name + "=" + escape(value) + ";expires=" + dtExpires.toUTCString();
      }
      else
        document.cookie = name + "=" + escape(value); // Expires on browser close
    }
  }

  /***************************************************************************************/
  this.GetValue = function(name)
  {
    if(document.cookie.length > 0)
    {
      var iStart = document.cookie.indexOf(name + "=");

      if(iStart != -1)
      {
        iStart += name.length + 1;

        var iEnd = document.cookie.indexOf(";", iStart);

        if(iEnd == -1)
          iEnd = document.cookie.length;

        return unescape(document.cookie.substring(iStart, iEnd));
      }
    }

    return "";
  }

  /***************************************************************************************/
  this.GetClearValue = function(name)
  {
    var val = this.GetValue(name); 

    this.ClearValue(name);

    return(val);
  }

  /***************************************************************************************/
  this.GetInt = function(name)
  {
    var val = this.GetValue(name);

    if(ch.IsEmpty(val))
      return 0;

    return(parseInt(val));
  }

  /***************************************************************************************/
  this.ClearValue = function(id)
  {
    this.SetValue(id, "", -1000);
  }
}

/***************************************************************************************/
/***************************************************************************************/
Cheetah.Task = function(callback)
{
  var _taskFunction = callback;

  this.OnComplete   = null;
  this.Complete     = false;

  /***************************************************************************************/
  this.Start = function()
  {
    var self = this;

    if(_taskFunction)
    {
      try
      {
        _taskFunction(function()
                       {
                        if(ch.IsValid(self.OnComplete))
                          self.OnComplete();
                     
                        self.Complete = true;
                       });
      }
      catch(e)
      {
        alert(e.description);
      }
    }
  }
}
 
/***************************************************************************************/
/***************************************************************************************/
Cheetah.TaskList = function(max)
{
  var _tasks    = [];
  var _running  = 0;
  var _inRun    = false;
  var _maxTasks = (max == undefined) ? 8 : max;

  /***************************************************************************************/
  this.Add = function(task)
  {
    var self = this;

    task.OnComplete = function() {self.TaskComplete(); }
    _tasks.push(task);
  }

  /***************************************************************************************/
  this.Run = function(onComplete)
  {
    _run();

    var self = this;

    if(onComplete)
    {
      if(_running == 0 && _tasks.length == 0)
        onComplete();
      else
      {
        setTimeout( function()
        {
          self.Run(onComplete);
        }, 
        10);
      }
    }
  }

  /***************************************************************************************/
  var _run = function()
  {
    if(!_inRun)
    {
      _inRun = true;

      try
      {
        while(_tasks.length > 0 && _running < _maxTasks)
        {
          var task = _tasks.shift();

          ++_running;

          task.Start();
        }
      }
      catch(e)
      {
      }

      _inRun = false;
    }
  }

  /***************************************************************************************/
  this.TaskComplete = function()
  {
    if(--_running < _maxTasks)
      _run();  // Do next task
  }
}
 
/*****************************************************************************/
/*****************************************************************************/  
Cheetah.ConsoleLogger = function()
{
}

  /*****************************************************************************/  
  Cheetah.ConsoleLogger.prototype.Error = function(msg)
  {
    console.error("CheetahJS: " + msg);
  }

  /*****************************************************************************/  
  Cheetah.ConsoleLogger.prototype.Warning = function(msg)
  {
    console.warn("CheetahJS: " + msg);
  }

  /*****************************************************************************/  
  Cheetah.ConsoleLogger.prototype.Log = function(msg)
  {
    console.log("CheetahJS: " + msg);
  }

/*****************************************************************************/
/*****************************************************************************/  
Cheetah.DOMBuilder = function()
{
}

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.GetValue = function(element)
  {
    var val = null;

    if(element.localName == "select")
      val = element.options[element.selectedIndex].value;
    else if(element.localName == "input" && (element.type == "checkbox" || element.type == "radio"))
      return element.checked;
    else
      val = element.value;

    return ch.Convert(val);
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.SetValue = function(element, val)
  {
    if(element.localName == "input" && (element.type == "checkbox" || element.type == "radio"))
      element.checked = val;
    else
      $(element).val(val);
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.FindElement = function(id)
  {
    if(ch.IsEmpty(id))
      return null;

    return document.getElementById(id);
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.GetContents = function(element)
  {
    return element.innerHTML;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.SetContents = function(element, val)
  {
    if(element.nodeName == "#text")
      element.nodeValue = val;
    else
      element.innerHTML = val;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.AppendChild = function(parent, childName, fn)
  {
    var newElement = parent.ownerDocument.createElement(childName);  
        
    if(fn)
      fn(newElement);

    parent.appendChild(newElement);   

    return newElement;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.InsertBefore = function(before, childName)
  {
    var newElement = before.ownerDocument.createElement(childName);  
        
    before.parentNode.insertBefore(newElement, before);   

    return newElement;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.InsertAfter = function(afterThis, childName)
  {
    return _InsertAfter(afterThis, afterThis.ownerDocument.createElement(childName));
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.MoveElement = function(element, newParent)
  {
    element.parentElement.removeChild(element);  
        
    newParent.appendChild(element);   

    return element;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.AppendText = function(parent, txt)
  {
    var newElement = parent.ownerDocument.createTextNode(txt);  
        
    parent.appendChild(newElement);   

    return newElement;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.RenderText = function(element, insert, renderParent, txt)
  {
    if(element)
    {
      this.SetContents(element, txt);
      return element;
    }

    if(insert && renderParent)
      return this.InsertTextBefore(renderParent, txt);

    if(renderParent)
      return this.AppendText(renderParent, txt);         
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.InsertTextBefore = function(before, txt)
  {
    var newElement = before.ownerDocument.createTextNode(txt);  
        
    before.parentNode.insertBefore(newElement, before);   

    return newElement;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.InsertTextAfter = function(afterThis, txt)
  {
    return _InsertAfter(afterThis, afterThis.ownerDocument.createTextNode(txt));
  }

  /*****************************************************************************/  
  function _InsertAfter(afterThis, newNode)
  {
    var before = afterThis.nextSibling;

    if(before)
      before.parentNode.insertBefore(newNode, before);   
    else
      afterThis.parentNode.appendChild(newNode);

    return newNode;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.RemoveChild = function(parent, child)
  {
    parent.removeChild(child);
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.RemoveFromParent = function(child)
  {
    if(child.parentElement)
      child.parentElement.removeChild(child);
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.ShowElement = function(element, show)
  {
    element.style.display = show ? "block" : "none";
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.GetAttribute = function(element, name, remove)
  {
    var val = element.getAttribute(name);

    if(val && remove)
      this.RemoveAttribute(element, name);

    return val;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.SetAttribute = function(element, name, val)
  {
    element.setAttribute(name, val);
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.RemoveAttribute = function(element, name)
  {
    element.removeAttribute(name);
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.InnerHTML = function(element, val)
  {
    if(val != undefined)
      return element.innerHTML = val;

    return element.innerHTML;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.InnerText = function(element, val)
  {
    if(val != undefined)
      return element.innerText = val;

    return $.trim(element.innerText);
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.AppendHtml = function(element, html)
  {
    $(element).append(html);
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.LastChild = function(element)
  {
    if(element && element.childNodes && element.childNodes.length > 0)
      return element.childNodes[element.childNodes.length-1];

    return null;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.ElementsByName = function(name)
  {
    return document.getElementsByTagName(name);
  }
  
  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.ProcessElementsByName = function(name, fn, remove)
  {
    var items = document.getElementsByTagName(name);
    var n     = items.length;

    if(n > 0)
    {
      for(var i = 0; i < n; ++i)
        fn(items[i]);

      if(remove)
      {
        for(var j = n-1; j >= 0; --j)
          this.RemoveFromParent(items[j]);
      }
    }

    return n;
  }
  
  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.ProcessElementsByQuery = function(query, fn)
  {
    var $items = $(query);

    $items.each
    (
      function()
      {
        fn(this);
      }
    )

    return $items.length;
  }
  
  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.FirstElementByName = function(name)
  {
    var list = document.getElementsByTagName(name);

    if(list.length > 0)
      return list[0];

    return undefined;
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.EndElement = function()
  {
  }

  /*****************************************************************************/  
  Cheetah.DOMBuilder.prototype.css = function(element, name, value)
  {
    $(element).css(name, value);
  }

/*****************************************************************************/
/*****************************************************************************/  
Cheetah.DOMStringBuilder = function()
{
  this.sb              = new Cheetah.StringBuilder();
  this.tags            = [];
  this.currentTagEnded = true;
}

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.Clear = function()
  {
    this.sb.Clear();
    this.tags            = [];
    this.currentTagEnded = true;
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.ToString = function()
  {
    return this.sb.ToString("");
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.FinishStartTag = function()
  {
    if(!this.currentTagEnded)
    {
      this.sb.Append(">");
      this.currentTagEnded = true;
    }
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.AppendChild = function(parent, childName, fn)
  {
    this.FinishStartTag();

    this.sb.Append("<" + childName);

    this.tags.push(childName);
    this.currentTagEnded = false;

    if(fn)
      fn(null);
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.EndElement = function()
  {
    var tag = this.tags.pop();

    this.FinishStartTag();
    this.sb.Append("</" + tag + ">");
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.InsertBefore = function(before, childName)
  {
    this.AppendChild(before, childName);
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.AppendText = function(parent, txt)
  {
     this.FinishStartTag();
     this.sb.Append(txt);
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.RenderText = function(element, insert, renderParent, txt)
  {
    this.AppendText(null, txt);
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.InsertTextBefore = function(before, txt)
  {
    this.AppendText(null, txt);
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.SetContents = function(element, val)
  {
    this.AppendText(null, val);
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.SetAttribute = function(element, name, val)
  {
    this.sb.Append(" " + name + "=\"" + val + "\"");
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.InnerHTML = function(element, val)
  {
    if(val)
      this.AppendText(null, val);
  }

  /*****************************************************************************/  
  Cheetah.DOMStringBuilder.prototype.InnerText = function(element, val)
  {
    if(val)
      this.AppendText(null, val);
  }

}(Cheetah, document);

