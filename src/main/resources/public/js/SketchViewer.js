var SketchViewer = function() {

	this.loopBreaker = function(code) {
		let maximumLoopIterations = 10000;
		let maximumMilliseconds = 1000;
	    let markers = [];
	    let nodes = [];
	    function insertAtPos(text, position) {
	    	markers.push(new InsertionMarker(text, position));
	    }

	    function createVariableDeclarationString(name) {
	    	return `let ${name} = new Date().getTime();`;
	    }

	    function createLoopBreakConditionString(name) {
	    	let msg = `loop took too long to finish: ${maximumMilliseconds} milliseconds`;
	    	// return `if(${name}>${maximumLoopIterations}){console.error("${msg}");throw "HighIterationLoopException";}`;
	    	return `if(new Date().getTime() - ${name}>${maximumMilliseconds}){console.error("${msg}");throw "HighDurationLoopException";}`;
	    }

	    function isNodeBodyABlock(node) {
	    	return node.body.type == "BlockStatement";
	    }

	    function processLoopStatement(node) {
	    	let varName = createRandomVariableName();
	    	let loopBreakerStr = createLoopBreakConditionString(varName);
	    	let varDecl = createVariableDeclarationString(varName);
    		let startPos = node.range[0];

	    	insertAtPos(varDecl, startPos);
	    	if(isNodeBodyABlock(node)) {
	    		let block = node.body;
	    		insertAtPos(loopBreakerStr, block.range[0]+1);
	    	} else {
	    		//this branch is for when the loop body is just a single line
	    		let someExpression = node.body;
	    		insertAtPos("{"+loopBreakerStr, someExpression.range[0]-1);
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