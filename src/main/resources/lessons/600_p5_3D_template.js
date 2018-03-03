function setup() {
	createCanvas(300,300,WEBGL);
}

function draw() {
	background(200);
	translate(0, 0, -200);
	strokeWeight(5);
	rotateX(frameCount/200);
	rotateY(frameCount/150);
	rectMode(CENTER);
	box(150, 150, 150);
}