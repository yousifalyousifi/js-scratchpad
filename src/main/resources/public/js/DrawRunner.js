function DrawRunner(divId) {

	this.runThis = function(code) {
        if(window.pInstance) {
            pInstance.remove();
            console.log("Removed old p5 instance");
        }
        $.globalEval(code+';$("#' + divId + '").html("");window.pInstance = new p5(undefined, "' + divId + '");');
	};

}