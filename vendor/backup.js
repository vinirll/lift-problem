var STOPPED = 1;
var WAITING_DOOR_CLOSE_TO_GO_UP = 2;
var WAITING_DOOR_CLOSE_TO_GO_DOWN = 3;
var MOVING_UP = 5;
var MOVING_DOWN = 6;

var _ = require('lodash');

module.exports = {
	
	createLift: function(config) {
		var lift = (function(){
			var mId = null;
			var mState 				= STOPPED; //default state
			var mMaxPassangers 		= 8; //defalut
			var mSpeedByFloor 		= 2; //default
			var mTimeDoorsOpened 	= 3; //default

			var mCurrentFloor 		= 1; //default floor
			var currentTargetFloor 	= null;
			var numOfPeopleIn 		= 0; //default
			var mTargetFloors = [];
			var mPeopleIn = [];
			var remainToClose		= 20;
			var passangersToLeaveAt = {};
			var lastCallFrom = 1;

			var mLastCallTime = null;
			return {
				updateToThisTime: function(now) {
					// doesn't matter que current person, we are just updating the lift states by last person activity
					if (mLastCallTime === null)
					{
						this.setLastCallTime(now);	
						return; // same state as before
					}
					var diffSec = now - mLastCallTime;

					switch(mState) {

						case STOPPED:
							//keep stopped
						break;

						case WAITING_DOOR_CLOSE_TO_GO_DOWN:
						case WAITING_DOOR_CLOSE_TO_GO_UP:
						case MOVING_UP:
						case MOVING_DOWN:

							var secondsRemainingToMove;

							if ( mState === MOVING_UP || mState === MOVING_DOWN)
							{
								// console.log('AQUI - 1');
								secondsRemainingToMove = diffSec;
							}
							else
							{
								// console.log('AQUI - 2')
								if ( remainToClose - diffSec > 0 )
								{
									// console.log('AQUI - 3')
									remainToClose-=diffSec;
									// console.log("remainToClose ==> ",remainToClose);
									this.setLastCallTime(now);
									return;
								}

								secondsRemainingToMove = diffSec - remainToClose;
							}
								
							//door is closed and the started to move
							var numOfStops = 1;
							var targetFloors = mTargetFloors.slice();
							for(var i=0;i<targetFloors.length;i++)
							{
								var nFloorsToNext = Math.abs(targetFloors[i]-this.getCurrentFloor());
								var secondsToNextFloor = nFloorsToNext*mSpeedByFloor;
									
								if ( secondsRemainingToMove < secondsToNextFloor )
								{	// lift will not be able able to reach next floor
									// console.log("AAAAAA");

									if (this.getCurrentFloor() < targetFloors[i])
										var newCurrentFloor = this.getCurrentFloor() + (secondsRemainingToMove/mSpeedByFloor);
									else
										var newCurrentFloor = this.getCurrentFloor() - (secondsRemainingToMove/mSpeedByFloor);

									this.setCurrentFloor( newCurrentFloor );

									if ( this.getCurrentFloor() < targetFloors[i])
										this.setState(MOVING_UP);
									else
										this.setState(MOVING_DOWN);

									break;
								}
								else if ( secondsRemainingToMove === secondsToNextFloor )
								{	//lift just arrived at the nextFloor
									// console.log("BBBBBB");
									mTargetFloors.splice(mTargetFloors.indexOf(targetFloors[i]),1);
									this.setCurrentFloor(targetFloors[i]);
									if (mTargetFloors.length === 0)
										this.setState(STOPPED);
									else
									{
										if ( this.getCurrentFloor() < targetFloors[i+1] )
											this.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
										else
											this.setState(WAITING_DOOR_CLOSE_TO_GO_DOWN);
									}
									numOfStops++;
									this.removePeopleFromCurrentFloor(now+(numOfStops*20));
									remainToClose = 20
									break;
									//lift just arrived into targetFloor
										//remove some people
									//lift could be waiting
								}
										   // vou chegar no next floor 					 e porta aberta ainda!
								else if ((secondsRemainingToMove > secondsToNextFloor)&&(secondsRemainingToMove<=secondsToNextFloor+20))
								{ //lift will arrive and wait
									// console.log("CCCCCC");
									mTargetFloors.splice(mTargetFloors.indexOf(targetFloors[i]),1); //remove current floor from the list
									this.setCurrentFloor(targetFloors[i]);
									if (mTargetFloors.length === 0)
									{
										this.setState(STOPPED);
										remainToClose = 20;
										numOfStops++;
										this.removePeopleFromCurrentFloor(now+(numOfStops*20));
									}
									else
									{ // eu tenho andares ainda para seguir
										//TODO - TESTAR AQUI
										remainToClose = (secondsToNextFloor+20)-secondsRemainingToMove;

										if (remainToClose === 0)
										{
											if ( typeof targetFloors[i+1] !== 'undefined' && this.getCurrentFloor() < targetFloors[i+1])
												this.setState(MOVING_UP);
											else
												this.setState(MOVING_DOWN);
										}
										else
										{
											if ( typeof targetFloors[i+1] !== 'undefined' && this.getCurrentFloor() < targetFloors[i+1])
												this.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
											else
												this.setState(WAITING_DOOR_CLOSE_TO_GO_DOWN);
											numOfStops++;
											this.removePeopleFromCurrentFloor(now+(numOfStops*20));
										}
									}
									break;
								}
								else if ((secondsRemainingToMove > secondsToNextFloor)&&(secondsRemainingToMove>secondsToNextFloor+20))
								{	// lift will arrive and go
									//remove some people
									// console.log("DDDDDD");
									mTargetFloors.splice(mTargetFloors.indexOf(targetFloors[i]),1); //remove current floor from the list
									this.setCurrentFloor(targetFloors[i]);
									if (mTargetFloors.length === 0)
									{
										//DÚVIDA AQUI!!!
										this.setState(STOPPED);
										numOfStops++;
										this.removePeopleFromCurrentFloor(now+(numOfStops*20));
										break;
									}
									else
									{
										// console.log(targetFloors[i] + " : "+ targetFloors[i+1])
										if ( typeof targetFloors[i+1] !== 'undefined' && this.getCurrentFloor() < targetFloors[i+1] )
											this.setState(MOVING_UP);
										else
											this.setState(MOVING_DOWN);
									}

									secondsRemainingToMove = secondsRemainingToMove - (secondsToNextFloor+20);
								}
							}
						break;

					}

					this.setLastCallTime(now);
				},
				removePeopleFromCurrentFloor: function(atTime) {
					console.log('removingPeople but: ',mCurrentFloor);
					if ( typeof passangersToLeaveAt[mCurrentFloor] === 'undefined' )
					{
						// console.log('bizzaro!');
						return;
					}

					// this return array of people that call lift to be on mCurrentFloor
					var personToLeave;
					for(var i = 0; i < passangersToLeaveAt[mCurrentFloor].length; i++)
					{
						personToLeave = passangersToLeaveAt[mCurrentFloor][i];
						personToLeave.leaveLift(atTime);
						mPeopleIn.splice( mPeopleIn.indexOf(personToLeave) );
					}
					delete passangersToLeaveAt[mCurrentFloor];

				},
				addPersonInto: function(from,person) {
					if (mPeopleIn.length === 8)
						return false;
					mPeopleIn.push(person);

					person.enterLift();

					if ( typeof passangersToLeaveAt[person.getTargetFloor()] === 'undefined' )
						passangersToLeaveAt[person.getTargetFloor()] = [];
					passangersToLeaveAt[person.getTargetFloor()].push(person);
					console.log(passangersToLeaveAt);
					
					var FROM = 1;
					this.updateTargets(FROM);

					if ( mState === STOPPED && from === mCurrentFloor )
					{
						if ( from < person.getTargetFloor() )
							this.setState( WAITING_DOOR_CLOSE_TO_GO_UP );
						else
							this.setState( WAITING_DOOR_CLOSE_TO_GO_DOWN );
					}
					else if ( mState === STOPPED )
					{
						if ( from < person.getTargetFloor() )
							this.setState( MOVING_UP );
						else
							this.setState( MOVING_DOWN );
					}

					return true;
				},
				updateTargets: function(person,FROM) {

					//assuming FROM always equal 1, will be fine.
					//otherwise we need to make some changes here. 
					// para quando o FROM === 1, o desejo sempre é subir
						// todo !!

					if ( mState === MOVING_UP || mState === WAITING_DOOR_CLOSE_TO_GO_UP )
					{
						var fromIdx = mTargetFloors.indexOf( FROM );
						if (fromIdx !== -1)
						{
							if ( mTargetFloors.indexOf( person.getTargetFloor() ) !== -1 )
								return;

							//from já existe no array
							var p1 = mTargetFloors.slice(0,fromIdx+1);
							var p2 = mTargetFloors.slice(fromIdx+1);
							p2.push(person.getTargetFloor());
							p2.sort(function(a,b){return a-b});	
							mTargetFloors = p1.concat(p2);
						}
						else
						{
							//from não existe no array
							mTargetFloors.push(FROM);
							mTargetFloors.push(person.getTargetFloor());
						}
					}

					else if (mState === WAITING_DOOR_CLOSE_TO_GO_UP)
					{
						if ( mCurrentFloor === FROM )
						{
							// elevador já esta aqui, só estou esperando subir
							if ( mTargetFloors.indexOf( person.getTargetFloor() ) !== -1 )
								return; //já tem o meu andar apertado
							// apertar o botão e aguardar ;)
							mTargetFloors.push(person.getTargetFloor());
						}
						else if ( mCurrentFloor > FROM )
						{
							// estou abaixo do elevador
							var fromIdx = mTargetFloors.indexOf( FROM );
							if (fromIdx !== -1)
							{
								//alguem já pediu chamou ele aqui do meu andar
								if ( mTargetFloors.indexOf( person.getTargetFloor() ) !== -1 )
									return; //e alguem apertou justamente o meu andar

								//from já existe no array
								var p1 = mTargetFloors.slice(0,fromIdx+1);
								var p2 = mTargetFloors.slice(fromIdx+1);
								p2.push(person.getTargetFloor());
								p2.sort(function(a,b){return a-b});	
								//me coloca na ordem! me entrega primeiro se for o caso
								mTargetFloors = p1.concat(p2);
							}
							else
							{
								//ninguem apertou ainda nesse andar, fui o primeiro.
								mTargetFloors.push(FROM);
								//apertei minha intenção de viagem
								mTargetFloors.push(person.getTargetFloor());
							}
						}
						else if (mCurrentFloor < FROM)
						{
							// will never accur in this test... but TODO
							console.log('shit happens!');
						}
					}
					else if (mState === WAITING_DOOR_CLOSE_TO_GO_DOWN)
					{
						if ( mCurrentFloor === FROM )
						{
							// elevador já esta aqui, só estou esperando descer
							if ( mTargetFloors.indexOf( person.getTargetFloor() ) !== -1 )
								return; //já tem o meu andar apertado
							// apertar o botão e aguardar ;)
							
							if ( person.getTargetFloor() < mTargetFloors[0] )
							
							var p =  _.partition(mTargetFloors, function(f) { return ( f < mCurrentFloor ); });
							p[0].push(person.getTargetFloor());
							p[0].sort(function(a, b){return b-a});
							mTargetFloors = p[0].concat(p[1]);
						}
						else if ( mCurrentFloor > FROM )
						{

						}

					}
					else if ( mState === MOVING_DOWN )
					{
						if ( mCurrentFloor > FROM )
						{
							//elevador esta vindo lá de cima
							var fromIdx = mTargetFloors.indexOf( FROM );
							if (fromIdx !== -1)
							{	//alguem já pediu elevador antes de mim nesse andar... e agora, vai subir ou descer?
								//ja tenho o from no array
								if ( mTargetFloors.indexOf( person.getTargetFloor() ) !== -1 )
									return; //alguem vai exatamente para o mesmo lugar que eu, ufa...

								//bom, não tinha o meu destino aqui.... se o elevador esta vindo lá de cima e eu vou para baixo
									// então a prioridade é minha ;)
									//porem, se ele esta vindo lá de cima e eu quero subir... dai não tenho prioridade
										// só se não tiver ninguem nesse andar que pediu, que não parece ser o caso.
								var p1 = mTargetFloors.slice(0,fromIdx+1);
								var p2 = mTargetFloors.slice(fromIdx+1);
								p2.push(person.getTargetFloor());
								// para quando o FROM === 1, o desejo sempre é subir TODO
								// priorizar o estado anterior.. não vou parar de descer pra subir. certo?
								p2.sort(function(a,b){return a-b});	
								mTargetFloors = p1.concat(p2);
							}
							else
							{
								//from não existe no array
								//ninguem pediu o elevador desse andar ainda e ele esta vindo lá de cima..
								mTargetFloors.push(FROM);
								mTargetFloors.push(person.getTargetFloor());
							}
						}
						else ( mCurrentFloor === FROM )
						{
							//Opa, o elevador esta passando justamente aqui!!
							if ( mTargetFloors.indexOf( person.getTargetFloor() ) !== -1 )
								return; //e alguem apertou justamente o meu andar

							console.log('AHHHHH PENSAR POR AQUI');

							// apertar o botão e aguardar ;)
							// mTargetFloors.push(person.getTargetFloor());
						}
					}
				},
				// BACKUP: function() {
				// 	if ( mState === MOVING_UP || mState === WAITING_DOOR_CLOSE_TO_GO_UP )
				// 	{
				// 		var smarterArray =  _.partition(mTargetFloors, function(f) { return ( f >= mCurrentFloor ); });
				// 		smarterArray[0].sort();
				// 		smarterArray[1].sort(function(a,b){return b-a});
				// 		mTargetFloors = smarterArray[0].concat(smarterArray[1]);
				// 	}
				// 	else if ( mState === MOVING_DOWN || mState === WAITING_DOOR_CLOSE_TO_GO_DOWN )
				// 	{
				// 		var smarterArray =  _.partition(mTargetFloors, function(f) { return ( f <= mCurrentFloor ); });
				// 		smarterArray[0].sort(function(a,b){return b-a});
				// 		smarterArray[1].sort();
				// 		mTargetFloors = smarterArray[0].concat(smarterArray[1]);						
				// 	}
				// },
				getPeopleIn: function() {
					return mPeopleIn;
				},
				getFloorScore: function(from,targetFloor,buildingSize) {
					// Nearest Car (NC):
					// 		Elevator calls are assigned to the elevator best placed to answer that call according to three criteria
					// 			that are used to compute a figure of suitability (FS) for each elevator.
					// 	   (1) If an elevator is moving towards a call, and the call is in the same direction, FS = (N + 2) - d,
					// 		where N is one less than the number of floors in the building, and d is the distance in floors between the elevator and the passenger call.
						// (2) If the elevator is moving towards the call, but the call is in the opposite direction, FS = (N + 1) - d.
						// (3) If the elevator is moving away from the point of call, FS = 1.
						//The elevator with the highest FS for each call is sent to answer it.
					// 	The search for the "nearest car" is performed continuously until each call is serviced.
					var weigth;
					var distance = Math.abs(targetFloor-from);

					//	 Subindo...         E  indo em direção a ele  E   ele quer subir também
					if ((mState === MOVING_UP)&&(mCurrentFloor < from)&&(from < targetFloor))
					{
						weigth = 2;
					}
					//	 Descendo...         E   indo em direção a ele  E   ele quer descer também
					else if ((mState === MOVING_DOWN)&&(mCurrentFloor > from)&&(from > targetFloor))
					{
						weigth = 2;
					}
					//			subindo            E  em direção a ele     MAS a chamada é contrária
					else if ((mState === MOVING_UP)&&(mCurrentFloor < from)&&(from > targetFloor))
					{
						weigth = 1;
					}
					//	          Descendo...       E   indo em direção a ele  MAS  a chamada é contrária
					else if ((mState === MOVING_DOWN)&&(mCurrentFloor > from)&&(from < targetFloor))
					{
						//moving towards the call and to same direction
						weigth = 1;
					}
					else if ((mState === MOVING_UP)&&(mCurrentFloor>from))
					{
						return 1;
					}
					else if ((mState === MOVING_DOWN)&&(mCurrentFloor<from))
					{
						return 1;
					}
					//TODO - check stopped
					else
					{
						weigth = 0;
					}

					return ( (buildingSize-1) + weigth ) - distance;
				},
				setLastCallTime: function(lastCallTime) {
					mLastCallTime = lastCallTime;
				},
				getCurrentFloor: function() {
					return mCurrentFloor;
				},
				getNumOfPeopleIn: function() {
					return mPeopleIn.length;
				},
				getCurrentTargetFloor: function() {
					return currentTargetFloor;
				},
				setState: function(state) {
					mState = state;
				},
				debugState: function() {
					switch(mState)
					{
						case STOPPED:
							return 'STOPPED';
						break;

						case WAITING_DOOR_CLOSE_TO_GO_UP:
							return 'WAITING_DOOR_CLOSE_TO_GO_UP';
						break;

						case WAITING_DOOR_CLOSE_TO_GO_DOWN:
							return 'WAITING_DOOR_CLOSE_TO_GO_DOWN';
						break;

						case MOVING_UP:
							return 'MOVING_UP';
						break;

						case MOVING_DOWN:
							return 'MOVING_DOWN';
						break;

					}
				},
				getState: function() {
					// console.log(mState);
					return mState;
				},
				isStopped: function() {
					if (mState === STOPPED)
						return true;
					return false;
				},
				isWaitingDoorCloseToGoUp: function() {
					if (mState === WAITING_DOOR_CLOSE_TO_GO_UP)
						return true;
					return false;
				},
				isWaitingDoorCloseToGoDown: function() {
					if (mState === WAITING_DOOR_CLOSE_TO_GO_DOWN)
						return true;
					return false;
				},
				isMovingUp: function() {
					if (mState === MOVING_UP)
						return true;
					return false;
				},
				isMovingDown: function() {
					if (mState === MOVING_DOWN)
						return true;
					return false;
				},
				setAsMovingUp: function() {
					mState = MOVING_UP;
				},
				setAsMovingDown: function() {
					mState = MOVING_DOWN;
				},
				setAsStopped: function() {
					mState = STOPPED;
				},
				setAsWaitingDoorClose: function() {
					mState = WAITING_DOOR_CLOSE;
				},
				setTimeDoorsOpened: function(timeDoorsOpened) {
					mTimeDoorsOpened = timeDoorsOpened;
				},
				setMaxPassangers: function(maxPassangers) {
					mMaxPassangers = maxPassangers;
				},
				setSpeedByFloor: function(speedByFloor) {
					mSpeedByFloor = speedByFloor;
				},
				setCurrentFloor: function(floor) {
					mCurrentFloor = floor;
				},
				setId: function(id) {
					mId = id;
				},
				getId: function() {
					return mId;
				},
				setTargetFloors: function(targetFloor) {
					mTargetFloors = targetFloor;
				},
				getTargetFloors: function() {
					return mTargetFloors;
				}
			};
		})();
		
		if ( typeof config !== 'undefined' && typeof config.id !== 'undefined' )
			lift.setId(config.id);

		if ( typeof config !== 'undefined' && typeof config.lastCallTime !== 'undefined' )
			lift.setLastCallTime(config.lastCallTime);

		if ( typeof config !== 'undefined' && typeof config.timeDoorsOpened !== 'undefined' )
			lift.setTimeDoorsOpened(config.timeDoorsOpened);

		if ( typeof config !== 'undefined' && typeof config.maxPassangers !== 'undefined' )
			lift.setMaxPassangers(config.maxPassangers);

		if ( typeof config !== 'undefined' && typeof config.speedByFloor !== 'undefined' )
			lift.setSpeedByFloor(config.speedByFloor);

		if ( typeof config !== 'undefined' && typeof config.currentFloor !== 'undefined' )
			lift.setCurrentFloor(config.currentFloor);

		if ( typeof config !== 'undefined' && typeof config.state !== 'undefined' )
			lift.setState(config.state);

		if ( typeof config !== 'undefined' && typeof config.targetFloors !== 'undefined' )
			lift.setTargetFloors(config.targetFloors);

		return lift;
	}

}
