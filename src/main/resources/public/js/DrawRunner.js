function DrawRunner(divId) {

    var number = 0;

    this.enterMode = function() {
        number++;
    	$("#p5Container").html("");
    	var drawHTML = 
		'<pre>'+
		'<span>Canvas</span>' +
		'<hr style="padding-bottom:5px;margin:0;" class="codeRunSeparator"/>' +
		'<div id="' + divId + number + '"/>'+
		'</pre>';
    	$("#displayContainer").html(drawHTML);
    };

    this.exitMode = function() {

    };

	this.runThis = function(code) {
        if(window.pInstance) {
            pInstance.remove();
            console.log("Removed old p5 instance");
        }
        $.globalEval(code+';$("#' + divId + '").html("");window.pInstance = new p5(undefined, "' + divId + number + '");');
	};

}