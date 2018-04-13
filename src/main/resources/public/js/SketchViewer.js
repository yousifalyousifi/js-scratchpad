var SketchViewer = function() {

	this.loopBreaker = function(code) {
		let maximumLoopIterations = 10000;
	    let markers = [];
	    let nodes = [];

	    function insertAtPos(text, position) {
	    	markers.push(new InsertionMarker(text, position));
	    }

	    function createVariableDeclarationString(name) {
	    	return `let ${name} = 0;`;
	    }

	    function createLoopBreakConditionString(name) {
	    	let msg = "reached loop iteration maximum";
	    	return `if(${name}++>${maximumLoopIterations}){console.error("${msg}");throw "HighIterationLoopException";}`;
	    }

	    function isNodeBodyABlock(node) {
	    	return node.body.type == "BlockStatement";
	    }

	    function processLoopStatement(node) {
	    	let varName = createRandomVariableName();
	    	let loopBreaker = createLoopBreakConditionString(varName);
	    	let varDecl = createVariableDeclarationString(varName);
    		let startPos = node.range[0];
	    	insertAtPos(varDecl, startPos);
	    	if(isNodeBodyABlock(node)) {
	    		let block = node.body;
	    		insertAtPos(loopBreaker, block.range[0]+1);
	    	} else {
	    		let someExpression = node.body;
	    		insertAtPos("{"+loopBreaker, someExpression.range[0]-1);
	    		insertAtPos("}", someExpression.range[1]);
	    	}
	    }

	    let ast = acorn.parse(code, {
	        ranges: true,
	        locations: true
	    });

	    acorn.walk.simple(ast, {
	        WhileStatement(node) {processLoopStatement(node);},
	        ForStatement(node) {processLoopStatement(node);},
	        DoWhileStatement(node) {processLoopStatement(node);}
	    });

	    markers.sort(InsertionMarkerSorter);
		markers.reverse();
		for(let m of markers) {
			code = code.slice(0, m.position) + m.textToInsert + code.slice(m.position);
		}

		return code;
	};

	//https://stackoverflow.com/a/8084248
	function createRandomVariableName() {
		return `_${Math.random().toString(36).substring(2)}`;
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

}