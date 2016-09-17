var STOPPED = 1;
var MOVING_UP = 2;
var MOVING_DOWN = 3;
var WAITING_DOOR_CLOSE_TO_GO_UP = 4;
var WAITING_DOOR_CLOSE_TO_GO_DOWN = 5;
var WAITING = 6;

module.exports = {	
	createTimeMachine: function(config) {
		var brain = (function(){

			var mLifts = [];
			var mNumOfFloors = 26;
			var mTimeDoorsOpened = 20;
			var secondsByFloor = 2;

			return {
				run: function(lift,secondsToMove) {

					if ( secondsToMove <= 0 )
						return lift;

					switch(lift.getState()) {
						case STOPPED:
							lift.setState(STOPPED);
							return lift;
						break;
						
						case WAITING_DOOR_CLOSE_TO_GO_UP:
							var currentFloor = lift.getCurrentFloor();
							
							lift.catchPeople(currentFloor);
							lift.leavePeople(currentFloor);

							if ( !lift.hasTargetFloor() || ( lift.getTargetFloor() === lift.getCurrentFloor() && lift.getNumOfPeopleIn() === 1 ))
							{
								lift.setState(STOPPED);
								return lift;
							}

							if ( secondsToMove <= lift.getDoorTimer() )
							{
								lift.decDoorTimer(secondsToMove);
								lift.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
								return lift;
							}
							
							var seconds = Math.abs(secondsToMove - lift.getDoorTimer());
							lift.resetDoorTimer();

							
							

							if ( lift.getCurrentFloor() < lift.getTargetFloor() )
								lift.setState(MOVING_UP);
							else if ( lift.getCurrentFloor() > lift.getTargetFloor() )
								lift.setState(MOVING_DOWN);
							else
								lift.setState(STOPPED);

							return this.run(lift,seconds)
						break;

						case WAITING_DOOR_CLOSE_TO_GO_DOWN:
							
							var targetFloor  = lift.getTargetFloor();
							var currentFloor = lift.getCurrentFloor();
							lift.catchPeople(currentFloor);
							lift.leavePeople(currentFloor);

							if ( !lift.hasTargetFloor() || ( targetFloor === currentFloor && lift.getNumOfPeopleIn() === 1 ) )
							{
								lift.setState(STOPPED);
								return lift;
							}
							if ( secondsToMove <= lift.getDoorTimer() )
							{
								lift.decDoorTimer(secondsToMove);
								lift.setState(WAITING_DOOR_CLOSE_TO_GO_DOWN);
								return lift;
							}
							
							//closed door!!
							var seconds = Math.abs(secondsToMove - lift.getDoorTimer());
							lift.resetDoorTimer();

							if ( currentFloor < targetFloor )
								lift.setState(MOVING_UP);
							else if ( currentFloor > lift.getTargetFloor() )
								lift.setState(MOVING_DOWN);

							return this.run(lift,seconds)
						break;

						case MOVING_UP:
							
							if ( !lift.hasTargetFloor() )
							{
								lift.setState(STOPPED);
								return lift;
							}


							//Move actually!
							var numOfFloorsToReachNext = Math.abs(lift.getTargetFloor()-lift.getCurrentFloor());
							var secondsToReachNextFloor = numOfFloorsToReachNext*secondsByFloor;

							if ( secondsToMove < secondsToReachNextFloor )
							{
								lift.moveUpTo( lift.getCurrentFloor() + (secondsToMove/secondsByFloor) );
								return lift;
							}

							if ( secondsToMove === secondsToReachNextFloor )
							{
								lift.moveUpTo( lift.getCurrentFloor() + (secondsToMove/secondsByFloor) );

								
								

								if ( !lift.hasTargetFloor() )
								{
									lift.setState(STOPPED);
									return lift;									
								}
								else if ( lift.getCurrentFloor() < lift.getTargetFloor() )
								{
									lift.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
									return lift; //keep moving up
								}
								else if ( lift.getCurrentFloor() > lift.getTargetFloor() )
								{
									lift.setState(WAITING_DOOR_CLOSE_TO_GO_DOWN);
									return  lift;
								}
							}

							if ( secondsToMove > secondsToReachNextFloor )
							{
								lift.moveUpTo( lift.getCurrentFloor() + (secondsToReachNextFloor/secondsByFloor) );

								secondsToMove-=secondsToReachNextFloor;
								if ( !lift.hasTargetFloor() )
								{
									lift.setState(STOPPED);
									return lift;									
								}
								else if ( lift.getCurrentFloor() < lift.getTargetFloor() )
								{
									lift.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
									return this.run(lift,secondsToMove); //keep moving up
								}
								else if ( lift.getCurrentFloor() > lift.getTargetFloor() )
								{
									lift.setState(WAITING_DOOR_CLOSE_TO_GO_DOWN);
									return this.run(lift,secondsToMove);
								}
															
							}
						break;

						case MOVING_DOWN:
							
							if ( !lift.hasTargetFloor() )
							{
								lift.setState(STOPPED);
								return lift;
							}

							//Move actually!
							var numOfFloorsToReachNext = Math.abs(lift.getTargetFloor()-lift.getCurrentFloor());
							var secondsToReachNextFloor = numOfFloorsToReachNext*secondsByFloor;

							if ( secondsToMove < secondsToReachNextFloor )
							{
								lift.moveDownTo( lift.getCurrentFloor() - (secondsToMove/secondsByFloor) );
								return lift;
							}

							if ( secondsToMove === secondsToReachNextFloor )
							{
								lift.moveDownTo( lift.getCurrentFloor() - (secondsToMove/secondsByFloor) );
								if ( !lift.hasTargetFloor() )
								{
									lift.setState(STOPPED);
									return lift;									
								}
								else if ( lift.getCurrentFloor() < lift.getTargetFloor() )
								{
									lift.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
									return lift; //keep moving up
								}
								else if ( lift.getCurrentFloor() > lift.getTargetFloor() )
								{
									lift.setState(WAITING_DOOR_CLOSE_TO_GO_DOWN);
									return  lift;
								}
							}

							if ( secondsToMove > secondsToReachNextFloor )
							{
								lift.moveDownTo( lift.getCurrentFloor() - (secondsToReachNextFloor/secondsByFloor) );
								secondsToMove-=secondsToReachNextFloor;

								if ( !lift.hasTargetFloor() )
								{
									lift.setState(STOPPED);
									return lift;	
								}
								else if ( lift.getCurrentFloor() < lift.getTargetFloor() )
								{
									lift.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
									return this.run(lift,secondsToMove); //keep moving up
								}
								else if ( lift.getCurrentFloor() > lift.getTargetFloor() )
								{
									lift.setState(WAITING_DOOR_CLOSE_TO_GO_DOWN);
									return this.run(lift,secondsToMove);
								}

							}
						break;						
					}
				},
				plugLift: function(lift) {
					mLifts.push(lift);
				},
				setNumOfFloors: function(numOfFloors) {
					mNumOfFloors = numOfFloors;
				},
				setTimeDoorsOppened: function(timeDoorsOpened) {
					mTimeDoorsOpened = timeDoorsOpened;
				}
			}

		})();

		if ( typeof config !== 'undefined' && typeof config.numOfFloors !== 'undefined' )
			brain.setNumOfFloors(config.numOfFloors);

		if ( typeof config !== 'undefined' && typeof config.timeDoorsOpened !== 'undefined' )
			brain.setTimeDoorsOppened(config.timeDoorsOpened);

		if ( typeof config !== 'undefined' && typeof config.secondsByFloor !== 'undefined' )
			brain.setSecondsByFloor(config.secondsByFloor);

		return brain;
	}
}