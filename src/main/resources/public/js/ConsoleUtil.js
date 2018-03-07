function ConsoleUtil(containerId) {

    var that = this;
    this.jQSelector = "#"+containerId;
    this.isConsoleReplaced = false;

    addPreChildElement();

    this.runThis = function(codeRunnerFunc, doRestore) {
        try {
            replaceConsole();
            codeRunnerFunc();
        } catch (e) {
            handleException(e);
        } finally {
            if(doRestore) {
                restoreConsole();
            }
        }
        insertCodeOutputSeparator();
        scrollToBottom();
    };


    function addPreChildElement() {
        var consoleHTML = 
        '<pre>'+
        '<span>Console Output</span>'+
        '<hr style="margin:0;" class="codeRunSeparator"/>'+
        '</pre>';
        $(that.jQSelector).html(consoleHTML);
    }

    function appender(line) {
        $(that.jQSelector + " pre").append(line);
    }

    function replaceConsole() {
        if(that.isConsoleReplaced) {return;}
        console.log("Replacing console");
        if (typeof console  != "undefined") {
            if (typeof console.log != 'undefined') {
                console.originalLog = console.log;
                console.originalError = console.error;
            } else {
                console.originalLog = function() {};
                console.originalError = function() {};
            }     
        }
        console.log = function(message) {
            console.originalLog(message);
            newlog(arguments);
        };
        console.error = function(message) {
            console.originalError(message);
            newerror(message);
        };
        that.isConsoleReplaced = true;
    }

    function restoreConsole() {
        if(!that.isConsoleReplaced) {return;}
        console.originalLog("Restoring console.");
        if (typeof console  != "undefined") {
            if (typeof console.log != 'undefined') {
                console.log = console.originalLog;
                console.error = console.originalError;
            } else {
                console.log = function() {};
                console.error = function() {};
            }     
        }
        that.isConsoleReplaced = false;
    }

    window.print = function() {
        console.log(arguments);
    };

    function newlog(message) {
        var args = arguments[0];
        for(var i = 0; i < args.length; i++) {
            var line = $(document.createElement("span"));
            line.addClass("codeOutput");
            line.html(getHTMLForOutput(args[i]));
            line.html(line.html() + " ");
            appender(line);
        }
        appender(document.createElement("br"));
    };

    function newerror(message) {
        var line = $(document.createElement("span"));
        line.addClass("codeOutputError");
        line.text(" " + message + " ");
        appender(line);
        appender(document.createElement("br"));
    };

    function insertCodeOutputSeparator() {
        var line = $(document.createElement("hr"));
        line.addClass("codeRunSeparator");
        $(that.jQSelector + " pre").append(line);
    }

    function scrollToBottom() {
        // var d = $(that.jQSelector);
        // d.scrollTop(d.prop("scrollHeight"));
        $(that.jQSelector).animate({ scrollTop: $(that.jQSelector).prop("scrollHeight")}, 500);
    };

    function getHTMLForOutput(value, withQuotesIfString) {
        if(value === null) {
            return handleNull();
        } else if (value === undefined) {
            return handleUndefined();
        } else if(typeof value == "object") {
            //cyclic relationships will cause a stackoverflow
            //but the browser will take care of terminating it after 20 seconds or so
            if(Array.isArray(value)) {
                return handleArray(value); 
            } else {
                return handleObject(value);
            }
        } else if(typeof value == "string") {
            return handleString(value);
        } else if(typeof value == "number") {
            return handleNumber(value);
        } else if(typeof value == "boolean") {
            return handleBoolean(value);
        } else if(typeof value == "function") {
            return handleFunction(value);
        }

        function handleNull() {
            var s = $(document.createElement("span"));
            s.addClass("booleanOutput");
            s.text("null");
            return s;
        }
        function handleUndefined(value) {
            var s = $(document.createElement("span"));
            s.addClass("greyOutput");
            s.text("undefined");
            return s;
        }
        function handleBoolean(value) {
            var s = $(document.createElement("span"));
            s.addClass("booleanOutput");
            s.text(value);
            return s;
        }
        function handleNumber(value) {
            var s = $(document.createElement("span"));
            s.addClass("numberOutput");
            s.text(value);
            return s;
        }
        function handleString(value) {
            var s = $(document.createElement("span"));
            s.addClass("stringOutput");
            if(withQuotesIfString) {
                value = '"' + value + '"';
            }
            s.text(value);
            return s;
        }
        function handleObject(value) {
            var s = $(document.createElement("span"));
            var prefix = $(document.createElement("span")).addClass("typePrefixOutput");
            prefix.text("Object");
            s.append(prefix).append(curlyOpen());
            var notEmpty = false;
            for(var k in value) {
                if(value.hasOwnProperty(k)) {
                    notEmpty = true;
                    var key = $(document.createElement("span")).addClass("keyOutput").text(k);
                    s.append(key);
                    s.append(colonSeparator());
                    s.append(getHTMLForOutput(value[k], true));
                    s.append(commaSeparator());
                }
            }
            if(notEmpty) s[0].removeChild(s[0].lastChild); //remove last comma
            s.append(curlyClose());
            return s;
        }
        function handleArray(value) {
            var s = $(document.createElement("span"));
            var prefix = $(document.createElement("span")).addClass("typePrefixOutput");
            prefix.text("Array");
            s.append(prefix).append(squareOpen());
            for(var i = 0; i < value.length; i++) {
                s.append(getHTMLForOutput(value[i], true));
                if(i != value.length - 1) { //last element
                    s.append(commaSeparator());
                }
            }
            s.append(squareClose());
            return s;
        }
        function handleFunction(value) {
            var s = $(document.createElement("span"));
            var prefix = $(document.createElement("span")).addClass("stringOutput");
            prefix.text("function ");
            var funcName = $(document.createElement("span")).addClass("typePrefixOutput");
            funcName.text(value.name);
            var brackets = $(document.createElement("span")).addClass("greyOutput");
            brackets.text("()");
            s.append(prefix).append(funcName).append(brackets);
            return s;
        }
        function squareOpen() {
            return $(document.createElement("span")).addClass("greyOutput").text(" [ ");
        }
        function squareClose() {
            return $(document.createElement("span")).addClass("greyOutput").text(" ]");
        }
        function curlyOpen() {
            return $(document.createElement("span")).addClass("greyOutput").text(" { ");
        }
        function curlyClose() {
            return $(document.createElement("span")).addClass("greyOutput").text(" }");
        }
        function commaSeparator() {
            return $(document.createElement("span")).addClass("greyOutput").text(", ");
        }
        function colonSeparator() {
            return $(document.createElement("span")).addClass("greyOutput").text(": ");
        }
    }

    function handleException(e) {
        window.ee = e;
        console.originalLog(e);
        var matches = e.stack.match("(?:eval):\\d+"); //firefox
        if(!matches) {
            matches = e.stack.match("(?:anonymous>):\\d+"); //chrome
            if(!matches) {
                matches = e.stack.match("(?:code):\\d+"); //IE
            }
        }
        if(matches && matches.length > 0) {
            var lineNum;
            if(e.lineNumber) {
                lineNum = e.lineNumber; //firefox has this property
            } else {
                lineNum = matches[0].split(":")[1] || "??"; 
            }
            newerror("Line " + lineNum + ": " + e);
        } else {
            var lineNum = "??";
            if(e.lineNumber) {
                lineNum = e.lineNumber; //firefox has this property
            }
            newerror("Line " + lineNum + ": " + e);
        }
    }


}