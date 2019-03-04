	var WIDTH = 775;
	var HEIGHT = 600;
	var socket = io();


	// Sign In Related

	var menu = document.getElementById('menu');
	var menuUsername = document.getElementById('menu-username');
	var menuPassword = document.getElementById('menu-password');
	var menuSignIn = document.getElementById('menu-signIn');
	var menuSignUp = document.getElementById('menu-signUp');

	menuSignIn.onclick = function() {
		socket.emit('signIn', {username:menuUsername.value, password:menuPassword.value});
	}
	menuSignUp.onclick = function() {
		socket.emit('signUp', {username:menuUsername.value, password:menuPassword.value});
	}
	socket.on('signInResponse', function(data){
		if(data.success){
			menu.style.display = 'none';
			gameDiv.style.display = 'inline-block';
		} else {
			alert("Sign In Unsuccessful.")
		}
	});
	socket.on('signUpResponse', function(data){
		if(data.success){
			alert("Sign Up Successful.");
		} else {
			alert("Sign Up Unsuccessful.")
		}
	});

	// Chat Related

	var chatText = document.getElementById('chat-text');
	var chatInput = document.getElementById('chat-input');
	var chatForm = document.getElementById('chat-form');

	socket.on('addToChat', function(data){
		chatText.innerHTML += '<div>' + data + '</div>';
	}); 
	socket.on('evalAnswer', function(data){
		console.log(data);
	});

	chatForm.onsubmit = function(e) {
		e.preventDefault();
		if(chatInput.value[0] === '/'){
			socket.emit('evalServer',chatInput.value.slice(1));
		} else {
			socket.emit('sendMsgToServer',chatInput.value);

		}
		chatInput.value = '';
	}

	// Game Related

	var Img = {};
	Img.player = new Image();
	Img.player.src = '/client/img/adventurer_stand.png';
	Img.bullet = new Image();
	Img.bullet.src = '/client/img/bullet_red.png';
	Img.map = new Image();
	Img.map.src = '/client/img/map.v1.png';

	var ctx = document.getElementById("ctx").getContext("2d");
	ctx.font = '30px Arial';

		// init

		var Player = function(initPackage) {
			var self = {};
			self.id = initPackage.id;
			self.number = initPackage.number;
			self.x = initPackage.x;
			self.y = initPackage.y;
			self.hp = initPackage.hp;
			self.hpMax = initPackage.hpMax;
			self.score = initPackage.score;

			self.draw = function() {
				var x = self.x - Player.list[selfId].x + WIDTH/2;
				var y = self.y - Player.list[selfId].y + HEIGHT/2;

				var hpWidth = 30 * self.hp / self.hpMax;
				ctx.fillStyle = 'red';
				ctx.fillRect(x - hpWidth/2, y - 40, hpWidth, 4);
				
				var width = Img.player.width/2;
				var height = Img.player.height/2;

				ctx.drawImage(Img.player,
				0,0,Img.player.width,Img.player.height,
				x-width/2,y-height/2,width,height);

				// ctx.fillText(self.score, self.x, self.y-60);
			}

			Player.list[self.id] = self;
			return self;
		}
		Player.list = {};

		var Bullet = function(initPackage) {
			var self = {};
			self.id = initPackage.id;
			self.number = initPackage.number;
			self.x = initPackage.x;
			self.y = initPackage.y;

			self.draw = function() {
				var width = Img.bullet.width/2;
				var height = Img.bullet.height/2;

				var x = self.x - Player.list[selfId].x + WIDTH/2;
				var y = self.y - Player.list[selfId].y + HEIGHT/2;

				ctx.drawImage(Img.bullet,
				0,0,Img.bullet.width,Img.bullet.height,
				x-width/2,y-height/2,width,height);
			}

			Bullet.list[self.id] = self;
			return self;
		}
		Bullet.list = {};

		var selfId = null;

		socket.on('init',function(data){
			if(data.selfId){
				selfId = data.selfId;
			}
			for(var i = 0; i < data.player.length;i++){
				new Player(data.player[i]);
			}
			for(var i = 0; i < data.bullet.length;i++){
				new Bullet(data.bullet[i]);
			}
		});

		// update

		socket.on('update', function(data){
			for(var i = 0; i < data.player.length; i++){
				var package = data.player[i];
				var p = Player.list[package.id];
				if(p){
					if(package.x !== undefined){
						p.x = package.x;
					}
					if(package.y !== undefined){
						p.y = package.y;
					}
					if(package.hp !== undefined){
						p.hp = package.hp;
					}
					if(package.score !== undefined){
						p.score = package.score;
					}
				}
			}
			for(var i = 0; i < data.bullet.length; i++){
				var package = data.bullet[i];
				var b = Bullet.list[data.bullet[i].id];
				if(b){
					if(package.x !== undefined){
						b.x = package.x;
					}
					if(package.y !== undefined){
						b.y = package.y;
					}
				}
			}
		});

		// remove

		socket.on('remove', function(data){
			for(var i = 0;i < data.player.length; i++){
				delete Player.list[data.player[i]];
			}
			for(var i = 0;i < data.bullet.length; i++){
				delete Bullet.list[data.bullet[i]];
			}
		});
	
	setInterval(function(){
		if(!selfId){
			return;
		}
		ctx.clearRect(0,0,WIDTH,WIDTH);
		drawMap();
		drawScore();
		for (var i in Player.list) {
			Player.list[i].draw();
		}
		for (var i in Bullet.list) {
			Bullet.list[i].draw();
		}
	},40);

	var drawMap = function() {
		var x = WIDTH/2 - Player.list[selfId].x;
		var y = HEIGHT/2 - Player.list[selfId].y;
		ctx.drawImage(Img.map,x,y);
	}

	var drawScore = function() {
		ctx.fillStyle = 'black';
		ctx.fillText(Player.list[selfId].score,0,30);
	}

	// keyStroke Events

	document.onkeydown = function(event) {
		if(event.keyCode === 68){  // 'D' key
			socket.emit('keyStroke', {inputId:'right',state:true});
		} else if (event.keyCode === 83){ // 'S' key
			socket.emit('keyStroke', {inputId:'down',state:true});
		} else if (event.keyCode === 65){ // 'A' key
			socket.emit('keyStroke', {inputId:'left',state:true});
		} else if (event.keyCode === 87){ // 'W' key
			socket.emit('keyStroke', {inputId:'up',state:true});
		}
	}

	document.onkeyup = function(event) {
		if(event.keyCode === 68){  // 'D' key
			socket.emit('keyStroke', {inputId:'right',state:false});
		} else if (event.keyCode === 83){ // 'S' key
			socket.emit('keyStroke', {inputId:'down',state:false});
		} else if (event.keyCode === 65){ // 'A' key
			socket.emit('keyStroke', {inputId:'left',state:false});
		} else if (event.keyCode === 87){ // 'W' key
			socket.emit('keyStroke', {inputId:'up',state:false});
		}
	}

	document.onmousedown = function(event){
		socket.emit('keyStroke', {inputId: 'attack',state:true});
	}

	document.onmouseup = function(event){
		socket.emit('keyStroke', {inputId: 'attack',state:false});
	}

	document.onmousemove = function(event){
		var x = -WIDTH/2 + event.clientX - 8;
		var y = -HEIGHT/2 + event.clientY - 8;
		var angle = Math.atan2(y,x) / Math.PI * 180;
		socket.emit('keyStroke',{inputId: 'mouseAngle',state:angle});
	}