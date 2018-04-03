var Stepper = function() {
	//var editor = ace.edit("editor");
	Range = ace.require('ace/range').Range

	var editor = scratchpad.getEditor();

	//var storedCode = window.localStorage.getItem("code");
	//if (storedCode) {
	//    editor.setValue(storedCode);
	//} else {
	//    editor.setValue($("#defaultCode").text());
	//}

	//editor.setTheme("ace/theme/monokai");
	//editor.session.setMode("ace/mode/javascript");
	//editor.setOptions({
	//    enableBasicAutocompletion: true,
	//    enableLiveAutocompletion: false
	//});

	function monokai() {console.log('monokai!');editor.setTheme("ace/theme/monokai");}
	function debugmonokai() {console.log('debugmonokai!');editor.setTheme("ace/theme/debugmonokai");}

	//var storedCode = window.localStorage.getItem("code");
	//if (storedCode) {
	    //editor.setValue(storedCode);
	//} else {editor.setValue("");}
	//editor.gotoLine(editor.session.getLength() + 1);

	window.pp = function() {
	    console.log.apply(null, arguments);
	};

	window.stepping = false;
	window.returnIDFloat = 0;
	window.returnID = 0;
	window.globalFuncCallStack = [];
	window.GLOBAL_INDEX = 0;
	window.fakeFrameCount = 0;
	window.fakeMouseX = 0;
	window.fakeMouseY = 0;

	//for auto stepping
	window.autostep = 1;
	window.autoplay = null;
	window.autointerval = 300;

	window.isViewingDecoratedCode = false;
	window.decoratedCode = "";
	window.undecoratedCode = "";

	window.BREAKPOINT = function(lineNumber) {
	    if(stepping&&++GLOBAL_INDEX>=returnID) {highlightLine(lineNumber);throw {type:"return"};}
	}

	function process() {
	    console.log("Processing started...");
	    let markers = [];
	    let funcCallMarkers = [];
	    let code = editor.getValue();
	    let myFunctions = [];
	    
	    let ast = acorn.parse(code, {
	        ranges: true,
	        locations: true
	    });
	    
	    nodes = [];
	    
	    acorn.walk.ancestor(ast, acorn.walkall.makeVisitors(function(node, ancestors) {
	        node.ancestors = [];
	        for(let a of ancestors) {
	            node.ancestors.push(a);
	        }

	        if(isGlobalOrSetup(node)) {
	            // console.log(node);
	            return;
	        }

	        //find the draw function and wrap its guts.
	        if(node.type == _FunctionDeclaration 
	            && node.id.name == "draw") {
	            let blockNode = node.body;
	            processWrapMainFunctionBody(blockNode);
	        }

			//wrap function bodies that are not draw nor setup
			if(node.type == _FunctionDeclaration 
				|| node.type == _FunctionExpression) {
				myFunctions.push(node);
				if(node.id
					&& (node.id.name == "draw"
					|| node.id.name == "setup")) {
					return; //skip
				}
				let blockNode = node.body;
				processWrapNonMainFunctionBody(blockNode);
			}

	        if(node.type == _IfStatement
	            || node.type ==  _ForStatement
	            || node.type ==  _WhileStatement) {
	            processNodesWithTests(node);
	        }
	        if(node.type == _BreakStatement
	            || node.type ==  _ReturnStatement) {
	            processBeforeStatementNode(node);
	        }
	        if(node.type == _VariableDeclaration) {
	            let parent = node.ancestors[node.ancestors.length-2];
	            if(parent.type == _ForStatement
	                || parent.type ==  _ForOfStatement) {
	                //skip
	            } else {
	                processingVarDecl(node);
	            }
	        }
	        if(node.type == _ExpressionStatement) {
	            processExp(node);
	        }
	        if(node.type == _CallExpression) {
	            processCallExp(node);
	        }

	        nodes.push(node);
	    }), acorn.walkall.traversers);

	    function insertAtPos(text, position) {
	    	markers.push(new InsertionMarker(text, position));
	    }
	    
	    function isGlobalOrSetup(node) {
	        //loop through each ancestor
	            //if it has no function parent, fail
	            //if one is a function decl called "setup", fail
	        let funcCounter = 0;
	        for(let a of node.ancestors) {
	            if(a.type == _FunctionDeclaration
	                || a.type == _FunctionExpression) {
	                if(a.id && a.id.name == "setup") {
	                    return true;
	                }
	                funcCounter++;
	            }
	        }
	        if(funcCounter==0) {
	            return true;
	        }

	        return false;
	    }
	    
	    function processExp(node) {
	        processInsertAfterStatement(node, "EXPRESSION");
	    }

	    function processCallExp(node) {
	        let lineNumber = node.loc.start.line;
	        let postBreakPoint = "";
	        let parent = node.ancestors[node.ancestors.length-2];
	        let prePosition = node.range[0];
	        //if this call is not its own expression, check to see if it is part of a variable declaration
	        //if it is, process it.
	        if(parent.type != _ExpressionStatement) {

		        try {
		        	let twoAncestorsAboveNode = node.ancestors.slice(node.ancestors.length-3, node.ancestors.length-1).map(i => i.type);
		        	window.koko = node.ancestors;
		        	if(twoAncestorsAboveNode.equals([_VariableDeclaration, _VariableDeclarator])) {
						prePosition = node.ancestors[node.ancestors.length-3].range[0]
		        	} else {
		        		return;//skip
		        	}
		        } catch (e) {
		        	console.error(e);
		        }
	        }

	        let pre = "BREAKPOINT("+lineNumber+");";
	        let post = "BREAKPOINT("+lineNumber+");";

	        funcCallMarkers.push({node:node, markerToAdd: new InsertionMarker(pre, prePosition)});

	    }
	    
	    function processingVarDecl(node) {
	        if(node.declarations
	            && node.declarations[0] //to simplify, I assume there's only one declarator
	            && node.declarations[0].init 
	                && node.declarations[0].init.type == _FunctionExpression) {
	                return; //skip
	        }
	        processInsertAfterStatement(node, "VAR");
	    }

	    function processInsertAfterStatement(node) {
	        let lineNumber = node.loc.end.line;
	        insertAtPos("BREAKPOINT("+lineNumber+");", node.range[1]);
	    }

	    function processBeforeStatementNode(node) {
	        let lineNumber = node.loc.start.line;
	        insertAtPos("BREAKPOINT("+lineNumber+");", node.range[0]);
	    }

	    function processNodesWithTests(node) {
	        node = node.test;
	        let lineNumber = node.loc.start.line;
	        insertAtPos("BREAKPOINT("+lineNumber+")||", node.range[0]);

	    }

	    function processWrapNonMainFunctionBody(node) {
	        let lineNumber = node.loc.start.line;
	       	insertAtPos("BREAKPOINT("+lineNumber+");", node.range[0]+1);
	       	//insertAtPos("END();", node.range[1]-1);
	    }

	    function processWrapMainFunctionBody(node) {
	        //insertInsideTop
	        let lineIndex;
	        let columnIndex;
	        let lineString;
	        let decoratedLine;

	        let topWrap = `
	    GLOBAL_INDEX =-1;
	    frameCount = fakeFrameCount;
	    let tempX = mouseX;
	    let tempY = mouseY;
	    mouseX = fakeMouseX;
	    mouseY = fakeMouseY;
	    randomSeed(200);
	    try {


	`;

	        let bottomWrap = `


	        fakeFrameCount++;
	        fakeMouseX = tempX;
	        fakeMouseY = tempY;
	        returnID = 0;
	        returnIDFloat = 0;
	    }catch(e) {
	        if(e.type && e.type == "return") {
	            returnID = Math.trunc(returnIDFloat);
	            //console.log("super return", returnID);
	        } else {
	            throw e;
	        }
	    }
	    mouseX = tempX;
	    mouseY = tempY;

	`;
	        insertAtPos(topWrap, node.range[0]+1);
	        insertAtPos(bottomWrap, node.range[1]-1);

	    }

	    //this process would falsely flag system defined functions as being user defined
	    // if they share the same name as a user defined one.
	    for(let func of funcCallMarkers) {
	    	let nameOfFunctionBeingCalled = null;
	    	let node = func.node; //the call expression
	    	if(node.callee.type == _Identifier) {
	    		nameOfFunctionBeingCalled = node.callee.name;
	    	} else {
	    		continue;
	    	}

	    	let found = myFunctions.some(f => {
	    		let thisFunctionsName = null;
				if(f.id) { //this is a named function
					thisFunctionsName = f.id.name;
				} else {//look at the parent variable declarator and get the var's name
			        let parent = f.ancestors[f.ancestors.length-2];
			        if(parent.type == "AssignmentExpression"
			        	&& parent.left.property.name) {
			        	thisFunctionsName = parent.left.property.name;
			        } else {
				        thisFunctionsName = parent.id.name;
				    }
				}
	    		return thisFunctionsName == nameOfFunctionBeingCalled;
	    	});

	    	//"found" means that we found a call expression calling a function we defined.
	    	if(found) {
	    		markers.push(func.markerToAdd);
	    	}
	    }

	    markers.sort(InsertionMarkerSorter);
		markers.reverse();
		for(let m of markers) {
			code = code.slice(0, m.position) + m.textToInsert + code.slice(m.position);
		}

		console.log("Processing finished.");

	    decoratedCode = code;

	    return nodes;
	}

	function activateStepMode() {
		if(!stepping) {
		    undecoratedCode = editor.getValue();
		    process();
		    scratchpad.runThis(decoratedCode, false);
		}
	    stepping = true;
	    debugmonokai();
	}

	function deactivateStepMode() {
	    stepping = false;
	    returnID=0;
	    returnIDFloat=0;
	    if(autoplay) clearInterval(autoplay);
	    monokai();
	}

	function toggleSteppingCodeView() {
		if(isViewingDecoratedCode) {
			editor.setValue(undecoratedCode);
		} else {
			undecoratedCode = editor.getValue();
			editor.setValue(decoratedCode);
		}
		isViewingDecoratedCode = !isViewingDecoratedCode;
	}

	function stepForward() {
	    if(stepping == true) {
	        returnIDFloat += 1;
	    }
	}

	function stepBackward() {
	    if(stepping == true) {
	        returnIDFloat -= 1;
	        if(returnIDFloat<0) returnIDFloat = 0;
	    }
	}

	function startAutoStepping() {
		if(stepping) {
		    //returnID=0;
		    stepping = true;
		    if(autoplay) clearInterval(autoplay);
		    autoplay = setInterval(function() {
		        returnIDFloat += autostep||1;
		    },autointerval||300);
		    debugmonokai();
		}
	}

	function stopAutoStepping() {
		if(stepping) {
		    if(autoplay) clearInterval(autoplay);
		}
	}

	$("#b20").click(function(){
		if(!stepping) {
			activateStepMode();
		}
	});
	$("#b21").click(function(){
		if(stepping) {
	    	editor.setValue(undecoratedCode);
			deactivateStepMode();
		}
	});
	$("#b22").click(function(){
		stepForward();
	});
	$("#b23").click(function(){
		stepBackward();
	});
	$("#b24").click(function(){
		startAutoStepping();
	});
	$("#b25").click(function(){
		stopAutoStepping();
	});
	$("#b26").click(function(){
		toggleSteppingCodeView();
	});

	function highlightLine(lineNumber) {
	    if(stepping) {
	        let l = lineNumber-1;
	        editor.selection.setRange(new Range(l, 10000, l, 0));
	    }
	}

	function InsertionMarker(textToInsert, position) {
		this.position = position;
	    this.textToInsert = textToInsert;
	}

	function InsertionMarkerSorter(a, b) {
		if(a.position < b.position) {
	        return -1;
		} else if(a.position > b.position) {
	        return 1;
		} else {
			return 0;
		}
	}

	//____________________________________
	//https://stackoverflow.com/a/14853974
	//____________________________________
	// Warn if overriding existing method
	if(Array.prototype.equals)
	    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
	// attach the .equals method to Array's prototype to call it on any array
	Array.prototype.equals = function (array) {
	    // if the other array is a falsy value, return
	    if (!array)
	        return false;

	    // compare lengths - can save a lot of time 
	    if (this.length != array.length)
	        return false;

	    for (var i = 0, l=this.length; i < l; i++) {
	        // Check if we have nested arrays
	        if (this[i] instanceof Array && array[i] instanceof Array) {
	            // recurse into the nested arrays
	            if (!this[i].equals(array[i]))
	                return false;       
	        }           
	        else if (this[i] != array[i]) { 
	            // Warning - two different object instances will never be equal: {x:20} != {x:20}
	            return false;   
	        }           
	    }       
	    return true;
	}
	// Hide method from for-in loops
	Object.defineProperty(Array.prototype, "equals", {enumerable: false});
	//______________________________________
	//______________________________________
	//______________________________________

	const _ArrayExpression = "ArrayExpression"
	const _AssignmentExpression = "AssignmentExpression"
	const _BinaryExpression = "BinaryExpression"
	const _BlockStatement = "BlockStatement"
	const _BreakStatement = "BreakStatement"
	const _CallExpression = "CallExpression"
	const _CatchClause = "CatchClause"
	const _ClassDeclaration = "ClassDeclaration"
	const _ComprehensionExpression = "ComprehensionExpression"
	const _ConditionalExpression = "ConditionalExpression"
	const _ContinueStatement = "ContinueStatement"
	const _DebuggerStatement = "DebuggerStatement"
	const _DoWhileStatement = "DoWhileStatement"
	const _EmptyStatement = "EmptyStatement"
	const _ExportDeclaration = "ExportDeclaration"
	const _ExportNamedDeclaration = "ExportNamedDeclaration"
	const _Expression = "Expression"
	const _ExpressionStatement = "ExpressionStatement"
	const _ForInStatement = "ForInStatement"
	const _ForInit = "ForInit"
	const _ForStatement = "ForStatement"
	const _ForOfStatement = "ForOfStatement" //added by yousif
	const _ArrowFunctionExpression = "ArrowFunctionExpression"
	const _Function = "Function"
	const _FunctionDeclaration = "FunctionDeclaration"
	const _FunctionExpression = "FunctionExpression"
	const _Identifier = "Identifier"
	const _IfStatement = "IfStatement"
	const _ImportDeclaration = "ImportDeclaration"
	const _ImportSpecifier = "ImportSpecifier"
	const _ImportDefaultSpecifier = "ImportDefaultSpecifier"
	const _LabeledStatement = "LabeledStatement"
	const _Literal = "Literal"
	const _LogicalExpression = "LogicalExpression"
	const _MemberExpression = "MemberExpression"
	const _MethodDefinition = "MethodDefinition"
	const _NewExpression = "NewExpression"
	const _ObjectExpression = "ObjectExpression"
	const _ObjectPattern = "ObjectPattern"
	const _Program = "Program"
	const _ReturnStatement = "ReturnStatement"
	const _ScopeBody = "ScopeBody"
	const _SequenceExpression = "SequenceExpression"
	const _Statement = "Statement"
	const _SwitchCase = "SwitchCase"
	const _SwitchStatement = "SwitchStatement"
	const _TaggedTemplateExpression = "TaggedTemplateExpression"
	const _ThisExpression = "ThisExpression"
	const _ThrowStatement = "ThrowStatement"
	const _TryStatement = "TryStatement"
	const _UnaryExpression = "UnaryExpression"
	const _UpdateExpression = "UpdateExpression"
	const _VariableDeclaration = "VariableDeclaration"
	const _VariableDeclarator = "VariableDeclarator"
	const _WhileStatement = "WhileStatement"
	const _WithStatement = "WithStatement"
	const _Property = "Property"
}