// grootte van de asteroids
const BIG = 40;
const SMALL = 10;

// snelheidsfactor van de raketten
const ROCKET_SPEED = 8;
// maximaal aantal raketten
const MAX_ROCKETS = 20;

// explosion stuff
const EXPLOSION_SPEED = 32;

const EXPLOSION_LIFETIME = 30;

const NUM_OF_PARTICLES = 12;

const NUM_OF_SMALL_ASTEROIDS = 30;

// de versnelling bij pijltje omhoog
const ACCELERATION = 0.09;

// rotatie eenheden, hoeveel draai je als je pijljte indrukt
const NORMAL_ROTATION = 0.05;

// variabelen
var canvas;

// breedtw + hoogte van het canvas
var maxWidth;

var maxHeight;

// spaceship vars
// het x coordinaat van het ruimteschip
var x;
// het y coordinaat van het ruimteschip
var y;
// number of 360 spreads
var spreads = 0;
// start health
var health = 0;
// score
var score = 0;
var maxScore = 0;
// richtingsvector spaceship
var richtingsVector;
// de hoek van het ruimteschip
var rotation;

var rocketsFired;

var stopFiring;


// welke toets is ingedrukt?
var up = false;
var down = false;
var right = false;
var left = false;
var space = false;
var shift = false;

// rockets: een lijst met afgevuurde raketten
var rockets = [];
// explosion particles
var explosions = [];
// lijst met alle asteroids
var asteroids;

window.onload = function() {
	init();
	initAnimation();
}


function init() {
	// alles resetten
	if (health == 0) {
		health = 250;
		score = 0;
		rotation = 0;
		richtingsVector = [0.01, 0.4];
		spreads = 0;
	}
	spreads += 5;
	
	rocketsFired = 0;
	stopFiring = false;
	rockets = [];

	// canvas met het id "game" opvragen uit HTML
	canvas = document.getElementById("game");

	maxWidth = canvas.width;
	maxHeight = canvas.height;
	x = maxWidth / 2;
	y = maxHeight / 2;

	// pijltjestoetsen afhandeling regelen...
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	
	// aanmaken van de grote asteroids
	asteroids = [];
	for (var i = 0; i < 5; i++) {
		var asteroid = [Math.random() * maxWidth,		// 0 = x positie
						Math.random() * maxHeight,		// 1 = y positie
						(Math.random() * 4) - 2,		// 2 = x vector
						(Math.random() * 4) - 2,		// 3 = y vector
						BIG,							// 4 = diameter
						Math.random() * 30,				// 5 = sterkte
						(Math.random() * 0.04) - 0.02,	// 6 = rotatie richting
						Math.random() * Math.PI * 2];	// 7 = rotatie
		asteroids.push(asteroid);				
	}
}

function initAnimation() {
	// animatie
	// vraag aan de browser om maximaal 60 fps te animeren
	window.requestAnimFrame = (function(callback){
		return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
	})();
	
	(function animloop(){
		
		moveShip();
		moveRockets();
		moveExplosions();
		moveAsteroids();

		
		if (rocketsFired == MAX_ROCKETS) {
			stopFiring = true;
		} 

		if (rocketsFired == 0) {
			stopFiring = false;
		}

		if (space && health > 0 && !stopFiring) {
			fire();
		}
		if (stopFiring) {
			rocketsFired--;
		}

		detectCollisions();
		cleanUp();
		maxScore = score > maxScore ? score : maxScore;
		tekenScherm();
		requestAnimFrame(animloop);
	})();
}


