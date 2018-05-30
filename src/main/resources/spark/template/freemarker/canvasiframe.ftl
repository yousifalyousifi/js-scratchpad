<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    </head>
    <style>
    canvas {
	    padding-left: 0;
	    padding-right: 0;
	    margin-left: auto;
	    margin-right: auto;
	    display: block;
    }
    </style>
    <body>
        <div id="displayContainer">
        </div>
        <script src="/js/jquery/jquery3.2.1.js"></script>
        <script src="/js/jquery/jquery.ba-throttle-debounce.min.js"></script>
        <script src="/js/p5/p5.js"></script>
        <script src="/js/p5/addons/p5.dom.js"></script>
        <script src="/js/acorn/acorn.js"></script>
        <script src="/js/acorn/acorn_loose.js"></script>
        <script src="/js/acorn/walk.js"></script>
        <script src="/js/SketchViewer.js"></script>
        
        <span style="display:none;" id="theCode">${code}</span>
        <script>
			var sv = new SketchViewer();
			var infiniteLoopSafeCode = sv.loopBreaker($("#theCode").text());
            document.loadLoopingCode = function() {
	            if(document.p5Instance) {
		            document.p5Instance.remove();
		            $("#displayContainer").html("");
		        }
            	$.globalEval(infiniteLoopSafeCode);
            	document.p5Instance = new p5(undefined, "displayContainer");
            	fixPositioning();
            	
            };
            document.loadNoLoopCode = function() {
            	let noLoopCode = sv.addNoLoopToCode(infiniteLoopSafeCode);
	            if(document.p5Instance) {
		            document.p5Instance.remove();
		            $("#displayContainer").html("");
		        }
            	$.globalEval(noLoopCode);
            	document.p5Instance = new p5(undefined, "displayContainer");
            	fixPositioning();
            };
            
            //I don't know what this is needed. 
            //But without it, the displayContainer gets put in the wrong position in Chrome, until the the DOM is redrawn
            function fixPositioning() {
            	setTimeout(function(){
            		$("#displayContainer").hide().show(0);
            	},1000);
            }
            
            
			try {
            	document.loadNoLoopCode();
            } catch (e) {
            	console.error(e);
            }
            window.alert = function() {};
            window.prompt = function() {};
            //window.console.log = function() {};
            //window.console.error = function() {};
            parent = window;
        </script>

    </body>
</html>