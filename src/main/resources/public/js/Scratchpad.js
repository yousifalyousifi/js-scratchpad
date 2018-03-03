$(document).ready(function() {
    
    var that = this;
    var currentFontSize = 14;
    var mode = undefined;

    var codeRunner = new CodeRunner("#displayContainer pre");
    var drawRunner = new DrawRunner("p5Container");
    var runner = codeRunner; 

    consoleMode();

    var editor = ace.edit("editor");

    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");

    var storedCode = window.localStorage.getItem("code");
    if (storedCode) {
        editor.setValue(storedCode);
    } else {
        editor.setValue($("#defaultCode").text());
    }
    editor.gotoLine(editor.session.getLength() + 1);
    editor.getSession().on('change', $.debounce( 1000, function(e) {
        console.log("Changes saved.");
        window.localStorage.setItem("code", editor.getValue());
    }));
    editor.commands.addCommand({
        name: 'run',
        bindKey: {win: 'Ctrl-R',  mac: 'Command-R'},
        exec: function(editor) {
            that.runThis(editor.getValue());
        },
        readOnly: false // false if this command should not apply in readOnly mode
    });

    setFontSize(currentFontSize);
    getLessons();

    function setFontSize(size) {
        editor.setFontSize(size);
        $("#displayContainer").css("font-size", size+"px");
    }

    $("#runButton").click(function() {
        that.runThis(editor.getValue());
    });

    $("#font14px").click(function() {
    	currentFontSize = 14;
        setFontSize(currentFontSize);
    });

    $("#font18px").click(function() {
    	currentFontSize = 18;
        setFontSize(currentFontSize);
    });

    $("#font24px").click(function() {
    	currentFontSize = 24;
        setFontSize(currentFontSize);
    });

    var wordWrap = false;
    $("#wordWrap").click(function() {
        wordWrap = !wordWrap;
        editor.getSession().setUseWrapMode(wordWrap);
        if(wordWrap) {
        	$("#wordWrap").text("Disable Word Wrap");
        } else {
        	$("#wordWrap").text("Enable Word Wrap");
        }
    });

    $("#clearButton").click(function() {
    	mode = undefined;
    	consoleMode();
    });

    $("#consoleMode").click(function() {
    	consoleMode();
    });

    $("#drawMode").click(function() {
    	drawMode();
    });

    function consoleMode() {
    	if(mode == "console") {return;}
    	mode = "console";
    	runner = codeRunner;
		var consoleHTML = 
		'<pre>'+
		'<span>Console Output</span>'+
		'<hr style="margin:0;" class="codeRunSeparator"/>'+
		'</pre>';
		$("#clearButton").show();
    	$("#displayContainer").html(consoleHTML);
    }
    function drawMode() {
    	if(mode == "draw") {return;}
    	$("#p5Container").html("");
    	var drawHTML = 
		'<pre>'+
		'<span>Canvas</span>' +
		'<hr style="padding-bottom:5px;margin:0;" class="codeRunSeparator"/>' +
		'<div id="p5Container"/>'+
		'</pre>';
		$("#clearButton").hide();
    	$("#displayContainer").html(drawHTML);
    	mode = "draw";
    	runner = drawRunner;
    }

    this.runThis = function(code) {
    	runner.runThis(code);
    };

    function getLesson(lessonIndex) {
        $.ajax({
          method: "GET",
          url: "/lessons/get/" + lessonIndex
        })
        .done(function( lesson ) {
            console.log(lesson);
            editor.setValue(lesson.snippet);
            editor.gotoLine(editor.session.getLength() + 1);
            $("#loadingGif").hide();
            $('#myModal').modal('hide');
        })
        .fail(function( msg ) {
          console.error("Failed to get lesson " + lessonIndex);
          console.error( msg );
        });
    }
    
    function getLessons() {
	    $.ajax({
	      method: "GET",
	      url: "/lessons/get"
	    })
	      .done(function( msg ) {
	        console.log(msg);
	        var lessons = msg;
	        var tableBody = $("#lessonsTableBody");
	        for(var i = 0; i < lessons.length; i++) {
	            var row = document.createElement("tr");
	            var id = document.createElement("td");
	            var title = document.createElement("td");
	            var lessonId = lessons[i].id;
	            $(id).text(lessonId);
	            $(title).text(lessons[i].title);
	            $(row).append(id).append(title);
	            $(row).attr('id', lessonId);
	            $(row).addClass("selectableRow");
	            (function(l_id) {
	                $(row).click(function() {
	            		$("#loadingGif").show();
	                    getLesson(l_id);
	                });
	            })(lessonId);
	            
	            $(tableBody).append(row);
	        }
	      })
	      .fail(function( msg ) {
	        console.error("Failed to get lessons...");
	        console.error( msg );
	    });
	}

    function wsUrl(path) {
	    let l = window.location;
	    let protocol = ((l.protocol === "https:") ? "wss://" : "ws://");
	    let hostname = l.hostname;
	    let port = ((l.port != 80) && (l.port != 443)) ? ":" + l.port : "";
	    return protocol + hostname + port + path;
    }
});