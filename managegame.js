// "Struct" Definitions
		var Player = {
	        x: 0,
	        y: 0,
	        facing: 0,
	        health: 60000, // 60 second day
	        position: 0,
	        img: {},
	        failed: false,
	        workload: 10,
	        mugs: 0
	    };

	    var CoffeePot = {
	        x: 0,
	        y: 0,
	        facing: 0,
	        health: 12, // 12 cup coffee maker (3 power-ups)
	        img: {}
	    };

	    var Employee = {
	        x: 0,
	        y: 0,
	        facing: 0,
	        health: 5000, // 5 seconds til timer runs out
	        img: {}
	    };

	    var WorkBullet = {
	    	position: 0,
	    	supermove: false,
	    	amount: 1000
	    };

	    var CoffeeBullet = {
	    	amount: 700
	    };

	    function clone(obj) {
		    if (null == obj || "object" != typeof obj) return obj;
		    var copy = obj.constructor();
		    for (var attr in obj) {
		        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		    }
		    return copy;
		}

	    // Main code starting point
		var MicroManager = function () {
		    var that = this;
		    that.Surface = {};
		    that.backBuffer = {};
		    that.dims = { width: 0, height: 0 };
		    
		    that.playerSprite = clone(Player);		    
		    that.coffeeSprite = clone(CoffeePot);
		    that.doorSprite = new Image();
		    that.doorSprite.src = 'door.png';
		    
		    that.employees = [];
		    that.work = [];
		    that.coffee = [];
		    
		    that.score = 0;
		    that.gamerunning = false;

		    that.keyboard = { up: false, down: false, right: false, left: false, f: false, rframe: false, lift: true };

		    that.bgImage = { x: 0, y: 0, velocity: 0, img: null };		    
		    that.bgImage.img = new Image();
		    that.bgImage.img.src = 'Content/office.png';

		    that.playerSprite.imgL = new Image();
		    that.playerSprite.imgL.src = 'Content/Manager.Left.png';
		    that.playerSprite.imgR = new Image();
		    that.playerSprite.imgR.src = 'Content/Manager.Right.png';

		    that.coffeeSprite.img = new Image();
		    that.coffeeSprite.img.src = 'Content/coffee_maker.png';

		    that.title = new Image();

		    return that;
		};

		MicroManager.prototype.initScreen = function (obj) {
	        var canvas = obj;
	        if (canvas.getContext) {
	            this.Surface = canvas.getContext('2d');
	            this.Surface.fillStyle = 'rgb(0,0,0)';
	        }

	        // Create back buffer for rendering
	        var back = document.createElement('canvas');
	        back.width = canvas.width;
	        back.height = canvas.height;
	        this.backBuffer = back.getContext('2d');
	        this.backBuffer.fillStyle = 'rgb(0,0,0)';

	        this.dims.width = back.width;
	        this.dims.height = back.height;

	        // Setup keybinding
	        var that = this;
	        document.addEventListener('keydown', function (e) { that.captureKeys(e, that); }, false);
	        document.addEventListener('keyup', function (e) { that.uncaptureKeys(e, that); }, false);

	        // Show the title screen.
		    this.title.src = 'Content/Title.png';
		    this.title.onload = function () { that.TitleScreen(); };	        
	        
	        this.initGame();

	        canvas.addEventListener('click', function (e) { that.gamerunning = true; that.fire(); });

	        return this;
	    };

	    MicroManager.prototype.initGame = function () {
	        // Create 4 employees
			for (var t = 0; t < 4; t++) {
				var b = clone(Employee);
				b.y = 150;
				b.x = 30 + (t * 75);
				b.img = new Image();
				b.img.src = 'Content/Employee.png';
				b.desk = new Image();
				b.desk.src = 'Content/desk.png';
				// Random health timer, between 3-5 seconds
				var wwww = (Math.floor((Math.random() * 9) + 3) % 3) + 3;
				b.health = wwww * 1000;
				this.employees.push(b);
			}
			this.coffeeSprite.y = 115;
			this.coffeeSprite.x = 400;
	        return this;
	    };

		MicroManager.prototype.updateFrame = function () {
		    if (this.keyboard.left && this.keyboard.lift){
		        //this.playerSprite.x -= 5;
		        if(--this.playerSprite.position < 0)
		        	this.playerSprite.position = 0;
		        this.playerSprite.lastKey = 'left';
		        this.keyboard.lift = false;
		    }

		    if (this.keyboard.right && this.keyboard.lift){
		        //this.playerSprite.x += 5;
		        if(++this.playerSprite.position > 5)
		        	this.playerSprite.position = 5;
		        this.playerSprite.lastKey = 'right';
		        this.keyboard.lift = false;
		    }

		    if(this.playerSprite.position < 4)
		    	this.playerSprite.x = (this.playerSprite.position * 75) + 15;
		    else{
		    	switch(this.playerSprite.position)
			    {
			    	case 4: 
						this.playerSprite.x = 320;
			    	break;
			    	case 5: 
			    		this.playerSprite.x = 370;
			    	break;
			    }
			}
		    this.playerSprite.y = 120;

		    // Hand out work / Refill / Drink Coffee
		    if (this.keyboard.f) {
		        // Where are we? Are we at a desk? Do we have enough work?
		        if(this.playerSprite.position < 4){
			        if(this.playerSprite.workload > 0){
				        this.keyboard.f = false;
				        var b = clone(WorkBullet);
				        b.position = this.playerSprite.position;
				        if(this.playerSprite.mugs < 4)
				        	b.amount = Math.floor((Math.random() * 5) + 1) * 700;
				        else{
				        	b.amount = 5000;
				        	b.supermove = true;
				        	this.playerSprite.mugs = 0;
				        }
				        this.work.push(b);
				        this.playerSprite.workload--;
			    	}
		    	}
		    	// Drink Some Coffee (Consumes 700 milliseconds from all timers)
		    	if(this.playerSprite.position == 5){
			        if(this.playerSprite.mugs < 4){
				        this.keyboard.f = false;
				        var b = clone(CoffeeBullet);
				        this.coffee.push(b);
				        this.playerSprite.mugs++;
			    	}
		    	}
				// Get work (consumes no time, gives random (2+) work to manager)
		    	if(this.playerSprite.position == 4){
			        this.keyboard.f = false;
			        this.playerSprite.workload += Math.floor((Math.random() * 10) + 2);
			        if(this.playerSprite.workload > 10) // can't carry more than 10.
			        	this.playerSprite.workload = 10;
		    	}
		    }
		};

		MicroManager.prototype.renderFrame = function () {
	        this.backBuffer.clearRect(0, 0, this.dims.width, this.dims.height);

	        // Draw Office Background
	        this.backBuffer.drawImage(this.bgImage.img, this.bgImage.x, this.bgImage.y);
			// Manager Office Door
			this.backBuffer.drawImage(this.doorSprite, 320, 86);

	        // Draw Player Sprite (player has a lower sprite priority, to look "behind" the employee desks)
	        if (this.playerSprite.health > 0 && !this.playerSprite.failed)
	            if(this.playerSprite.facing == 0)
	            	this.backBuffer.drawImage(this.playerSprite.imgL, this.playerSprite.x, this.playerSprite.y);
	           	else
	        		this.backBuffer.drawImage(this.playerSprite.imgR, this.playerSprite.x, this.playerSprite.y);
	        else {
	            // End the game, player lost
	            this.backBuffer.drawImage(this.playerSprite.imgR, this.playerSprite.x, this.playerSprite.y);
	            this.gamerunning = false;
	        }

	        if (this.gamerunning) {
	            // Employees
	             var allgone = true;
	             for (var i = this.employees.length - 1; i >= 0; i--) {
					if (this.employees[i].health > 0) {
						this.backBuffer.drawImage(this.employees[i].img, this.employees[i].x, this.employees[i].y);
						this.employees[i].health -= 30;
						allgone &= false;
					}else{
						this.employees[i].health = 0;
						//this.playerSprite.failed
						allgone &= true;
					}
					this.backBuffer.drawImage(this.employees[i].desk, this.employees[i].x - 17, this.employees[i].y + 4);
					this.backBuffer.fillStyle = "#fff";
			        this.backBuffer.font = "8px Georgia";
			        this.backBuffer.fillText(this.employees[i].health, this.employees[i].x - 17, this.employees[i].y + 48);
	             }
	             this.playerSprite.failed = allgone;

	             // Coffee Maker
				this.backBuffer.drawImage(this.coffeeSprite.img, this.coffeeSprite.x, this.coffeeSprite.y);

	             for(var o = this.work.length - 1; o >= 0; o--) {
	             	if(this.work[o].position < this.employees.length){
	             		if(!this.work[o].supermove){
		             		if(this.employees[this.work[o].position].health > 0){
		             			this.employees[this.work[o].position].health += this.work[o].amount;
		             			if(this.employees[this.work[o].position].health > 5000)
		             				this.employees[this.work[o].position].health = 5000;
		             		}
	             		}else{
	             			// Hadoken!
	             			for (var i = this.employees.length - 1; i >= 0; i--) {
	             				if(this.employees[i].health > 0){
	             					this.employees[i].health += this.work[o].amount; // We allow overage for supermove moves!
	             				}
	             			}
	             		}
	             	}
	             	this.work.splice(o, 1);
	             }
	            this.playerSprite.health -= 30;
	        } else {
	            
	        	if(this.employees.some(function(o){ return o.health > 0;})){
					this.backBuffer.fillStyle = "#000";
		            this.backBuffer.font = "26px Georgia";
		            this.backBuffer.fillText("CONGRATS!", 125, 120);
		            this.backBuffer.fillStyle = "#FFF";
		            this.backBuffer.font = "16px Georgia";
		            this.backBuffer.fillText("You're a prick!", 145, 145);
	        	}else {
		            // Display game over screen
		          	this.backBuffer.fillStyle = "#000";
			        this.backBuffer.font = "26px Georgia";
			        this.backBuffer.fillText("GAME OVER", 125, 120);
			        this.backBuffer.fillStyle = "#FFF";
			        this.backBuffer.font = "16px Georgia";
			        this.backBuffer.fillText("You can't micromanage, that's a good thing.", 60, 145);
	        	}
	        }

	        

	        this.backBuffer.fillStyle = "#000";
	        this.backBuffer.font = "12px Georgia";
	        this.backBuffer.fillText("EOD: " + this.playerSprite.health, 10, 25);
	        this.backBuffer.fillText("MUG: " + this.playerSprite.mugs, 10, 10);
	        this.backBuffer.fillText("WORK: " + this.playerSprite.workload, 10, 40);

	        // Flip to front-buffer
	        this.Surface.clearRect(0, 0, this.dims.width, this.dims.height);
	        this.Surface.drawImage(this.backBuffer.canvas, 0, 0);
	    };

	    MicroManager.prototype.captureKeys = function (e, that) {
	        if (typeof e == "undefined")
	            e = window.event;

	        var isLegalKey = function (r) {
	            switch (r) {
	                case 32: return 'F'; // Space
	                case 38: return 'U'; // Left
	                case 37: return 'L'; // Up
	                case 40: return 'D'; // Right
	                case 39: return 'R'; // Down
	            }
	            return '';
	        };

	        var keycode = (!!e.which) ? e.which : e.keyCode;
	        var what = isLegalKey(keycode);
	        if (what != '') {
	            if (this.gamerunning) {
	                switch (what) {
	                    case 'F': that.keyboard.f = true;
	                        break;
	                    case 'U': that.keyboard.up = true;
	                        break;
	                    case 'D': that.keyboard.down = true;
	                        break;
	                    case 'L': that.keyboard.left = true;
	                        that.playerSprite.facing = 0;
	                        break;
	                    case 'R': that.keyboard.right = true;
	                        that.playerSprite.facing = 1;
	                        break;
	                }
	            }
	            e.returnValue = false;   // IE
	            if (!!e.preventDefault) {  // Firefox, Chrome, Safari
	                e.preventDefault();
	            }
	        }
	    };

	    MicroManager.prototype.uncaptureKeys = function (e, that) {
	        if (typeof e == "undefined")
	            e = window.event;

	        var isLegalKey = function (r) {
	            switch (r) {
	                case 32: return 'F'; // Space
	                case 38: return 'U'; // Left
	                case 37: return 'L'; // Up
	                case 40: return 'D'; // Right
	                case 39: return 'R'; // Down
	            }
	            return '';
	        };

	        var keycode = (!!e.which) ? e.which : e.keyCode;
	        var what = isLegalKey(keycode);
	        if (what != '') {
	            switch (what) {
	                case 'F': that.keyboard.f = false;
	                    break;
	                case 'U': that.keyboard.up = false;
	                    break;
	                case 'D': that.keyboard.down = false;
	                    break;
	                case 'L': that.keyboard.left = false; that.keyboard.lift = true;
	                    break;
	                case 'R': that.keyboard.right = false; that.keyboard.lift = true;
	                    break;
	            }
	            e.returnValue = false;   // IE
	            if (!!e.preventDefault) {  // Firefox, Chrome, Safari
	                e.preventDefault();
	            }
	        }
	    };

	    MicroManager.prototype.TitleScreen = function () {
	        this.Surface.drawImage(this.title, 0, 0);
	    };

	    MicroManager.prototype.fire = function () {
	        var that = this;
	        setTimeout(function () { that.updateFrame(); that.renderFrame(); that.fire(); }, 33);
	    };