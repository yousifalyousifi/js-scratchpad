function setup() {
	createCanvas(300,300);
}

function draw() {
	background(200);
	translate(width/2, height/2);
	rotate(frameCount/200);
	rectMode(CENTER);
	strokeWeight(2);
	rect(0, 0, 150, 150);
}