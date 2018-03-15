self.flag=false;
self.count=0;


self.onmessage=function(e){
	console.group("[worker]");
	console.groupEnd();
	let startTime = e.data.startTime;
	let duration = e.data.duration;
	console.log(startTime);
	console.log(duration);

	let currentTime = new Date().getTime();
	// while(currentTime < startTime + duration){
	// 	console.log(currentTime);
	// 	self.count++;
	// 	currentTime = new Date().getTime();
	// };
	postMessage('count: '+self.count);

}