function setup() {
	createCanvas(400,400,WEBGL);
}

function draw() {
	background(186, 244, 255);
	
	var changingAngle = frameCount/130;
	
	rotateX(PI*0.4);
	rotateZ(changingAngle);
	drawAxis();
	push();
	
	//All the wheels
    stroke("black");
    fill("white");
    push();
    translate(70,50,0);
	cylinder(20,20,20,1);
	pop();
    push();
    translate(-70,50,0);
	cylinder(20,20,20,1);
	pop();
    push();
    translate(-70,-50,0);
	cylinder(20,20,20,1);
	pop();
    push();
    translate(70,-50,0);
	cylinder(20,20,20,1);
	pop();
	
	//Car body Bottom
	push();
	translate(0,0,20);
	fill(60, 65, 104);
	box(150,70,40);
	pop();
	
	push();
	translate(0,0,10);
	fill(60, 65, 104);
	box(80,100,40);
	pop();
	
	push();
	translate(0,0,35);
	fill(60, 65, 104);
	box(160,120,20);
	pop();
	
	
	//Car body Top
	push();
	translate(10,0,45);
	beginShape();
	vertex(40,-50,0);
	vertex(40,50,0);
	vertex(-40,50,0);
	vertex(-40,-50,0);
	endShape();
	
	beginShape();
	vertex(20,-50,30);
	vertex(20,50,30);
	vertex(-20,50,30);
	vertex(-20,-50,30);
	endShape();
	
	beginShape();
	vertex(20,-50,30);
	vertex(20,50,30);
	vertex(40,50,0);
	vertex(40,-50,0);
	endShape();
	
	beginShape();
	vertex(-20,50,30);
	vertex(-20,-50,30);
	vertex(-40,-50,0);
	vertex(-40,50,0);
	endShape();
	
	beginShape();
	vertex(-20,50,30);
	vertex(20,50,30);
	vertex(40,50,0);
	vertex(-40,50,0);
	endShape();
	
	beginShape();
	vertex(-20,-50,30);
	vertex(20,-50,30);
	vertex(40,-50,0);
	vertex(-40,-50,0);
	endShape();
	pop();
	
	//Road
	push();
	noStroke();
	translate(0,100,-20);
	fill(45, 45, 45);
	plane(1200,400);
	
	translate(-600,0,1);
	fill("yellow");
	for(let i = 0; i < 24; i++) {
	    translate(50,0,0);
	    plane(30,10);
	}
	pop();
	
	pop();
	
}

function drawAxis(size) {
    push();
    if(size === undefined) {
        size = 100;
    }
    stroke("red");
    line(0,0,0,size,0,0);
    stroke("green");
    line(0,0,0,0,size,0);
    stroke("blue");
    line(0,0,0,0,0,size);
    pop();
}