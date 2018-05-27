function setup() {
	createCanvas(400,400,WEBGL);
}

function draw() {
	background(186, 244, 255);
	push();
	
	var changeAngle = frameCount/200;
	//Grass plane
	push();
	noStroke();
	fill("green");
	translate(0,50,0);
	rotateX(PI*0.4);
	rotateZ(changeAngle);
	plane(220,220);
	
	stroke(0);
	fill(255, 234, 216);
	translate(0,0,51);
	
	//Wall 1
	push();
	translate(50,0,0);
	fill(255, 234, 216);
	box(5,100,100);
	
	//Windows
	fill(219, 255, 248);
	translate(0,-20,20);
	box(6,20,20);
	translate(0,40,0);
	box(6,20,20);
	pop();
	
	rotateZ(PI/2);
	
	//Wall 2
	push();
	translate(50,0,0);
	fill(255, 234, 216);
	box(5,100,100);
	
	//Windows
	fill(219, 255, 248);
	translate(0,-20,20);
	box(6,20,20);
	translate(0,40,0);
	box(6,20,20);
	pop();
	
	rotateZ(PI/2);
	
	//Wall 3
	push();
	translate(50,0,0);
	fill(255, 234, 216);
	box(5,100,100);
	
	//Windows
	fill(219, 255, 248);
	translate(0,-20,20);
	box(6,20,20);
	translate(0,40,0);
	box(6,20,20);
	pop();
	
	rotateZ(PI/2);
	
	//Wall 4
	push();
	translate(50,0,0);
	fill(255, 234, 216);
	box(5,100,100);
	
	//Windows
	fill(219, 255, 248);
	translate(0,-20,20);
	box(6,20,20);
	translate(0,40,0);
	box(6,20,20);
	pop();
	
	//Roof
	push();
	rotateX(PI/2);
	rotateY(PI/4);
	translate(0,75,0);
	fill(94, 44, 1);
	cone(80,50,4);
	pop();
	
	//Door
	push();
	translate(20,53,-35);
	box(15,2,40);
	pop();
	
}