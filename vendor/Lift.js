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
			var downFloor		= [];
			var peopleToLeave = {};
			var peopleToEnter = {};

			var intents = [];

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
					// peopleToEnter[ callObj.from ].push(person);
					// peopleToLeave[ callObj.to ].push(person);
				},
				call: function(intent) {
					intents.push(intent);
				},
				leavePeople: function(floor) {
					_.remove(intents,(i) => (i.person.isInLift() && i.to === floor));
				},
				catchPeople: function(floor) {
					_.map(intents,(i) => {
						if ( !i.person.isInLift() && i.from === floor )
							i.person.enterLift();
					});
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
					return _.filter(intents,(i) => i.person.isInLift()).length;
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
					this.leavePeople(floor);
					this.catchPeople(floor);
					this.setCurrentFloor(floor);
				},
				moveDownTo: function(floor) {
					this.leavePeople(floor);
					this.catchPeople(floor);
					this.setCurrentFloor(floor);
				},
				setCurrentFloor: function(currentFloor) {
					mCurrentFloor = currentFloor;
				},
				getCurrentFloor: function() {
					return mCurrentFloor;
				},
				getTargetFloor: function() {

					if ( intents.length === 0 )
						return null;

					if (mState === MOVING_UP || mState === WAITING_DOOR_CLOSE_TO_GO_UP)
					{
						var upTargetFloor =  this.getUpTargetFloor();
						if ( typeof upTargetFloor !== 'undefined' )
							return upTargetFloor;

						var downTargetFloor = this.getDownTargetFloor();
						if ( typeof downTargetFloor !== 'undefined' )
							return downTargetFloor;
					}

					if (mState === MOVING_DOWN || mState === WAITING_DOOR_CLOSE_TO_GO_DOWN)
					{
						var downTargetFloor =  this.getDownTargetFloor();
						if ( typeof downTargetFloor !== 'undefined' )
							return downTargetFloor;
						
						var upTargetFloor = this.getUpTargetFloor();
						if ( typeof upTargetFloor !== 'undefined' )
							return upTargetFloor;
					}

					return null;
				},
				getUpTargetFloor: function() {
					var inLiftList 					= _.filter(intents,(i) => (i.person.isInLift() &&  i.to > mCurrentFloor));
					var notInLiftListOnThisFloor 	= _.filter(intents,(i) => (!i.person.isInLift() && i.from > mCurrentFloor && i.to > i.from));
					var notInLiftButOnThisFloor		= _.filter(intents,(i) => (!i.person.isInLift() && i.from === mCurrentFloor && i.to > i.from));

					if (inLiftList.length === 0 && notInLiftListOnThisFloor.length === 0 && notInLiftButOnThisFloor.length === 0)
					{
						list = _.filter(intents,(i)=>(!i.person.isInLift() && i.from > mCurrentFloor && i.to < i.from));
						if (list.length === 0) return;
						return _.maxBy(list,function(i){ return i.from }).from;
					}

					if ( notInLiftListOnThisFloor.length === 0 && notInLiftButOnThisFloor.length !== 0 && inLiftList.length === 0)
						return _.minBy(notInLiftButOnThisFloor,(i)=>i.to).to;
					else if (notInLiftListOnThisFloor.length !== 0 && notInLiftButOnThisFloor.length === 0 && inLiftList.length === 0 )
						return _.minBy(notInLiftListOnThisFloor,(i)=>i.from).from;
					else if (notInLiftListOnThisFloor.length === 0 && notInLiftButOnThisFloor.length === 0 && inLiftList.length !== 0)
						return _.minBy(inLiftList,(i)=>i.to).to;
					else if (notInLiftListOnThisFloor.length !== 0 && notInLiftButOnThisFloor.length === 0 && inLiftList.length !== 0)
					{
						var inListMinTo = _.minBy(inLiftList,function(i){ return i.to });
						var notInListMinFrom = _.minBy(notInLiftListOnThisFloor,function(i){ return i.from });
						return (inListMinTo.to < notInListMinFrom.from) ? inListMinTo.to:notInListMinFrom.from;						
					}
					else if (notInLiftListOnThisFloor.length === 0 && notInLiftButOnThisFloor.length !== 0 && inLiftList.length !== 0)
					{
						// console.log('FFFFF');
						var inListMinTo = _.minBy(inLiftList,function(i){ return i.to });
						var notInListMinFrom = _.minBy(notInLiftButOnThisFloor,function(i){ return i.to });
						return (inListMinTo.to < notInListMinFrom.from) ? inListMinTo.to:notInListMinFrom.from;
					}
				},
				getDownTargetFloor: function() {
					var inLiftList 					= _.filter(intents,(i) => (i.person.isInLift() &&  i.to < mCurrentFloor));
					var notInLiftListOnThisFloor 	= _.filter(intents,(i) => (!i.person.isInLift() && i.from < mCurrentFloor && i.to < i.from));
					var notInLiftButOnThisFloor		= _.filter(intents,(i) => (!i.person.isInLift() && i.from === mCurrentFloor && i.to < i.from));

					if (inLiftList.length === 0 && notInLiftListOnThisFloor.length === 0 && notInLiftButOnThisFloor == 0)
					{
						list = _.filter(intents,(i)=>(!i.person.isInLift() && i.from < mCurrentFloor && i.to > i.from));
						if (list.length === 0) return;
						return _.minBy(list,function(i){ return i.from }).from;
					}

					if ( notInLiftListOnThisFloor.length === 0 && notInLiftButOnThisFloor.length !== 0 && inLiftList.length === 0)
						return _.maxBy(notInLiftButOnThisFloor,(i)=>i.to).to;
					else if (notInLiftListOnThisFloor.length !== 0 && notInLiftButOnThisFloor.length === 0 && inLiftList.length === 0 )
						return _.maxBy(notInLiftListOnThisFloor,(i)=>i.from).from;
					else if (notInLiftListOnThisFloor.length === 0 && notInLiftButOnThisFloor.length === 0 && inLiftList.length !== 0)
						return _.maxBy(inLiftList,(i)=>i.to).to;
					else if (notInLiftListOnThisFloor.length !== 0 && notInLiftButOnThisFloor.length === 0 && inLiftList.length !== 0)
					{
						var inListMinTo = _.maxBy(inLiftList,function(i){ return i.to });
						var notInListMinFrom = _.maxBy(notInLiftListOnThisFloor,function(i){ return i.from });
						return (inListMinTo.to < notInListMinFrom.from) ? inListMinTo.to:notInListMinFrom.from;						
					}
					else if (notInLiftListOnThisFloor.length === 0 && notInLiftButOnThisFloor.length !== 0 && inLiftList.length !== 0)
					{
						var inListMinTo = _.maxBy(inLiftList,function(i){ return i.to });
						var notInListMinFrom = _.maxBy(notInLiftButOnThisFloor,function(i){ return i.to });
						return (inListMinTo.to < notInListMinFrom.from) ? inListMinTo.to:notInListMinFrom.from;
					}
				},
				hasTargetFloor: function() {
					return (intents.length>0);
				},
				setState: function(state) {
					if (( mState === MOVING_DOWN && state === MOVING_UP )					||
						( mState === MOVING_UP && state === MOVING_DOWN )					||
						( mState === MOVING_UP && state === WAITING_DOOR_CLOSE_TO_GO_DOWN ) ||
						( mState === MOVING_DOWN && state === WAITING_DOOR_CLOSE_TO_GO_UP ))
					{
						this.flipDirection();
					}

					mState = state;
				},
				flipDirection: function() {

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
