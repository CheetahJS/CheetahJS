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

  var _cheetah = {
                    Operators: ["[", "]", "*", "/", "+", "-", "%", "<", "<=", ">", ">=", "==", "!=", "!=", "!", "||", "?", ":", "(", ")", "~", "^", ">>", "<<", ","]
                 };

  /*****************************************************************************/
  /*****************************************************************************/
  Cheetah.Expression = function(vm, expression)
  {
    var _fn          = null;
    var _isFn        = true;
    var _vm          = vm;
    var _expression  = expression;

    this.ModelTokens = [];
    this.VarTokens   = [];

    /*****************************************************************************/
    this.Eval = function(ec, model, injected)
    {
      try 
      {
        var fn = _fn;
        
        model = ch.Coalesce(model, ec.Model);

        if(_isFn)
        {
          if(!injected)
            injected = {};

          injected.$$root = _vm.Model;

          return(fn(_vm, model, injected, ec));
        }
      
        return(model[fn]);
      }
      catch(e) 
      {
        if(e.description.indexOf("undefined or null reference") == -1)
          Cheetah.Logger.Error(e.description);

        return "";
      }
    }

    /*****************************************************************************/
    {
      var c    = new _cheetah.Compiler();
      var expr = c.Compile(expression, this.ModelTokens, this.VarTokens, { $$root: 1, $$result: 1});

      if(expr.indexOf("return") == 0)
        _fn = new Function("__vm", "__model", "__injected", "__ec", expr);
      else
      {
        _fn = expr;
        _isFn = false;
      }
    }
  }

  /*****************************************************************************/
  _cheetah.Compiler = function()
  {
    this._sb        = new Cheetah.StringBuilder();
    this._tokenType = 0; // 0=no token, 1=token, 2=string literal, 3=number, 4=operator
    this._token     = "";
  }

    /*****************************************************************************/
    _cheetah.Compiler.prototype.PushToken = function(token, literal)
    {
      if(literal == undefined)
        literal = this._tokenType > 1;

      if(token == undefined)
        token = this._token;

      if(!ch.IsEmpty(token))
        this._sb.Append(token);

      this._token = "";
      this._tokenType = 0;
    }

    /*****************************************************************************/
    _cheetah.Compiler.prototype.Compile = function(expression, modelTokens, varTokens, injected)
    {
      var numRegex2       = /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
      var numRegex        = /^[-+]?[0-9]+$/;
      var puncRegex       = /[{}:;\(\)?\]\[+,]/;
      var opRegex         = /[!=<>\|&/\*\^\+]/;
      var n               = expression.length;

      for(var i = 0; i < n; ++i)
      {
        var ch = expression[i];
      
        // String literals
        if(ch == '\'')
        {
          if(this._tokenType == 2)
          {
            // End of literal
            this.PushToken(this._token + ch, true);
          }
          else
          {
            // Push any previous tokens
            this.PushToken();

            // Beginning of literal
            this._tokenType = 2;
            this._token = String(ch);
          }
        }
        else if(this._tokenType == 2)
        {
          this._token += ch;
        }
        else if(ch == ' ')
        {
          this.PushToken();
        }
        // Numeric literals
        else if(IsNumberChar(ch))
        {
          if(this._tokenType == 3 || this._tokenType == 1)
            this._token += ch;
          else
          {
            this.PushToken();
            this._token = String(ch);
            this._tokenType = 3;
          }
        }
        // Valid punctuation
        else if(opRegex.test(ch))
        {
          if(this._tokenType == 4)
            this._token += ch;
          else
          {
            this.PushToken();
            this._token = String(ch);
            this._tokenType = 4;
          }
        }
        else if(puncRegex.test(ch))
        {
          this.PushToken();
          this.PushToken(ch, true);
        }
        else
        {
          this._token += String(ch);
          this._tokenType = 1;
        }
      }

      this.PushToken();

      expression = ResolveTokens(this._sb, modelTokens, varTokens, injected).ToString("");

      return("return " + expression + ";");

      /*****************************************************************************/
      function IsNumberChar(ch)
      {    
        if(ch >= '0' && ch <= '9')
          return(true);

        return(ch == '.' || ch == '-');
      }

      /*****************************************************************************/
      function ResolveTokens(sb, arr, vars, injected)
      {
        var i = -1;

        sb.ForEach( function(token)
        {
          ++i;

          if(token.indexOf("'") == 0 || token.indexOf("\"") == 0)
            return;

          if(token == "NaN" || token == "undefined" || token == "null" || token == "true" || token == "false")
            return;

          if(!isNaN(parseFloat(token)))
            return;

          if(_cheetah.Operators.indexOf(token) != -1)
            return;

          var part = token;

          if(token == "=")
            part = " == ";
          else if(token == "and")
            part = " && ";
          else if(token == "or")
            part = " || ";
          else
          {
            var neg = token.indexOf("!") == 0;

            if(neg)
              token = token.substr(1);

            var part = token;
            token = "";

            if(part.indexOf("this.") == 0)
              part = part.replace("this.", "__vm.");
            else if(part.indexOf("ch.") == 0)
            {
              ;
            }
            else if(part.indexOf("$$") == 0)
            {
              var first = part.FirstInList(".");

              if(injected[first])
              {
                token = part;
                part = "__injected." + part;
              }
              else
              {
                token = part;
                part = "__model." + part;
              }
            }
            else if(part.indexOf("$") == 0)
            {
              var varName = part.TrimAfterIncluding(".");
              var remaining = part.indexOf(".") != -1 ? part.TrimBefore(".") : "";
              vars.push(varName.substr(1));

              part = "__ec.GetVar('" + varName.substr(1) + "')" + remaining;
            }
            else if(part.indexOf(".") != 0)
            {
              token = part;
              part = "__model." + part;
            }

            if(token != "")
              arr.push(token);

            if(neg)   
              part = "!" + part;
          }       

          sb.Replace(i, part);
        });

        return(sb);
      }

    }

}(Cheetah, document);

