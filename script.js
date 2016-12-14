var Bombs = (function() {

	var bombs = [];
	var mainCanvas = null;
	var mainContext = null;
	var viewportWidth = 0;
	var viewportHeight = 0;
	var touch = {};
	var tiltLR = 0;
	
	function init() {

		onResize();

		// create a canvas for the fireworks
		mainCanvas = document.createElement('canvas');
		mainContext = mainCanvas.getContext('2d');

		// and another one for, like, an off screen buffer
		// because that's rad n all
		bombCanvas = document.createElement('canvas');
		bombContext = bombCanvas.getContext('2d');

		setMainCanvasDimensions();

		document.body.appendChild(mainCanvas);
		document.addEventListener('mouseup', create, true);
		document.addEventListener('touchstart', captureTouch, true);
		document.addEventListener('touchend', create, true);
		if('DeviceMotionEvent' in window) {
			window.addEventListener('devicemotion',motionhandler,false);
		}
		if('DeviceOrientationEvent' in window) {
			window.addEventListener('deviceorientation', orientationhandler, false);
		}

		update();
	}

	function update() {
		clearContext();
		requestAnimFrame(update);
		explode();
	}

	function onResize() {
		viewportWidth = window.innerWidth;
		viewportHeight = window.innerHeight;
	}

	function setMainCanvasDimensions() {
		mainCanvas.width = viewportWidth;
		mainCanvas.height = viewportHeight;
	}

	function create() {
		var pos = getPosition(event);
		var x = window.innerWidth / 2;
		var y = window.innerHeight / 2;
		createBomb(pos.x, pos.y);
	}

	function motionhandler(eventData) {
		var acceleration = eventData.acceleration;
		var y = window.innerHeight / 2;
		var x = window.innerWidth / 2;
		var zVal = acceleration.z;
		if(zVal > 5) {
			console.log(zVal);
			window.removeEventListener('devicemotion',motionhandler,false);
		}
	}

	function orientationhandler(eventData) {
		tiltLR = eventData.gamma;
	}

	function getRandomColor() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	function createBomb(x, y) {
		console.log("create");
		var minSize = 10;
		var maxSize = 30;
		var count = 15;
		var minSpeed = 60.0;
		var maxSpeed = 200.0;
		var minScaleSpeed = 1.0;
		var maxScaleSpeed = 4.0;

		for (var angle = 0; angle < 360; angle += Math.round(360 / count)) {
			var bomb = new Bomb();
			bomb.x = x;
			bomb.y = y;
			bomb.radius = randomFloat(minSize, maxSize);
			bombs.color = getRandomColor();
			bomb.scaleSpeed = randomFloat(minScaleSpeed, maxScaleSpeed);
			var speed = randomFloat(minSpeed, maxSpeed);
			bomb.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
			bomb.velocityY = speed * Math.sin(angle * Math.PI / 180.0);
			bombs.push(bomb);
		}
	}

	function captureTouch(event) {
		touch = event.touches[0];
	}

	function explode() {
		var l = bombs.length;
		while (l--) {
			var bomb = bombs[l];
			var destroy = bomb.update(20);
			bomb.render(mainContext);
			if (destroy) {
				bombs.splice(l, 1);
			}
		}
	}

	function getPosition(event) {
		var x = 0;
		var y = 0;
		if (event.type === "touchend") {
			x = touch.clientX;
			y = touch.clientY;
		} else {
			x = event.x;
			y = event.y;
		}

		x -= mainCanvas.offsetLeft;
		y -= mainCanvas.offsetTop;

		return {
			x: x,
			y: y
		};
	}

	function clearContext() {
		mainContext.fillStyle = "rgba(255,255,255,0.2)";
		mainContext.fillRect(0, 0, viewportWidth, viewportHeight);
	}

	function randomFloat(min, max) {
		return min + Math.random() * (max - min);
	}

	return {
		init: init,
		clear: clearContext,
		color:getRandomColor
	};

})();

var Bomb = function() {
	this.scale = 1.0;
	this.x = 0;
	this.y = 0;
	this.radius = 20;
	this.color = Bombs.color();
	this.velocityX = 0;
	this.velocityY = 0;
	this.scaleSpeed = 0.5;
};

Bomb.prototype = {
	update: function(ms) {
		this.scale -= this.scaleSpeed * ms / 1000.0;
		this.x += this.velocityX * ms / 1000.0;
		this.y += this.velocityY * ms / 1000.0;
		if (this.scale <= 0) {
			this.scale = 0;
			return true;
		}
	},
	render: function(context) {
		Bombs.clear();
		context.save();
		context.translate(this.x, this.y);
		context.scale(this.scale, this.scale);

		context.beginPath();
		context.arc(0, 0, this.radius, 0, Math.PI * 2, true);
		context.closePath();

		context.fillStyle = this.color;
		context.fill();
		context.restore();
	}
}

window.onload = function() {
	Bombs.init();
};

window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();