

	var Game = new function(){


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


		this.init = function(){

			var self = this;
			self.canvas = new createjs.Stage( document.getElementById( "theCanvas" ) );

			//set constants:
			self._x = 800;
			self._y = 600;
			self.speedX = 10;
			self.speedY = 10;

			//set random starting speedX
			if( Math.random() > .5 )
				self.speedX *= -1;

			//set random starting speedY
			if( Math.random() > .5 )
				self.speedY *= -1;
		

			self.setPaddles();

			self.setBrick();			

			//update the canvas with the set paddles.
			self.update();


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

				console.log( self.paddleLeft.y );

				//right paddle check:
				if( self.checkIntersection( self.paddleRight, self.brick ) )
					self.speedX *= -1;
			


				self.brick.x += self.speedX;
				self.brick.y += self.speedY;

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
			self.paddleRight.x = 770;

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
			sprite.setBounds( 0, 0, 15, 70 );

			var g = sprite.graphics;

			g.beginFill('#ffffff');
			g.drawRect( 0, 0, 15, 70 );
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

		Game.init();

	}