function moveShip() {
	if (left) {
		rotation -= NORMAL_ROTATION;
	} 
	if (right) {
		rotation += NORMAL_ROTATION;
	}
	// de rotatie is altijd tussen de 0 en de 2 PI
	// de modulo operator (%) zorgt hiervoor
	rotation = rotation % (Math.PI * 2);
	
	// accelerate
	if (up) {
		beta = (Math.PI / 2) - rotation;
		richtingsVector[0] += Math.sin(rotation) * ACCELERATION;
		richtingsVector[1] += Math.sin(beta) * ACCELERATION;
	} 
	
	// move the ship
	x += richtingsVector[0];
	y -= richtingsVector[1];
	
	// het ruimteschip in beeld houden
	if (x < 0) {
		x = maxWidth;
	} else if (x > maxWidth) {
		x = 0;
	}
	if (y < 0) {
		y = maxHeight;
	} else if (y > maxHeight) {
		y = 0;
	}
}

function fire() {
	var rocket = [x, y, rotation, false];
	rockets.push(rocket);
	rocketsFired++;
}

function spread() {
	if (health > 0 && spreads > 0) {
		spreads--;
		for (var i=0; i < 100; i++) {
			var rocketRotation = i * ((Math.PI * 2) / 100);
			var rocket = [x, y, rocketRotation, false];
			rockets.push(rocket);
		}
	}
}

function explode(explosionX, explosionY, color) {
	for (var i=0; i < NUM_OF_PARTICLES; i++) {
		var explosionRotation = i * ((Math.PI * 2) / NUM_OF_PARTICLES);
		var explosion = [explosionX, explosionY, explosionRotation, EXPLOSION_LIFETIME, color];
		explosions.push(explosion);
	}
}

function moveRockets() {
	for (var i = 0; i < rockets.length; i++) {
		var rocket = rockets[i];
		beta = (Math.PI / 2) - rocket[2];
		rocket[0] += Math.sin(rocket[2]) * ROCKET_SPEED;
		rocket[1] -= Math.sin(beta) * ROCKET_SPEED;
		if (rocket[0] < 0 || rocket[0] > 800 || rocket[1] < 0 || rocket[1] > 640) {
			// the rocket left the screen...
			rocket[3] = true;
		} 
	}
}

function moveExplosions() {
	for (var i = 0; i < explosions.length; i++) {
		var explosion = explosions[i];
		beta = (Math.PI / 2) - explosion[2];
		explosion[0] += Math.sin(explosion[2]) * (explosion[3] / 10);
		explosion[1] -= Math.sin(beta) * (explosion[3] / 10);
		explosion[3]--;
	}
}

function moveAsteroids() {
	for (var i=0; i < asteroids.length; i++) {
		var asteroid = asteroids[i];
		asteroid[0] += asteroid[2];
		asteroid[1] += asteroid[3];
		// keep asteroid on the canvas
		if (asteroid[0] - asteroid[4] > maxWidth) {
			asteroid[0] = 0;
		} else if (asteroid[0] + asteroid[4] < 0) {
			asteroid[0] = maxWidth;
		}
		if (asteroid[1] - asteroid[4] > maxHeight) {
			asteroid[1] = 0;
		} else if (asteroid[1] + asteroid[4] < 0) {
			asteroid[1] = maxHeight;
		}
		// rotate the asteroid
		asteroid[7] += asteroid[6];
		asteroid[7] = asteroid[7] % (Math.PI * 2);
	}
}

function detectCollisions() {
	var newAsteroids = [];
	for (var i=0; i < asteroids.length; i++) {
		var asteroid = asteroids[i];
		if (health > 0) {
			var distanceToSpaceShip = distance(asteroid[0], asteroid[1], x, y);
			if (distanceToSpaceShip < asteroid[4] + 10) {
				health -= Math.round(asteroid[5] * 10);
				asteroid[5]--;
				explode(x, y, [0, 200, 0]);
			} 
			if (health <= 0) {
				explode(x, y, [255,0,255]);
				health = 0;
			}
		}
		
		for (var j = 0; j < rockets.length; j++) {
			var rocket = rockets[j];	
			// bepaal afstand tussen rocket en asteroid
			// als kleiner dan straal: BOEM!
			var distanceToRocket = distance(asteroid[0], asteroid[1], rocket[0], rocket[1]);
			if (distanceToRocket < asteroid[4]) {
				score += 1000 + Math.round(asteroid[5]);
				rocket[3] = true;
				asteroid[5]--;
			}
		}
	}
}

