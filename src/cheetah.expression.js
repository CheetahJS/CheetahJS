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
                    KnownLibraries: {Math: true, jQuery: true, ch: true, String: true, Number: true},
                    TransformOperators: {and: "&&", or: "||"},
                    EncodedTransformOperators: ["&gt;", "&lt;", "&amp;", "&quot;", "&apos;"],
                    EncodedTransformTo: [">", "<", "&", "\"", "'"],
                    Operators: ["[", "]", "*", "/", "++", "--", "+=", "-=", "*=", "/=", "+", "-", "%", "<", "<=", ">", ">=", "==", "===", "!=", "!==", "!", "||", "&&", "?", ":", "(", ")", "~", "^", ">>", "<<", ",", "=>", "=:", "and", "or", "="],
                    LiteralValues: {xNaN: true, xundefined: true, xnull: true, xtrue: true, xfalse: true},
                    dOperators: null
                 };

  /*****************************************************************************/
  Cheetah.IsExpressionText = function(val)
  {
    return _cheetah.Operators.IfAny( function(item) {return val.indexOf(item) != -1; })
  }

  /*****************************************************************************/
  _cheetah.IsOperator = function(val)
  {
    return _cheetah.dOperators[val];
  }

  /*****************************************************************************/
  _cheetah.IsLiteralValue = function(val)
  {
    return _cheetah.LiteralValues["x" + val];
  }

  /*****************************************************************************/
  /*****************************************************************************/
  Cheetah.Expression = function(vm, expression)
  {
    var _fn          = null;
    var _isFn        = true;
    var _vm          = vm;
    var _expression  = expression;

    this.HasFunctions = false;
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

          injected.$$root  = _vm.Model;
          injected.$$scope = model;

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
      if(_cheetah.dOperators == null)
        _cheetah.dOperators = _cheetah.Operators.ToDictionary();

      var c    = new _cheetah.Compiler();
      var expr = c.Compile(expression, this.ModelTokens, this.VarTokens, { $$root: 1, $$result: 1, $$target: 1, $$value: 1, $$scope: 1, $$event: 1});

      if(expr.indexOf("return") == 0)
      {
        _fn = new Function("__vm", "__model", "__injected", "__ec", expr);

        this.HasFunctions = this.ModelTokens.Contains( function(i) { return i == "__expr__"; } );
      }
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
    this._sb        = [];
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
      {
        var op = null;

        if(_cheetah.Operators.IfAny(  function(item) 
                                      {
                                        if(token.indexOf(item) == 0)
                                        {
                                          op = item;
                                          return true;
                                        }

                                        return false;
                                      }) && token != op)
        {
          this._sb.push(op); 
          this._sb.push(token.substr(op.length)); 
        }
        else
          this._sb.push(token); 
      }

      this._token = "";
      this._tokenType = 0;
    }

    /*****************************************************************************/
    var TokenType = {
                      Text:        1,
                      Literal:     2,
                      Number:      3,
                      Punctuation: 4 
                    };

    /*****************************************************************************/
    _cheetah.Compiler.prototype.Compile = function(expression, modelTokens, varTokens, injected)
    {
      var puncRegex = /[{}:;\(\)?\]\[+,]/;
      var opRegex   = /[!=<>\|&/\*\^\+\~\?\:]/;
      var n         = expression.length;
      var prev      = null;

      for(var i = 0; i < n; ++i)
      {
        var ch = expression[i];
      
        // String literals
        if(ch == '\'' && prev != '\\')
        {
          if(this._tokenType == TokenType.Literal)
          {
            // End of literal
            this.PushToken(this._token + ch, true);
          }
          else
          {
            // Push any previous tokens
            this.PushToken();

            // Beginning of literal
            this._tokenType = TokenType.Literal;
            this._token = String(ch);
          }
        }
        else if(this._tokenType == TokenType.Literal)
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
          if(this._tokenType == TokenType.Number || this._tokenType == TokenType.Text)
            this._token += ch;
          else
          {
            this.PushToken();
            this._token = String(ch);
            this._tokenType = TokenType.Number;
          }
        }
        // Valid punctuation
        else if(opRegex.test(ch))
        {
          if(ch == '&')
          {
            var c = 0;

            _cheetah.EncodedTransformOperators.ForEach( function(item)
            {
              var test = expression.substr(i, item.length);

              if(test == item)
              {
                i += item.length - 1;
                ch = _cheetah.EncodedTransformTo[c];
                return false; // to stop
              }

              ++c;
              return true; // to continue
            }, 
            true);
          }

          if(this._tokenType == TokenType.Punctuation)
            this._token += ch;
          else
          {
            this.PushToken();
            this._token = String(ch);
            this._tokenType = TokenType.Punctuation;
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
          this._tokenType = TokenType.Text;
        }

        prev = ch;
      }

      this.PushToken();

      var resolver = new TokenResolver(injected);
      var result = resolver.Resolve(this._sb, modelTokens, varTokens);
      
      return("return " + result + ";");

      /*****************************************************************************/
      function IsNumberChar(ch)
      {    
        if(ch >= '0' && ch <= '9')
          return(true);

        return(ch == '.' || ch == '-');
      }
    }

  /*****************************************************************************/
  /*****************************************************************************/
  function TokenResolver(injected)
  {
    this._output         = [];
    this._delimiterStack = [];
    this._paramStack     = [];
    this._injected       = injected;
  }

    /*****************************************************************************/
    TokenResolver.prototype.Resolve = function(tokens, modelTokens, varTokens)
    {      
      var self              = this;
      var output            = this._output;
      var paramStack        = this._paramStack;
      var delimiterStack    = this._delimiterStack;
      var injected          = this._injected;
      var containsFunctions = false;

      tokens.ForEach( function(token) 
      {
        if(token == "=>" || token == "=:")
        {
          delimiterStack.push(token);
          paramStack.push("()");
          containsFunctions = true;

          var last = output.pop().replace("__model.", "");
          var fn = "function (";

          if(last == ")")
          {
            var params = [];

            while(true)
            {
              last = output.pop();

              if(last == "(")
                break;

              last = last.replace("__model.", "");

              if(last != ",")
              {
                paramStack.push(last);
                params.push(last);
              }
            }

            fn += params.reverse().Pack(", ");
          }
          else
          {
            paramStack.push(last);
            fn += last;
          }

          output.push(fn + ") { return ");
        }
        else if(token == "]")
        {
          output.push(token);
          delimiterStack.pop();
        }
        else if(token == ")" || token == ",")
        {
          self.CheckLambda();
          output.push(token);

          if(token == ")")
            delimiterStack.pop();
        }
        else if(token == "(" || token == "[")
        {
          if(!_cheetah.IsOperator(output.peek()))
            containsFunctions = true;

          output.push(token);
          delimiterStack.push(token);
        }
        else if(_cheetah.TransformOperators[token])
        {
          output.push(" " + _cheetah.TransformOperators[token] + " ");
        }
        else if(token.indexOf("'") == 0 || token.indexOf("\"") == 0)
          output.push(token);
        else if(_cheetah.IsLiteralValue(token))
          output.push(token);
        else if(!isNaN(parseFloat(token)))
          output.push(token);
        else if(_cheetah.IsOperator(token))
          output.push(token);
        else 
        {
          var first = token.FirstInList(".");

          if(first.indexOf("$$") == 0)
          {
            if(injected[first])
              output.push("__injected." + token);
            else 
              output.push("__model." + token);
          }
          else if(first.indexOf("$") == 0)
          {
           var variable = first.substr(1);

            output.push("__ec.GetVar('" + variable + "')" + token.substr(first.length));
            varTokens.push(variable);
          }
          else if(first == "" || _cheetah.KnownLibraries[first])
          {
            output.push(token);
          }
          else if(first == "this")
          {
            output.push(token.replace("this.", "__vm."));
          }
          else if(!self.IsLambdaParam(first))
            output.push("__model." + token);
          else 
            output.push(token);
        }
      });

      output.ForEach( function(item)
      {
        if(item.indexOf("__model.") == 0)
          modelTokens.push(item.substr("__model.".length));
        else if(item.indexOf("__injected.$$") == 0)
          modelTokens.push(item.substr("__injected.".length));
      });

      if(containsFunctions)
        modelTokens.push("__expr__");

      return this._output.Pack("");
    }

    /*****************************************************************************/
    TokenResolver.prototype.CheckLambda = function()
    { 
      var peek = this._delimiterStack.peek();

      if(peek == "=>" || peek == "=:")
      {
        this._output.push("; }");
        this._delimiterStack.pop();

        var param = this._paramStack.pop();

        while(param != "()")
          param = this._paramStack.pop()
      }
    }

    /*****************************************************************************/
    TokenResolver.prototype.IsLambdaParam = function(param)
    { 
      var n = this._paramStack.length;

      for(var i = n-1; i >=0; --i)
      { 
        var item = this._paramStack[i];

        if(item == param)
          return true;
      }

      return false;
    }

}(Cheetah, document);

