/*
2018-03 https://github.com/sourcegraph/acorn-walkall

Copyright (c) 2013, Quinn Slack
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer. Redistributions
in binary form must reproduce the above copyright notice, this list of
conditions and the following disclaimer in the documentation and/or
other materials provided with the distribution.

Neither the name of the <ORGANIZATION> nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
acorn.walkall = {};

// types is an array of all SpiderMonkey AST node types recognized by acorn.
var types = acorn.walkall.types = [
  'ArrayExpression',
  'AssignmentExpression',
  'BinaryExpression',
  'BlockStatement',
  'BreakStatement',
  'CallExpression',
  'CatchClause',
  'ClassDeclaration',
  'ComprehensionExpression',
  'ConditionalExpression',
  'ContinueStatement',
  'DebuggerStatement',
  'DoWhileStatement',
  'EmptyStatement',
  'ExportDeclaration',
  'ExportNamedDeclaration',
  'Expression',
  'ExpressionStatement',
  'ForInStatement',
  'ForInit',
  'ForStatement',
  'ForOfStatement', //added by yousif
  'ArrowFunctionExpression',
  'Function',
  'FunctionDeclaration',
  'FunctionExpression',
  'Identifier',
  'IfStatement',
  'ImportDeclaration',
  'ImportSpecifier',
  'ImportDefaultSpecifier',
  'LabeledStatement',
  'Literal',
  'LogicalExpression',
  'MemberExpression',
  'MethodDefinition',
  'NewExpression',
  'ObjectExpression',
  'ObjectPattern',
  'Program',
  'ReturnStatement',
  'ScopeBody',
  'SequenceExpression',
  'Statement',
  'SwitchCase',
  'SwitchStatement',
  'TaggedTemplateExpression',
  'ThisExpression',
  'ThrowStatement',
  'TryStatement',
  'UnaryExpression',
  'UpdateExpression',
  'VariableDeclaration',
  'VariableDeclarator',
  'WhileStatement',
  'WithStatement',
  'Property'
];

// makeVisitors returns an object with a property keyed on each AST node type whose value is c.
acorn.walkall.makeVisitors = function(c) {
  var visitors = {};
  for (var i = 0; i < types.length; ++i) {
    var type = types[i];
    visitors[type] = c;
  }
  return visitors;
};

// traverser is an AST visitor that programmatically traverses the AST node by inspecting its object
// structure (as opposed to following hard-coded paths).
acorn.walkall.traverser = function(node, st, c) {
  var keys = Object.keys(node).sort();
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    var v = node[key];
    if (!v) continue;
    if (v instanceof Array) {
      for (var j = 0; j < v.length; ++j) {
        if (v[j].type) c(v[j], st);
        else if (typeof v[j] == 'object') acorn.walkall.traverser(v[j], st, c);
      }
    } else if (typeof v == 'object' && !(v instanceof RegExp) && v.type) {
      c(v, st);
    }
  }
};

// traversers is an AST walker that uses the traverser visitor for all AST node types.
acorn.walkall.traversers = acorn.walkall.makeVisitors(acorn.walkall.traverser);