function cleanUp() {
	var newAsteroids = [];
	for (var i=0; i < asteroids.length; i++) {
		var asteroid = asteroids[i];
		if (asteroid[5] > 0) {
			newAsteroids.push(asteroid);
		} else {
			explode(asteroid[0], asteroid[1], [255,0,0]);
			if (asteroid[4] == BIG) {
				// voeg nieuwe, kleine asteroids toe
				for (var j = 0; j < NUM_OF_SMALL_ASTEROIDS; j++) {
					var newAsteroid = [asteroid[0],
									asteroid[1],
									(Math.random()*2) - 1,
									(Math.random()*2) - 1,
									SMALL,
									Math.random() * 8,
									(Math.random()* 0.04) - 0.02,
									Math.random() *  Math.PI * 2];				
					newAsteroids.push(newAsteroid);				
				}
			}
		}
	}
	asteroids = newAsteroids;
	var newRockets = [];
	for (var i=0; i < rockets.length; i++) {
		var rocket = rockets[i];
		if (!rocket[3]) {
			newRockets.push(rocket);
		}
	}
	rockets = newRockets;
	
	var newExplosions = [];
	for (var i=0; i < explosions.length; i++) {
		var explosion = explosions[i];
		if (explosion[3] > 0) {
			newExplosions.push(explosion);
		}
	}
	explosions = newExplosions;
}

// het tekenen van het scherm
function tekenScherm() {
	var ctx = canvas.getContext("2d");
 	// canvas leeg maken, het canvas is 800px breed en 640px hoog
	ctx.clearRect(0, 0, 800, 640);
	drawRockets(ctx);
	drawExplosions(ctx);
	drawAsteroids(ctx);
	// teken de vliegtuig
	if (health > 0) {
		drawSpaceship(ctx);
	} else {
		ctx.save();
		ctx.font = "40pt Calibri";
		ctx.textAlign = 'center'
        ctx.fillText("Game over", 400, 320);
        ctx.restore();
	}
	if (asteroids.length == 0) {
		ctx.save();
		ctx.font = "40pt Calibri";
		ctx.textAlign = 'center'
        ctx.fillText("You've won!", 400, 320);
        ctx.restore();
	}
	ctx.font = "14pt Calibri";
	ctx.fillStyle = "white";
	if (maxScore == score) {
		ctx.fillStyle = "green";
	}
	ctx.fillText("Score: " + score, 1, 20);
	ctx.fillStyle = "white";
	ctx.fillText("Max score: " + maxScore, 1, 40);
	if (health < 80) {
		ctx.fillStyle = "red";
	}
	ctx.fillText("Health: " + health, 1, 60);
	ctx.fillStyle = "white";
	ctx.fillText("360 spreads left: " + spreads, 1, 80);
	ctx.fillText("Asteroids in air: " + asteroids.length, 1, 100);
}

function drawRockets(ctx) {
	for (var i = 0; i < rockets.length; i++) {
		var rocket = rockets[i];
		ctx.save();
		ctx.fillStyle = "yellow";
		ctx.translate(rocket[0], rocket[1]);
		ctx.rotate(rocket[2]);
		ctx.translate(-2, -10);
		roundRect(ctx, -1, 0, 4, 4, 2);
		ctx.fill();
		ctx.restore();
	}
}

