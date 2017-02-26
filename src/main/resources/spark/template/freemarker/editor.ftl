<!DOCTYPE html>
<html>
<head>
  <#include "header.ftl">
</head>

<body>

  <#include "nav.ftl">

<div class="jumbotron text-center">
  <div class="container">
    <a href="/" class="lang-logo">
      <img src="/lang-logo.png">
    </a>
    <h1>Getting Started with Java on Heroku</h1>
    <p>This is a sample Java application deployed to Heroku. It's a reasonably simple app - but a good foundation for understanding how to get the most out of the Heroku platform.</p>
    <a type="button" class="btn btn-lg btn-default" href="https://devcenter.heroku.com/articles/getting-started-with-java"><span class="glyphicon glyphicon-flash"></span> Getting Started with Java</a>
    <a type="button" class="btn btn-lg btn-primary" href="https://github.com/heroku/java-getting-started"><span class="glyphicon glyphicon-download"></span> Source on GitHub</a>
  </div>
</div>
<div id="debigDiv"></div>
<script>

if (typeof console  != "undefined") 
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

console.log = function(message) {
    console.olog(message);
    $('#debugDiv').append('<p>' + message + '</p>');
};
console.error = console.debug = console.info =  console.log
g();
console.log("HI");

window.runcode= function() {
var code = $('textarea')[0].val();
};
</script>
<div class="container">
  <textarea></textarea>
  <button name="Run" onclick='window.runcode();'>Run</button>
</div>


</body>
</html>
