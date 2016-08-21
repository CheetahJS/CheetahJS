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
                    Operators: ["[", "]", "*", "/", "+", "-", "%", "<", "<=", ">", ">=", "==", "!=", "!=", "!", "||", "?", ":", "(", ")", "~", "^", ">>", "<<", ",", "=>", "and", "or", "="]
                 };

  /*****************************************************************************/
  Cheetah.IsExpressionText = function(val)
  {
    return _cheetah.Operators.IfAny( function(item) {return val.indexOf(item) != -1; })
  }

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
        this._sb.push(token);

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

      var tokens = ResolveTokens([], this._sb, modelTokens, varTokens, injected);
      var result = PackTokens(tokens);
      
      return("return " + result + ";");

      /*****************************************************************************/
      function PackTokens(tokens)
      {
        return tokens.Pack("", function(part) 
        {
          if(part.type.indexOf("function") == 0)
            return part.token + "(" + PackTokens(part.tokens) + ")";

          return part.token; 
        });
      }

      /*****************************************************************************/
      function IsNumberChar(ch)
      {    
        if(ch >= '0' && ch <= '9')
          return(true);

        return(ch == '.' || ch == '-');
      }

      /*****************************************************************************/
      function MakeToken(token, type)
      {      
        return {token: token, type: type ? type : "sliteral"};
      }

      /*****************************************************************************/
      function ResolveTokens(output, sb, arr, vars, injected)
      {
        var nTokens = sb.length;
        var tokenStack = [];

        for(var i = 0; i < nTokens; ++i)
        {
          var token = sb[i];

          if(token.indexOf("'") == 0 || token.indexOf("\"") == 0)
          {
            output.push(MakeToken(token));
            continue;
          }

          if(token == "NaN" || token == "undefined" || token == "null" || token == "true" || token == "false")
          {
            output.push(MakeToken(token, "literal"));
            continue;
          }

          if(!isNaN(parseFloat(token)))
          {
            output.push(MakeToken(token, "number"));
            continue;
          }

          if(token == "(")
          {
            var previousToken = output.peek();
            
            if(previousToken && previousToken.type == "prop")
            {
              previousToken.type = "function";
              previousToken.parentOutput = output;
              previousToken.parent = tokenStack.peek();
              tokenStack.push(previousToken);

              output = [];
              continue;
            }

            previousToken = MakeToken("", "function_e");

            previousToken.parentOutput = output;

            if(tokenStack.peek() && tokenStack.peek().isLambda)
              previousToken.isLambda = true;

            previousToken.parent = tokenStack.peek();
            tokenStack.push(previousToken);

            output.push(previousToken);

            output = [];
            continue;
          }

          if(token == ")" && tokenStack.length != 0)
          {
            if(tokenStack.peek().type.indexOf("function") == 0)
            {
              var fnToken = tokenStack.pop();

              if(fnToken.isLambda && fnToken.type == "function")
                output.push(MakeToken("; }"));

              fnToken.tokens = output;
              output = fnToken.parentOutput;
              continue;
            }
          }

          if(token == "=>")
          {
            var topStack = tokenStack.peek();

            topStack.isLambda = true;

            if(output[0].type == "function_e")
            {
              var ptoken = output[0];

              ptoken.token = "function";
              ptoken.isLambda = true;
              output.push(MakeToken(" { return "));

              var n = ptoken.tokens.length;
              var params = {};

              for(var j = 0; j < n; ++j)
              {
                var tokenp = ptoken.tokens[j];
                var param  = tokenp.token.replace("__model.", "")

                tokenp.token = param;

                if(param != ",")
                  params[param] = param;
              }

              //ptoken.params = params;
              topStack.parentOutput[0].params = params;
            }
            else
            {
              var param = output[0].token.replace("__model.", "");

              output[0] = MakeToken("function(" + param + ") { return ");

              if(!topStack.parentOutput[0].params)
                topStack.parentOutput[0].params = {};

              topStack.parentOutput[0].params[param] = param;
            }

            continue;
          }

          if(_cheetah.Operators.indexOf(token) != -1)
          {
            switch(token)
            {
              case "=":   token = "=="; break;
              case "and": token = "&&"; break;
              case "or":  token = "||"; break;
            }

            output.push(MakeToken(token, "operator"));
            continue;
          }

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
            else if(!tokenStack.peek() || !tokenStack.peek().isLambda)
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
          else if(part.indexOf(".") != 0) // && (!tokenStack.peek() || !tokenStack.peek().isLambda))
          {
            if(!IsLambdaParam(tokenStack.peek(), part.TrimAfterIncluding(".")))
            {
              token = part;
              part = "__model." + part;
            }
          }

          if(token != "")
            arr.push(token);

          if(neg)   
            part = "!" + part;

          output.push(MakeToken(part, "prop"));
        }

        return output;
      }

      /*****************************************************************************/
      function IsLambdaParam(token, part)
      {
        if(!token)
          return false;

        if(token.isLambda && token.params && token.params[part])
          return true;

        if(token.parentOutput && token.parentOutput[0].params && token.parentOutput[0].params[part])
          return true;

        if(token.parent)
            return IsLambdaParam(token.parent, part);

        return false;
      }
    }

}(Cheetah, document);

