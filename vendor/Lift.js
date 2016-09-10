var STOPPED = 1;
var MOVING_UP = 2;
var MOVING_DOWN = 3;
var WAITING_DOOR_CLOSE_TO_GO_UP = 4;
var WAITING_DOOR_CLOSE_TO_GO_DOWN = 5;

var _ = require('lodash');

module.exports = {
	
	createLift: function(config) {
		var lift = (function(){
			var mId 				= null;
			var mState 				= STOPPED;
			var mMaxPassangers 		= 8;
			var mCurrentFloor 		= 1;
			var currentTargetFloor 	= null;
			var mTargetFloors 		= [];

			var upFloor			= [];
			var downFloor			= [];

			var peopleToLeave = {};
			var peopleToEnter = {};

			var mTimeToCloseDoor = 20;
			var doorTimer = 20;

			return {
				setId: function(id) {
					mId = id;
				},
				getId: function() {
					return mId;
				},
				addIntoFullyLoaded: function(callObj,person) {
					peopleToEnter[ callObj.from ].push(person);
					peopleToLeave[ callObj.to ].push(person);
				},
				add: function(callObj,person) {
					peopleToEnter[ callObj.from ].push(person);
					peopleToLeave[ callObj.to ].push(person);

					if ( mCurrentFloor === callObj.from )
					{
						if ( callObj.from < callObj.to )
						{
							upFloor.push( callObj.to );
							upFloor.sort();							
						}
						else
						{
							downFloor.push( callObj.to );
							downFloor.sort();														
						}
					}
					else if ( mCurrentFloor > callObj.from )
					{
						downFloor.push( callObj.from );
						if ( callObj.from < callObj.to )
							upFloor.push( callObj.to );
						else
						{
						}
					}
					else if ( mCurrentFloor < callObj.from )
					{
						if ( callObj.from < callObj.to )
						{
						}
						else
						{
						}
					}
				},
				leavePeople: function() {
					var currentFloor = this.getCurrentFloor();
					for (var i=0;i<peopleToLeave[currentFloor].length;i++)
						peopleToLeave[currentFloor][i].leaveLift();
					delete peopleToLeave[ this.getCurrentFloor() ];
				},
				catchPeople: function() {
					var currentFloor = this.getCurrentFloor();
					for (var i=0;i<peopleToEnter[currentFloor].length;i++)
						peopleToEnter[currentFloor][i].enterLift();
					delete peopleToEnter[ this.getCurrentFloor() ];
				},
				getState: function() {
					return mState;
				},
				setMaxPassangers: function(maxPassangers) {
					mMaxPassangers = maxPassangers;
				},
				isFullyLoaded: function() {
					return ((upFloor.length+downFloor.length)>=mMaxPassangers);
				},
				getNumOfPeopleIn: function() {
					return upFloor.length+downFloor.length;
				},
				isStopped: function() {
					if (mState === STOPPED)
						return true;
					return false;
				},
				isMovingUp: function() {
					if (mState === MOVING_UP)
						return true;
					return false;
				},
				moveUpTo: function(floor) {
					this.setCurrentFloor(floor);
					if ( upFloor.length > 0 )
					{
						var floorIdx = upFloor.indexOf(Math.ceil(floor));
						upFloor.splice(0,floorIdx+1)
					}
				},
				moveDownTo: function(floor) {
					this.setCurrentFloor(floor);
					if ( downFloor.length > 0 )
					{
						var floorIdx = downFloor.indexOf(Math.ceil(floor));
						downFloor.splice(0,floorIdx+1)
					}
				},
				setCurrentFloor: function(currentFloor) {
					mCurrentFloor = currentFloor;
				},
				getCurrentFloor: function() {
					return mCurrentFloor;
				},
				getTargetFloor: function() {
					if (mState === MOVING_UP || mState === WAITING_DOOR_CLOSE_TO_GO_UP)
					{
						if ( upFloor.length > 0 )
							return upFloor[ 0 ];
						else if ( downFloor.length > 0 )
							return downFloor[0]
						else
							return null;
					}
					else if (mState === MOVING_DOWN || mState === WAITING_DOOR_CLOSE_TO_GO_DOWN)
					{
						if ( downFloor.length > 0 )
							return downFloor[ 0 ];
						else if ( upFloor.length > 0 )
							return upFloor[0]
						else
							return null;
					}
					else
						return null;
				},
				hasTargetFloor: function() {
					if ( this.getTargetFloor() !== null )
						return true;
					return false;
				},
				setState: function(state) {
					mState = state;
				},
				setUpFloors: function(upFloorParam) {
					upFloor = upFloorParam;
				},
				setDownFloors: function(downFloorParam) {
					downFloor = downFloorParam;
				},
				getDownFloor: function() {
					return downFloor;
				},
				getUpFloor: function() {
					return upFloor;
				},
				setTimeToCloseDoor: function(timeToCloseDoor) {
					mTimeToCloseDoor = timeToCloseDoor;
					doorTimer = timeToCloseDoor;
				},
				getTimeToCloseDoor: function() {
					return mTimeToCloseDoor;
				},
				getDoorTimer: function() {
					return doorTimer;
				},
				decDoorTimer: function(seconds) {
					doorTimer-=seconds;
				},
				resetDoorTimer: function() {
					doorTimer = mTimeToCloseDoor;
				}
			};
		})();
		
		if ( typeof config !== 'undefined' && typeof config.id !== 'undefined' )
			lift.setId(config.id);

		if ( typeof config !== 'undefined' && typeof config.timeToCloseDoor !== 'undefined' )
			lift.setTimeToCloseDoor(config.timeToCloseDoor);

		if ( typeof config !== 'undefined' && typeof config.upFloor !== 'undefined' )
			lift.setUpFloors(config.upFloor);

		if ( typeof config !== 'undefined' && typeof config.downFloor !== 'undefined' )
			lift.setDownFloors(config.downFloor);		

		if ( typeof config !== 'undefined' && typeof config.maxPassangers !== 'undefined' )
			lift.setMaxPassangers(config.maxPassangers);

		if ( typeof config !== 'undefined' && typeof config.currentFloor !== 'undefined' )
			lift.setCurrentFloor(config.currentFloor);

		if ( typeof config !== 'undefined' && typeof config.state !== 'undefined' )
			lift.setState(config.state);

		if ( typeof config !== 'undefined' && typeof config.targetFloors !== 'undefined' )
			lift.setTargetFloors(config.targetFloors);

		return lift;
	}
}

[4,6,8,10]
[9,7,6,1]
