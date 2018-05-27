function setup() {
	createCanvas(400,400,WEBGL);
}

function draw() {
	background(186, 244, 255);
	
	var changingAngle = frameCount/130;
	
	scale(0.4);
	rotateX(-PI*0.1);
	rotateY(changingAngle);
	
	
	//Sea
	push();
	noStroke();
	fill(105, 234, 228);
	translate(0,60,0);
	rotateX(PI/2);
	plane(1000,1000);
	pop();
	
	//Ship Hull
	push();
	drawAxis(200);
	strokeWeight(3);
	stroke(66, 43, 1);
	fill(99, 66, 4);
	let shipWidthTop = 60;
	let shipHeightTop = 50;
	let shipLengthTop = 150;
	let shipWidthBottom = 40;
	let shipLengthBottom = 80;
	
	beginShape();
	vertex(shipWidthTop,0,shipLengthTop);
	vertex(shipWidthTop,0,-shipLengthTop);
	vertex(shipWidthBottom,shipHeightTop,-shipLengthBottom);
	vertex(shipWidthBottom,shipHeightTop,shipLengthBottom);
	endShape();
	
	beginShape();
	vertex(-shipWidthTop,0,shipLengthTop);
	vertex(-shipWidthTop,0,-shipLengthTop);
	vertex(-shipWidthBottom,shipHeightTop,-shipLengthBottom);
	vertex(-shipWidthBottom,shipHeightTop,shipLengthBottom);
	endShape();
	
	beginShape();
	vertex(shipWidthTop,0,shipLengthTop);
	vertex(-shipWidthTop,0,shipLengthTop);
	vertex(-shipWidthBottom,shipHeightTop,shipLengthBottom);
	vertex(shipWidthBottom,shipHeightTop,shipLengthBottom);
	endShape();
	
	beginShape();
	vertex(shipWidthTop,0,-shipLengthTop);
	vertex(-shipWidthTop,0,-shipLengthTop);
	vertex(-shipWidthBottom,shipHeightTop,-shipLengthBottom);
	vertex(shipWidthBottom,shipHeightTop,-shipLengthBottom);
	endShape();
	
	beginShape();
	vertex(shipWidthBottom,shipHeightTop,shipLengthBottom);
	vertex(-shipWidthBottom,shipHeightTop,shipLengthBottom);
	vertex(-shipWidthBottom,shipHeightTop,-shipLengthBottom);
	vertex(shipWidthBottom,shipHeightTop,-shipLengthBottom);
	endShape();
	
	pop();
	
	//Ship mast
	push();
	strokeWeight(1);
	translate(0,-80,0);
	fill(127, 97, 45);
	cylinder(10,250,8,1);
	pop();
	
	//Ship sail
	push();
	strokeWeight(3);
	stroke(204, 186, 157);
	translate(0,-80,10);
	
	let sailTop = -100;
	let sailLeft = 70;
	let sailWidth = 50;
	let sailHeight = 50;
	
	fill(255, 240, 214);
	beginShape();
	vertex(sailLeft,sailTop,0);
	vertex(0,sailTop,0);
	vertex(0,sailTop+sailHeight,50);
	vertex(sailLeft,sailTop+sailHeight,0);
	endShape();

	beginShape();
	vertex(sailLeft,sailTop+sailHeight,0);
	vertex(0,sailTop+sailHeight,50);
	vertex(0,sailTop+sailHeight*2,0);
	vertex(sailLeft,sailTop+sailHeight*2,0);
	endShape();
	
	beginShape();
	vertex(-sailLeft,sailTop,0);
	vertex(0,sailTop,0);
	vertex(0,sailTop+sailHeight,50);
	vertex(-sailLeft,sailTop+sailHeight,0);
	endShape();
	
	beginShape();
	vertex(-sailLeft,sailTop+sailHeight,0);
	vertex(0,sailTop+sailHeight,50);
	vertex(0,sailTop+sailHeight*2,0);
	vertex(-sailLeft,sailTop+sailHeight*2,0);
	endShape();
	
	pop();
	
	strokeWeight(1);
	stroke(97, 149, 173)
	fill(127, 207, 216);
	randomSeed(1);
	let hFactor = sin(frameCount/10)/2+0.5;
	for(let i = 0; i < 30; i++) {
	    drawWave(random(-400,400),hFactor*10+65,random(-400,400),40,20,100);
	}
	fill(215, 237, 247);
	for(let i = 0; i < 10; i++) {
	    drawWave(random(-400,400),hFactor*10+65,random(-400,400),40,20,300);
	}
	
}

function drawWave(x, y, z, width, height, length) {
    function vert(p) {
        vertex(p[0],p[1],p[2])
    }
    let v1 = [x+length/2,y,z-width/2];
    let v2 = [x+length/2,y,z+width/2];
    let v3 = [x+length/2,y-height,z+width/2];
    let v4 = [x-length/2,y,z-width/2];
    let v5 = [x-length/2,y,z+width/2];
    let v6 = [x-length/2,y-height,z+width/2];
    push();
    beginShape();//side1
    vert(v1);
    vert(v2);
    vert(v3);
    endShape();
    beginShape();//side2
    vert(v4);
    vert(v5);
    vert(v6);
    endShape();
    beginShape();//bottom
    vert(v1);
    vert(v2);
    vert(v5);
    vert(v4);
    endShape();
    beginShape();//angled face
    vert(v1);
    vert(v4);
    vert(v6);
    vert(v3);
    endShape();
    beginShape();//face
    vert(v3);
    vert(v6);
    vert(v5);
    vert(v2);
    endShape();
    pop();
    
}

function drawAxis(size) {
    push();
    strokeWeight(3);
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