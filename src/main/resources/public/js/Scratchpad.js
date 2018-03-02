$(document).ready(function() {

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
            coderunner.runThis(editor.getValue());
        },
        readOnly: false // false if this command should not apply in readOnly mode
    });

    function wsUrl(path) {
	    let l = window.location;
	    let protocol = ((l.protocol === "https:") ? "wss://" : "ws://");
	    let hostname = l.hostname;
	    let port = ((l.port != 80) && (l.port != 443)) ? ":" + l.port : "";
	    return protocol + hostname + port + path;
    }

    var coderunner = new CodeRunner("#displayContainer pre");
    $("#runButton").click(function() {
        coderunner.runThis(editor.getValue());
    });
    $("#font14px").click(function() {
        editor.setFontSize(14);
        $("#displayContainer span").css("font-size", "14px");

    });
    $("#font18px").click(function() {
        editor.setFontSize(18);
        $("#displayContainer span").css("font-size", "18px");
    });
    $("#font24px").click(function() {
        editor.setFontSize(24);
        $("#displayContainer span").css("font-size", "24px");
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
    $("#loadButton").click(function() {
    });

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
});