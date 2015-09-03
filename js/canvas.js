

	var Game = function(){


		var canvas;
		var _x;
		var _y;
		var speedX;
		var speedY;
		var paddleLeft;
		var paddleRight;
		var brick;
		var scoreLeft;
		var scoreRight;
		var scores;


		this.init = function(){

			var self = this;
			self.canvas = new createjs.Stage( document.getElementById( "game" ) );

			//set constants:
			self._x = 1152;
			self._y = 720;
			self.speedX = 15;
			self.speedY = 15;


			self.rollSpeed();

			self.setScoreBoard();

			self.setPaddles();

			self.setBrick();



			//update the canvas with the set paddles.
			self.update();


		}

		/**********************************************/
		/********    SCORE  *************************/
		/**********************************************/

		this.setScoreBoard = function(){

			var self = this;

			self.scores = [];
			self.scores['left'] = 0;
			self.scores['right'] = 0;

			self.scoreLeft = new createjs.Text( self.scores['left'], "55px Impact", "#ffffff" );
			self.scoreRight = new createjs.Text( self.scores['right'], "55px Impact", "#ffffff" );
			self.scoreLeft.y = self.scoreRight.y = 80;

			self.scoreRight.x = self._x - 150;
			self.scoreLeft.x = 150;

			self.canvas.addChild( self.scoreLeft );
			self.canvas.addChild( self.scoreRight );


		}


		this.upScore = function( type ){

			var self = this;

			//up the score:
			if( type === 'left' ){
				self.scores['left'] += 1;
				self.scoreLeft.text = self.scores['left'];
			}else{
				self.scores['right'] += 1;
				self.scoreRight.text = self.scores['right'];
			}



			self.resetBrick();
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

			self.brick.x = ( self._x / 2 ) - 10;
			self.brick.y = ( self._y / 2 ) - 10;

			self.canvas.addChild( self.brick );

			self.updateBrick();
		}


		/**
		 * Reset the brick after scoring
		 * 
		 * @return void
		 */
		this.resetBrick = function(){

			var self = this;

			self.rollSpeed();
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
		 * Update the brick object based on the tick event
		 * 
		 * @return void
		 */
		this.updateBrick = function(){

			var self = this;

			//set the tick event:
			createjs.Ticker.addEventListener( "tick", function(){


				//if we've reached the top of the document:
				if( self.brick.y <= 0 ){
					self.speedY *= -1;

				//bottom of the document:
				}else if( self.brick.y >= self._y ){
					self.speedY *= -1;

				}


				//left paddle intersection check:
				if( self.checkIntersection( self.paddleLeft, self.brick ) )
					self.speedX *= -1;

				//right paddle check:
				if( self.checkIntersection( self.paddleRight, self.brick ) )
					self.speedX *= -1;
			


				self.brick.x += self.speedX;
				self.brick.y += self.speedY;


				//up the score if the bricks' x is low or high enough:
				if( self.brick.x <= 0 ){
					self.upScore( 'right' );
				}else if( self.brick.x >= self._x ){
					self.upScore( 'left' );
				}
				
				self.update();

			});
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

			var sprite = new createjs.Shape();
			sprite.setBounds( 0, 0, 20, 20 );
			
			var g = sprite.graphics;

			g.beginFill('#ffffff');
			g.drawRect( 0, 0, 20, 20 );
			g.endFill();

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

				_paddle.y -= stepSize;

			}else{

				_paddle.y += stepSize;

			}

			self.update();
		}



		/**
		 * Draw a single paddle
		 * 
		 * @return Shape
		 */
		this.drawPaddle = function(){

			var self = this;
			var sprite = new createjs.Shape();
			sprite.setBounds( 0, 0, 15, 270 );

			var g = sprite.graphics;

			g.beginFill('#ffffff');
			g.drawRect( 0, 0, 15, 270 );
			g.endFill();

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

	}
	



	window.onload = function(){

		window.game = new Game();
		window.game.init();

		window.mic = new Mic();
		window.mic.init();

	}