function DrawRunner(divId) {

    this.enterMode = function() {
    	$("#p5Container").html("");
    	var drawHTML = 
		'<pre>'+
		'<span>Canvas</span>' +
		'<hr style="padding-bottom:5px;margin:0;" class="codeRunSeparator"/>' +
		'<div style="position: relative;"><div id="' + divId + '"/></div>'+ //this double wrapped div fixes p5.dom element positioning (kind of)
		'</pre>';
        $("#p5RefButton").show();
        $("#colorPicker").show();
    	$("#displayContainer").html(drawHTML);
    };

    this.exitMode = function() {
        $("#p5RefButton").hide();
        $("#colorPicker").hide();
    };

	this.runThis = function(code) {
        if(window.pInstance) {
            window.pInstance.remove();
            console.log("Removed old p5 instance");
        }
        try {
            $.globalEval(code+';$("#' + divId + '").html("");window.pInstance = new p5(undefined, "' + divId + '");');
        } catch (e) {
            console.error("Error compiling sketch.");
            console.error(e);
        }
	};

}