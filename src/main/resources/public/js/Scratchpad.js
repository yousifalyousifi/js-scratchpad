$(document).ready(function() {
    
    var that = this;
    var currentFontSize = 14;
    var mode = undefined;

    var codeRunner = new CodeRunner("#displayContainer pre");
    var drawRunner = new DrawRunner("p5Container");
    var runner = codeRunner; 

    var appProps = {};
    
    var storedMode = window.localStorage.getItem("mode");
    if(storedMode && storedMode == "draw") {
        drawMode();
    } else {
        consoleMode();
    }
    guestMode();

    var editor = ace.edit("editor");

    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: false
    });

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
    editor.getSession().on('change', function() {
        if(window.autoRerunSketchHandler && appProps.autorun) {
            console.log("Delaying redraw.")
            clearTimeout(window.autoRerunSketchHandler);
        }
        window.autoRerunSketchHandler = setTimeout(function() {
            if(mode == "draw" && appProps.autorun) {
                console.log("Auto redrawing.")
                that.runThis(editor.getValue(), false);
            }
        }, 1000);
    });
    editor.commands.addCommand({
        name: 'run',
        bindKey: {win: 'Ctrl-R',  mac: 'Command-R'},
        exec: function(editor) {
            that.runThis(editor.getValue(), true);
        },
        readOnly: false // false if this command should not apply in readOnly mode
    });

    setFontSize(currentFontSize);
    getSnippets();

    function setFontSize(size) {
        editor.setFontSize(size);
        $("#displayContainer").css("font-size", size+"px");
    }

    $("#runButton").click(function() {
        that.runThis(editor.getValue(), true);
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
    
    $("#p5RefButton").click(function() {
        let p5RefUrl = "https://p5js.org/reference/";
        let p5RefSearchUrl = p5RefUrl + "#/p5/";
        let selectedText = editor.getSelectedText();
        if(selectedText) {
            window.open(p5RefSearchUrl+selectedText, "_blank").focus();
        } else {
            window.open(p5RefUrl, "_blank").focus();
        }
    });

    //https://stackoverflow.com/a/28603203/1987694
    $("#ratioButtons :input").change(function() {
        let ratio = $(this).attr("id");
        let disp = $("#displayContainer");
        let edit = $("#editorContainer");
        if(ratio == "option1") {
            disp.css("left", "30%");
            edit.css("right", "71%");
        } else if(ratio == "option2") {
            disp.css("left", "50%");
            edit.css("right", "51%");
        } else if(ratio == "option3") {
            disp.css("left", "70%");
            edit.css("right", "31%");
        }
    });
    
    //https://stackoverflow.com/a/3442342/1987694
    $('#settingsCheckbox input:checkbox').change(function() {
        // this will contain a reference to the checkbox   
        if (this.checked) {
            // the checkbox is now checked 
            appProps.autorun = true;
        } else {
            // the checkbox is now no longer checked
            appProps.autorun = false;
        }
    }); 

    //This stops the dropdown from closing on click
    $('#settingsCheckbox label').click(function(e) {
        e.stopPropagation();
    });
    //This stops the dropdown from closing on click
    $('#settingsCheckbox').click(function(e) {
        e.stopPropagation();
    });

    //This stops the dropdown from closing on click
    // $('#viewDropdownMenu').click(function(e) {
    //     e.stopPropagation();
    // });

    $('#registerModal .submitModal').click(function() {
        console.log("register submit");
        let u = $("#usernameRegisterInput").val();
        let p = $("#passwordRegisterInput").val();
        let rp = $("#passwordRetypeRegisterInput").val();
        if(p == rp) {
            $('#registerModal .submitModal').attr("disabled", "disabled");
            register(u, p, 
                function success(msg) {
                    showStatus("Success", "GreenYellow");
                    $('#registerModal .submitModal').removeAttr("disabled");
                    clearAllUserModalInputs();
                },
                function fail(msg) {
                    showStatus("Failed: " + msg, "Crimson");
                    $('#registerModal .submitModal').removeAttr("disabled");
            });
        } else {
            showStatus("Passwords don't match", "Crimson");
        }
        function showStatus(text, color) {showModalStatus("registerModal", text, color);}
        return false;
    }); 

    $('#loginModal .submitModal').click(function() {
        console.log("login submit");
        let u = $("#usernameLoginInput").val();
        let p = $("#passwordLoginInput").val();
        $('#loginModal .submitModal').attr("disabled", "disabled");
        login(u, p, 
            function success(msg) {
                showStatus("Success", "GreenYellow");
                $('#loginModal .submitModal').removeAttr("disabled");
                userMode();
                clearAllUserModalInputs();
            },
            function fail(msg) {
                showStatus("Failed: " + msg, "Crimson");
                $('#loginModal .submitModal').removeAttr("disabled");
        });
        function showStatus(text, color) {showModalStatus("loginModal", text, color);}
        return false;
    }); 

    $('#loginModal, #registerModal').on("hidden.bs.modal", function() {
        console.log("clearall");
        clearAllUserModalInputs();
        clearAllUserModalStatuses();
    }); 

    $('#loginModal').on("shown.bs.modal", function() {
        $("#usernameLoginInput").focus();
    }); 

    $('#registerModal').on("shown.bs.modal", function() {
        $("#usernameRegisterInput").focus();
    }); 

    $("#logOut").click(function() {
        logout(
        function success() {
            guestMode();
        }
        , 
        function fail() {console.error("Log out failed")});
    });

    function userMode() {
        $(".guestControl").hide();
        $(".userControl").show();
    };
    function guestMode() {
        $(".guestControl").show();
        $(".userControl").hide();
    };

    function showModalStatus(modalId, text, color) {
        let el = $("#" + modalId + " .modalStatus");
        el.text(text);
        el.css("color", color);
    }


    function clearAllUserModalInputs() {
        $("#usernameRegisterInput").val("");
        $("#passwordRegisterInput").val("");
        $("#passwordRetypeRegisterInput").val("");
        $("#usernameLoginInput").val("");
        $("#passwordLoginInput").val("");
    }

    function clearAllUserModalStatuses() {
        let el;
        el = $("#registerModal .modalStatus");
        el.text("");
        el = $("#loginModal .modalStatus");
        el.text("");
    }


    $("#consoleMode").click(function() {
        window.localStorage.setItem("mode", "console");
    	consoleMode();
    });

    $("#drawMode").click(function() {
        window.localStorage.setItem("mode", "draw");
    	drawMode();
    });

    function consoleMode() {
        if(mode == "console") {return;}
        drawRunner.exitMode();
        codeRunner.enterMode();
        mode = "console";
        runner = codeRunner;
    }
    function drawMode() {
    	if(mode == "draw") {return;}
        codeRunner.exitMode();
        drawRunner.enterMode();
    	mode = "draw";
    	runner = drawRunner;
    }

    var someUniqueId = "ID" + (new Date().getTime());
    this.runThis = function(code, send) {
    	runner.runThis(code);
        if(mode == "draw" && send) {
            sendSketch(someUniqueId, code);
            console.log("Sent code from ID: " + someUniqueId);
        }
    };

    function getSnippet(snippetIndex) {
        $.ajax({
          method: "GET",
          url: "/snippets/get/" + snippetIndex
        })
        .done(function( snippet ) {
            console.log(snippet);
            editor.setValue(snippet.snippet);
            editor.gotoLine(editor.session.getLength() + 1);
            $("#loadingGif").hide();
            $('#snippetsModal').modal('hide');
        })
        .fail(function( msg ) {
          console.error("Failed to get snippet " + snippetIndex);
          console.error( msg );
        });
    }
    
    function getSnippets() {
	    $.ajax({
	      method: "GET",
	      url: "/snippets/get"
	    })
	      .done(function( msg ) {
	        console.log(msg);
	        var snippets = msg;
	        var tableBody = $("#snippetsTableBody");
	        for(var i = 0; i < snippets.length; i++) {
	            var row = document.createElement("tr");
	            var id = document.createElement("td");
	            var title = document.createElement("td");
	            var snippetId = snippets[i].id;
	            $(id).text(snippetId);
	            $(title).text(snippets[i].title);
	            $(row).append(id).append(title);
	            $(row).attr('id', snippetId);
	            $(row).addClass("selectableRow");
	            (function(l_id) {
	                $(row).click(function() {
	            		$("#loadingGif").show();
	                    getSnippet(l_id);
	                });
	            })(snippetId);
	            
	            $(tableBody).append(row);
	        }
	      })
	      .fail(function( msg ) {
	        console.error("Failed to get snippets...");
	        console.error( msg );
	    });
	}

    function sendSketch(myId, sketchCode) {
        $.ajax({
          method: "POST",
          url: "/sketch/send",
          data: {
            id: myId,
            code: sketchCode
          }
        })
        .done(function( msg ) {

        })
        .fail(function( msg ) {
          console.error("Failed to get snippets...");
          console.error( msg );
        });
    }

    function login(username, password, success, fail) {
        $.ajax({
          method: "POST",
          url: "/login",
          data: {
            username: username,
            password: password
          }
        })
        .done(success)
        .fail(fail);
    }

    function logout(success, fail) {
        $.ajax({
          method: "POST",
          url: "/logout"
        })
        .done(success)
        .fail(fail);
    }

    function register(username, password, success, fail) {
        $.ajax({
          method: "POST",
          url: "/register",
          data: {
            username: username,
            password: password
          }
        })
        .done(success)
        .fail(fail);
    }

});