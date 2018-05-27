function setup() {
	createCanvas(400,400,WEBGL);
}

function draw() {
	background(186, 244, 255);
	push();
	
	//Grass plane
	noStroke();
	fill("green");
	rotateX(PI/2.3);
	translate(0,100,0);
	rotateZ(frameCount/140);
	plane(220,220);
	
	
	//Big Log
	push();
	fill(102, 67, 37);
	translate(70,0,9);
	stroke(0);
	cylinder(15,170, 9,1);
	pop();
	
	//Fire Wood
	push();
	strokeWeight(1);
	stroke(0);
	fill(102, 67, 37);
	cylinder(5,50, 10,1);
	rotateX(PI/1.5);
	rotateZ(PI/2.1);
	cylinder(5,50, 10,1);
	rotateX(PI/1.5);
	cylinder(5,50, 10,1);
	pop();
	
	//Fire
	push();
	noStroke();
	fill("orange");
	rotateX(PI/2);
	translate(0,30,0);
	cone(10,50,3,1);
	fill("yellow");
	translate(10,-10,0);
	cone(6,30,3);
	fill("red");
	translate(-10,-10,10);
	cone(6,20,3);
	pop();
}