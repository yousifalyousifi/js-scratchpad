function setup() {
	createCanvas(400,400,WEBGL);
}

function draw() {
	background(186, 244, 255);
	
	var changingAngle = frameCount/100;
	
	
	drawAxis(200);
	translate(0,-50,0);
	rotateX(-PI/20);
	rotateY(changingAngle);
	
	//Stem
	push();
	strokeWeight(1);
    stroke("black");
    fill("green");
    translate(0,140,0);
	cylinder(5,200,5,1);
	pop();
	
	//Leaf 1
	push();
	strokeWeight(1);
    stroke("black");
    fill("green");
    translate(40,140,0);
    rotateY(PI/2);
    rotateZ(PI/3);
	scale(0.5,1,1);
	cylinder(50,10,5,1);
	pop();
	
	//Leaf 1
	push();
	strokeWeight(1);
    stroke("black");
    fill("green");
    translate(-40,170,0);
    rotateY(3*PI/2);
    rotateZ(PI/3);
	scale(0.5,1,1);
	cylinder(50,10,5,1);
	pop();
	
	//Flower centre
	push();
    stroke("black");
    fill("brown");
	rotateX(PI/2);
	cylinder(40,15,20,1);
	pop();
	
	//Petals
	push();
    stroke("black");
    fill("yellow");
	rotateX(PI/2);
	rotateZ(PI/20);
	strokeWeight(1);
	for(let i = 0; i < 16; i++) {
	    rotateY(PI/8);
	    push();
	    rotateZ(PI/7);
	    translate(0,0,70);
	    scale(0.5,1,1);
	    cylinder(40,5,20,1);
	    translate(0,0,-75);
	    pop();
	}
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