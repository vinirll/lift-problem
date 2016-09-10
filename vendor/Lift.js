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

			var upPeople			= [];
			var downPeople			= [];

			var mTimeToCloseDoor = 20;
			var doorTimer = 20;

			return {
				setId: function(id) {
					mId = id;
				},
				getId: function() {
					return mId;
				},
				getState: function() {
					return mState;
				},
				setMaxPassangers: function(maxPassangers) {
					mMaxPassangers = maxPassangers;
				},
				isFullyLoaded: function() {
					return ((upPeople.length+downPeople.length)>=mMaxPassangers);
				},
				getNumOfPeopleIn: function() {
					return upPeople.length+downPeople.length;
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
					if ( upPeople.length > 0 )
					{
						var floorIdx = upPeople.indexOf(Math.ceil(floor));
						upPeople.splice(0,floorIdx+1)
					}
				},
				moveDownTo: function(floor) {
					this.setCurrentFloor(floor);
					if ( downPeople.length > 0 )
					{
						var floorIdx = downPeople.indexOf(Math.ceil(floor));
						downPeople.splice(0,floorIdx+1)
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
						if ( upPeople.length > 0 )
							return upPeople[ 0 ];
						else if ( downPeople.length > 0 )
							return downPeople[0]
						else
							return null;
					}
					else if (mState === MOVING_DOWN || mState === WAITING_DOOR_CLOSE_TO_GO_DOWN)
					{
						if ( downPeople.length > 0 )
							return downPeople[ 0 ];
						else if ( upPeople.length > 0 )
							return upPeople[0]
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
				setUpPeople: function(upPeopleParam) {
					upPeople = upPeopleParam;
				},
				setDownPeople: function(downPeopleParam) {
					downPeople = downPeopleParam;
				},
				getDownPeople: function() {
					return downPeople;
				},
				getUpPeople: function() {
					return upPeople;
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

		if ( typeof config !== 'undefined' && typeof config.upPeople !== 'undefined' )
			lift.setUpPeople(config.upPeople);

		if ( typeof config !== 'undefined' && typeof config.downPeople !== 'undefined' )
			lift.setDownPeople(config.downPeople);		

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