function drawExplosions(ctx) {
	for (var i = 0; i < explosions.length; i++) {
		var explosion = explosions[i];
		ctx.save();
		var red = Math.round(explosion[3] * (explosion[4][0] / EXPLOSION_LIFETIME));
		var green = Math.round(explosion[3] * (explosion[4][1] / EXPLOSION_LIFETIME));
		var blue = Math.round(explosion[3] * (explosion[4][2] / EXPLOSION_LIFETIME));
		ctx.fillStyle = "rgb("+red+","+green+","+blue+")";
		ctx.translate(explosion[0], explosion[1]);
		ctx.beginPath();
        ctx.moveTo(5,0);
		ctx.arc(0,0,5,0,Math.PI*2,false);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
}

// spaceship tekenen
function drawSpaceship(ctx) {
	ctx.save();
	// transleer de context, zodat de ruimteschip op de juiste plaats wordt getekend
	ctx.translate(x, y);
	
	ctx.rotate(rotation);
	// nog een keer transleren om het midden van het ruimteschip te corrigeren
	
	ctx.translate(-10, -10);
    ctx.save();
	
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(0.9, 16.0);
	ctx.lineTo(9.5, 1.0);
	ctx.lineTo(18.2, 16.0);
	ctx.lineTo(0.9, 16.0);
	ctx.closePath();
	ctx.fillStyle = "orange";
	ctx.strokeStyle = "black";
	ctx.fill();
	ctx.stroke();
	
	if (up) {
		ctx.save();
		ctx.fillStyle = "white";
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(2.8, 19.4);
		ctx.lineTo(0.9, 16.0);
		ctx.lineTo(4.7, 16.0);
		ctx.lineTo(2.8, 19.4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(16.3, 19.4);
		ctx.lineTo(14.4, 16.0);
		ctx.lineTo(18.3, 16.0);
		ctx.lineTo(16.3, 19.4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}
	
	ctx.beginPath();
	ctx.moveTo(4.9, 9.0);
	ctx.bezierCurveTo(4.9, 9.0, 9.7, 1.7, 14.1, 9.0);
	ctx.stroke();
	ctx.restore();
	ctx.restore();
	
	ctx.restore();
}

function drawAsteroids(ctx) {
	for (var i=0; i < asteroids.length; i++) {
		var asteroid = asteroids[i];
		ctx.save();
		ctx.translate(asteroid[0], asteroid[1]);
		ctx.rotate(asteroid[7]);
		ctx.save();

		ctx.beginPath();
		
		for(var j=1; j<=7; j++){
			th=j * 2 * Math.PI/7;
			pentaX=asteroid[4]*Math.sin(th);
			pentaY=-asteroid[4]*Math.cos(th);
			ctx.lineTo(pentaX,pentaY);
		 }
		
		ctx.closePath();
		
		if (asteroid[5] < 5) {
			ctx.fillStyle = "rgb(240,240,240)";
		} else {
			ctx.fillStyle = "rgb(120,120,120)";
		}
		ctx.fill();
		ctx.stroke();
		ctx.restore();	
		ctx.restore();
	}
}


// pijltjes toetsen
function handleKeyDown(evt) {
    evt = evt || window.event;
    switch (evt.keyCode) {
        case 37:		// pijltje links
            left = true;
            break;
		case 38:		// pijltje omhoog
			up = true;
			break;	
        case 39:		// pijltje rechts
            right = true;
            break;
		case 40:		// pijltje omlaag
			down = true;
			break;
		case 32:		// spatie
			space = true;
			break;	
		case 16:		// shift
			shift = true;
			break;	
		case 17:		// ctrl
			spread();
			break;
		case 13: 		// enter
			if (health <= 0 || asteroids.length == 0) {
				init();
			}
			break;
    }
}

// pijltjes toetsen
function handleKeyUp(evt) {
    evt = evt || window.event;
    switch (evt.keyCode) {
        case 37:		// pijltje links
            left = false;
            break;
		case 38:		// pijltje omhoog
			up = false;
			break;	
        case 39:		// pijltje rechts
            right = false;
            break;
		case 40:		// pijltje omlaag
			down = false;
			break;	
		case 32:		// spatie
			space = false;
			rocketsFired = 0;
			break;
		case 16:		// shift
			shift = false;
			break;
	}
}

function distance(x1, y1, x2, y2) {
	// stelling van pythagoras a^2 = b^2 + c^2
	var a = Math.abs(x1 - x2);
	var b = Math.abs(y1 - y2);
	var c = Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
	return c;
}

function roundRect(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();     
}