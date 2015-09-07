

	var Game = function(){


		var canvas;
		var interval; 

		var _x;
		var _y;
		var speedX;
		var speedY;
		var speedR;
		var originalSpeedR;

		var paddleLeft;
		var paddleRight;
		var brick;
		
		var inGame;
		var justScored;
		var eventsDone;

		var startScreen;
		var pressStart;
		var interval;

		var scoreLeft;
		var scoreRight;
		var line;

		var scores;
		var paddleLength;
		var pitchLow;
		var pitchHigh;
		var scoreSounds;
		var scoreMessages;
		var maxScore;

		var countGraphics;
		var countAudio;


		this.init = function(){

			var self = this;
			self.canvas = new createjs.Stage( document.getElementById( "game" ) );
			self.eventsDone = false;

			self.setConstants();
			self.showStartScreen();

			// Listen to somebody hittin the space-bar:
			window.addEventListener( 'keyup', function( e ){

				if( e.keyCode == '32' && self.inGame === false ){

					self.inGame = true;

					window.clearInterval( self.interval );
					self.canvas.removeChild( self.startScreen );
					self.pressStart.visible = false;

					//start the game:
					self.setupGame();

				}

			});

		}

		/**********************************************/
		/********    Start Screen  ********************/
		/**********************************************/

		this.showStartScreen = function(){
			
			var self = this;
			self.startScreen = new createjs.Bitmap("images/start.png");
			self.startScreen.x = ( self._x / 2 ) - 365;
			self.startScreen.y = 10;
			self.startScreen.scaleX = self.startScreen.scaleY = .8;
			self.canvas.addChild( self.startScreen );

			self.pressStart = new createjs.Bitmap("images/press.png");
			self.pressStart.x = ( self._x / 2 ) - 100;
			self.pressStart.y = self._y - 100;
			self.canvas.addChild( self.pressStart );

			self.canvas.update();

			//make the PressStart text blink:
			
			self.interval = setInterval( function(){

				if( self.pressStart.visible ){
					self.pressStart.visible = false;
				}else{
					self.pressStart.visible = true;
				}

				self.canvas.update();

			}, 500 );


		}






		/**********************************************/
		/********    Game     *************************/
		/**********************************************/


		/**
		 * Display the count-down
		 * 
		 * @return void
		 */
		this.setupGame = function(){

			var self = this;

			self.countGraphics = new Array(
				'images/one.png',
				'images/two.png',
				'images/three.png',
				'images/pong.png'
			);

			self.countAudio = new Array(
				new Audio('./audio/one.m4a'),
				new Audio('./audio/two.m4a'),
				new Audio('./audio/three.m4a'),
				new Audio('./audio/pong.m4a')
			);

			var curr = 0;
			var max = 3;

			self.update();
			self.setCount( curr, max );

		}



		/**
		 * Set a count
		 * 
		 * @param int curr
		 * @param inr max
		 */
		this.setCount = function( curr, max ){

			var self = this;

			if( curr <= max ){

				var graphic = new createjs.Bitmap( self.countGraphics[ curr ] );
				graphic.x = ( self._x / 2 ) - ( graphic.image.width / 2 );
				graphic.y = ( self._y / 2 ) - ( graphic.image.height / 2 );

				self.canvas.addChild( graphic );
				self.update();

				self.countAudio[ curr ].play();

				setTimeout( function(){

					self.canvas.removeChild( graphic );
					self.setCount( ( curr + 1 ), max );

				}, 1000 );
					
			
			}else{

				self.startGame();

			}
	
	
		}


		/**
		 * Start the game
		 * 
		 * @return void
		 */
		this.startGame = function(){

			var self = this;

			self.rollSpeed();
			self.setScoreBoard();
			self.setPaddles();
			self.setBrick();

			self.resetBrick();

			if( self.eventsDone === false ){
				self.eventsDone = true;
				self.setEvents();

			}

			//update the canvas with the set paddles.
			self.update();

		}

		/**
		 * Reset all displayObjects and run self.startGame()
		 * 
		 * @return void
		 */
		this.resetGame = function(){

			var self = this;

			//remove everything
			self.canvas.removeChild( self.brick );
			self.canvas.removeChild( self.paddleLeft );
			self.canvas.removeChild( self.paddleRight );
			self.canvas.removeChild( self.scoreLeft );
			self.canvas.removeChild( self.scoreRight );
			self.canvas.removeChild( self.line );
			self.scores['left'] = 0;
			self.scores['right'] = 0;

			self.inGame = false;
			self.showStartScreen();
		}


		/**
		 * Set initial Vars
		 *
		 * @returns void
		 */
		this.setConstants = function(){
			
			var self = this;
			self.inGame = false;
			self.justScored = false;

			//set constants:
			self.paddleLength = 150;
			self.pitchLow = 200;
			self.pitchHigh = 400-self.pitchLow;
			self._x = 1700;
			self._y = 940;
			self.speedX = 15;
			self.speedY = 15;
			
			self.originalSpeedR = 40;
			self.speedR = self.originalSpeedR;

			self.maxScore = 10;

			self.scoreSounds = new Array(
					new Audio('./audio/baguette.m4a'),
					new Audio('./audio/jaquescousteau.m4a'),
					new Audio('./audio/soupdujour.m4a'),
					new Audio('./audio/tresbon.m4a'),
					new Audio('./audio/tourdufrance.m4a'),
					new Audio('./audio/camembert.m4a'),
					new Audio('./audio/paraplu.m4a'),
					new Audio('./audio/trottoir.m4a'),
					new Audio('./audio/croissant.m4a'),
					new Audio('./audio/champselysees.m4a'),
					new Audio('./audio/hohohoh.m4a'),
					new Audio('./audio/oeh-lala.m4a')
			);

			self.scoreMessages = new Array(
					'images/baguette.png',
					'images/jaquescousteau.png',
					'images/soupdujour.png',
					'images/tresbon.png',
					'images/tourdufrance.png',
					'images/camembert.png',
					'images/paraplu.png',
					'images/trottoir.png',
					'images/croissant.png',
					'images/champselysees.png',
					'images/hohohoh.png',
					'images/oehlala.png'
			);

		}


		this.setEvents = function(){

			var self = this;

			//set the tick event:
			createjs.Ticker.addEventListener( "tick", function(){

				if( !self.justScored ){

					self.brick.visible = true;

					if( self.speedR > 5 )
						self.speedR -= 1;

					//if we've reached the top of the document:
					if( self.brick.y <= 0 ){
						self.speedY *= -1;
						self.speedR = self.originalSpeedR;
	
					//bottom of the document:
					}else if( self.brick.y >= self._y ){
						self.speedY *= -1;
						self.speedR = self.originalSpeedR;
	
					}
	
	
					//left paddle intersection check:
					if( self.checkIntersection( self.paddleLeft, self.brick ) ){
						self.speedX *= -1;
						self.speedR = self.originalSpeedR;
					}
	
					//right paddle check:
					if( self.checkIntersection( self.paddleRight, self.brick ) ){
						self.speedX *= -1;
						self.speedR = self.originalSpeedR;
					}
				
	
	
					self.brick.x += self.speedX;
					self.brick.y += self.speedY;
			
					if( ( self.brick.rotation + self.speedR ) >= 360 ){
						self.brick.rotation = 0;
					}else{
						self.brick.rotation += self.speedR;
					}
	
					//up the score if the bricks' x is low or high enough:
					if( self.brick.x <= 0 ){
						self.upScore( 'right' );
					}else if( self.brick.x >= self._x ){
						self.upScore( 'left' );
					}
					
					self.update();

				}else{

					self.brick.visible = false;

				}

			});

			//listen for tweens:
			createjs.Ticker.addEventListener("tick", self.canvas );	

		}


		/**********************************************/
		/********    SCORE  *************************/
		/**********************************************/

		this.setScoreBoard = function(){

			var self = this;

			self.scores = [];
			self.scores['left'] = 0;
			self.scores['right'] = 0;

			self.scoreLeft = new createjs.Text( self.scores['left'], "100px Poetsen One", "#D44645" );
			self.scoreRight = new createjs.Text( self.scores['right'], "100px Poetsen One", "#D44645" );
			self.scoreLeft.y = self.scoreRight.y = 80;

			self.scoreRight.x = self._x - 150;
			self.scoreLeft.x = 150;

			self.canvas.addChild( self.scoreLeft );
			self.canvas.addChild( self.scoreRight );

			//line through the middle:
			self.line = new createjs.Shape();
			var g = self.line.graphics;

			g.beginFill('#ffffff');
			g.drawRect( 0, 0, 4, self._y - 100 );
			g.endFill();

			self.line.x = ( self._x / 2 ) - 2;
			self.line.y = 50;
			self.canvas.addChild( self.line );


		}

		/**
		 * Add a score to a player
		 * 
		 * @param  String type (left or right)
		 * @return void
		 */
		this.upScore = function( type ){

			var self = this;
			self.justScored = true;

			//up the score:
			if( type === 'left' ){
				self.scores['left'] += 1;
				self.scoreLeft.text = self.scores['left'];
			}else{
				self.scores['right'] += 1;
				self.scoreRight.text = self.scores['right'];
			}

			
			self.playScoreEffects();
		}

		/**
		 * Add the score effect:
		 * 
		 * @return void
		 */
		this.playScoreEffects = function(){
			var self = this;

			// generate random number for selecting a sound and graphic
			var random = Math.floor(Math.random()*(self.scoreSounds.length));

			// play score sound
			self.scoreSounds[random].play();

			// show graphic score sound
			var graphic = new createjs.Bitmap( self.scoreMessages[random] );
			graphic.scaleX = graphic.scaleY = 0;
			graphic.x = ( self._x / 2 );
			graphic.regX = ( graphic.image.width / 2 );
			graphic.y = ( self._y / 2 );
			graphic.regY = ( graphic.image.height / 2 );

			//random rotation
			var _rotation = Math.floor( Math.random() * 80 ) - 40;
			graphic.rotation = _rotation * -1;


			var tween = createjs.Tween.get( graphic ).to( { scaleX: 1, scaleY: 1, rotation: _rotation }, 200 ).wait( 800 ).call( function(){
				createjs.Tween.get( graphic ).to({ alpha: 0, y: ( graphic.y + 250 ) }, 150 ).call( function(){
					self.canvas.removeChild( graphic );

					if( !self.checkEndGame() )
						self.resetBrick();

				 });
			});
			

			self.canvas.addChild( graphic );

		}


		/**
		 * End this game
		 * 
		 * @return void
		 */
		this.checkEndGame = function(){

			var self = this;

			if( self.scores['left'] >= self.maxScore || self.scores['right'] >= self.maxScore ){

				self.endGame();
				return true;

			}

			return false;

		}


		this.endGame = function(){

			var self = this;

			var win = new createjs.Bitmap( "images/champs.png" );
			var lose = new createjs.Bitmap( "images/lose.png" );

			if( self.scores['left'] > self.scores['right'] ){
				lose.x = ( self._x / 2 );	
			}else{
				win.x = ( self._x / 2 );
			}

			self.canvas.addChild( win );
			self.canvas.addChild( lose );

			setTimeout( function(){

				self.canvas.removeChild( win );
				self.canvas.removeChild( lose );

				self.resetGame();

			}, 10000 );


		}

		/**********************************************/
		/********    BRICK  ***************************/
		/**********************************************/


		/**
		 * Set the brick object
		 *
		 * @returns void
		 */
		this.setBrick = function(){

			var self = this;

			self.brick = self.drawBrick();

			self.brick.x = ( self._x / 2 );
			self.brick.y = ( self._y / 2 );
			self.brick.regX = 15;
			self.brick.regY = 15;

			self.canvas.addChild( self.brick );

		}


		/**
		 * Reset the brick after scoring
		 * 
		 * @return void
		 */
		this.resetBrick = function(){

			var self = this;
			self.justScored = false;

			self.rollSpeed();
			self.speedR = self.originalSpeedR;

			self.brick.x = ( self._x / 2 ) - 10;
			self.brick.y = ( self._y / 2 ) - 10;
		}


		/**
		 * roll some dice to see which direction the brick will take:
		 * 
		 * @return void
		 */
		this.rollSpeed = function(){

			var self = this;

			//set random starting speedX
			if( Math.random() > .5 )
				self.speedX *= -1;

			//set random starting speedY
			if( Math.random() > .5 )
				self.speedY *= -1;
		}



		/**
		 * Check for collisions between two rectangles
		 * @param Shape rect1
		 * @param Shape rect2
		 * @return bool
		 */
		this.checkIntersection = function( rect1,rect2 ) {

			var r1 = rect1.getBounds();
			var r2 = rect2.getBounds();

			return !( rect2.x >= ( rect1.x + r1.width ) || 
			       	    ( rect2.x + r2.width ) < rect1.x ||
			            rect2.y >= ( rect1.y + r1.height ) ||
			            ( rect2.y + r2.height ) < rect1.y );
		}


		/**
		 * Draw the brick shape
		 * 
		 * @return Shape
		 */
		this.drawBrick = function(){

			//var sprite = new createjs.Shape();
			var sprite = new createjs.Bitmap('images/tomato.png');
			sprite.setBounds( -15, -15, 30, 30 );

			return sprite;
		}



		/**********************************************/
		/********    PADDLES  *************************/
		/**********************************************/



		/**
		 * Sets the paddles and there events
		 *
		 * @returns void
		 */
		this.setPaddles = function(){

			var self = this;

			self.paddleLeft = self.drawPaddle( 'left' );
			self.paddleLeft.x = 10;

			self.paddleRight = self.drawPaddle( 'right' );
			self.paddleRight.x = self._x - 25;

			self.paddleLeft.y = self.paddleRight.y = 250;

			self.canvas.addChild( self.paddleLeft );
			self.canvas.addChild( self.paddleRight );


			self.setPaddleEvents();

		}


		/**
		 * Set up + down events for these paddles:
		 *
		 * @returns void
		 */
		this.setPaddleEvents = function(){

			var self = this;

			window.addEventListener( 'keydown', function( e ){

				switch( e.keyCode ){

					case 38:
						//rightPaddle up:
						self.updatePaddle( self.paddleRight, 'up' );

						break;

					case 40:
						//rightPaddle down:
						self.updatePaddle( self.paddleRight, 'down' );

						break;

					case 87:
						//leftPaddle up:
						self.updatePaddle( self.paddleLeft, 'up' );

						break;

					case 83:
						//leftPaddle down:
						self.updatePaddle( self.paddleLeft, 'down' );
						
						break;
				}
			});
		}

		/**
		 * Set a paddle up or down:
		 * @param  Shape _paddle
		 * @param  String direction
		 * @return void
		 */
		this.updatePaddle = function( _paddle, direction ){

			var self = this;
			var stepSize = 45;

			if( direction === 'up' ){
				if (_paddle.y <= 0) {
					_paddle.y = 0;
				} else {
					_paddle.y -= stepSize;
				}

			} else {
				if (_paddle.y >= (self._y - self.paddleLength))
					_paddle.y = (self._y - self.paddleLength);
				else {
					_paddle.y += stepSize;
				}

			}

			self.update();
		}


				/**
		 * Set a paddle up or down:
		 * @param  Shape _paddle
		 * @param  String direction
		 * @return void
		 */
		this.positionPaddle = function( _paddle, position ){

			var self = this;
			
			_paddle.y = position;

			self.update();
		}



		/**
		 * Draw a single paddle
		 * 
		 * @return Shape
		 */
		this.drawPaddle = function(){

			var self = this;
			var sprite = new createjs.Bitmap('images/baguette_paddle.png');
			sprite.setBounds( 0, 0, 28, self.paddleLength );

			return sprite;

		}



		/**********************************************/
		/********    SCORE  ***************************/
		/**********************************************/





		/**
		 * Finally a simple update function
		 * 
		 */
		this.update = function(){

			var self = this;
			self.canvas.update();

		}


		/**
		 * Sets the paddles and there events
		 *
		 * @returns void
		 */
		this.voiceControlPaddle = function(pitch, channel){
			var self = this;

			if( self.inGame ){

				// var to calculate percent of pitch on the pitchlow to pitchHigh scale
				var pitchPercent;
	
				// get the pitch to start from 0
				pitch = pitch - self.pitchLow;
	
				// make sure we can't get a negative pitch or a division by zero
				if (pitch < 0) {
					pitchPercent = 0;
				} else if( pitch >= self.pitchHigh) {
					pitchPercent = 100;
				} else {
					pitchPercent = (pitch / self.pitchHigh) * 100;
				}
	
				// invert pitchPercent
				pitchPercent = 100 - pitchPercent;
	
				// get the position based on the canvas height
				var paddlePosition = ((self._y - self.paddleLength) / 100) * pitchPercent;
	
				if (channel == 'left') {
					self.positionPaddle( self.paddleLeft, paddlePosition );
				}
				else {
					self.positionPaddle( self.paddleRight, paddlePosition );
				}
			}

		}


	}
	



	window.onload = function(){

		window.game = new Game();
		window.game.init();

		window.mic = new Mic();
		window.mic.init();

	}