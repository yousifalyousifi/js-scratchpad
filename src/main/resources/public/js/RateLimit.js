//http://stackoverflow.com/q/23072815/1987694
function RateLimit(fn, delay, context) {
  var queue = [], timer = null;
    
  function processQueue() {
    var item = queue.shift();
    if (item)
      fn.apply(item.context, item.arguments);
    if (queue.length === 0) {
      console.olog("CLREARING");
      clearInterval(timer);
      timer = null;
    }
  }

  return function limited() {
    queue.push({
      context: context || this,
      arguments: [].slice.call(arguments)
    });
    if (!timer) {
      processQueue();  // start immediately on the first invocation
      timer = setInterval(processQueue, delay);
    }
  }

}

// function foo(param1, param2) {
//   var p = document.createElement('p');
//   p.innerText = param1 + (param2 || '');
//   document.body.appendChild(p);
// }
    
// foo('Starting');
// var bar = RateLimit(foo, 2000);
// bar(1, 'baz');
// bar(2, 'quux');
// bar(3);
// bar(4, 'optional');
// bar(5, 'parameters');
// bar(6);
// bar(7);
// bar(8);
// bar(9);