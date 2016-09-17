var assert 					= require('assert');
var liftFactory				= require('../vendor/Lift.js');
var brain 					= require('../vendor/Console.js');
var peopleFactory 			= require('../vendor/PeopleFactory.js');
var timeMachineFactory 		= require('../vendor/TimeMachine.js');

var STOPPED = 1;
var MOVING_UP = 2;
var MOVING_DOWN = 3;
var WAITING_DOOR_CLOSE_TO_GO_UP = 4;
var WAITING_DOOR_CLOSE_TO_GO_DOWN = 5;

// describe('Lift Creation', function() {
// 	var lift1 = liftFactory.createLift({id:1,maxPassangers:8,upFloor:[1,4,6],downFloor:[3,10]});

// 	it('should be initially at first floor',function(){
// 		assert.equal(1,lift1.getCurrentFloor());
// 	});

// 	it('should be initially stopped',function(){
// 		assert.equal(true,lift1.isStopped());
// 	});

// 	it('should be moving up afte set up',function(){
// 		lift1.setState(MOVING_UP);
// 		assert.equal(true,lift1.getState()===MOVING_UP);
// 	});

// 	it('should be moving down afte set down',function(){
// 		lift1.setState(MOVING_DOWN);
// 		assert.equal(true,lift1.getState()===MOVING_DOWN);
// 	});

// 	it('should have the right number of upFloor added in',function(){
// 		assert.equal(3,lift1.getUpFloor().length);
// 		assert.equal(2,lift1.getDownFloor().length);
// 	});

// 	it('should moveUpTo Correctly',function(){
// 		var lift2 = liftFactory.createLift({id:2,maxPassangers:8,upFloor:[1,4,6,10,11],downFloor:[11,10,8,5,3,1]});
// 		lift2.moveUpTo( 6 );
// 		assert.equal(6,lift2.getCurrentFloor());
// 		assert.deepEqual([10,11],lift2.getUpFloor());
// 	});

// 	it('should moveDownTo Correctly',function(){
// 		var lift2 = liftFactory.createLift({id:2,maxPassangers:8,upFloor:[1,4,6,10,11],downFloor:[11,10,8,5,3,1]});
// 		lift2.setCurrentFloor(11);
// 		lift2.moveDownTo( 8 );
// 		assert.equal(8,lift2.getCurrentFloor());
// 		assert.deepEqual([5,3,1],lift2.getDownFloor());
// 	});
// });

describe('Lift people control', function() {
	var max = 8;
	it('should be fully loaded after limit reach',function(){
		var lift1 = liftFactory.createLift({id:1,maxPassangers:max,upFloor:[1,4,6],downFloor:[3,10]});
		assert.equal(false,lift1.isFullyLoaded());

		var lift2 = liftFactory.createLift({id:1,maxPassangers:max,upFloor:[1,4,6,7],downFloor:[3,10,11,12]});
		assert.equal(true,lift2.isFullyLoaded());
	});
});

describe('Lift Console Creation', function() {
	var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,upFloor:[1,4,6],downFloor:[3,10]});
	var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,upFloor:[1,4,6],downFloor:[3,10]});
	var liftConsole 	= brain.createLiftBrain();

	liftConsole.addLift(lift1);
	liftConsole.addLift(lift2);
	
	it('should have the right number of lifts in',function(){
		assert.equal(2,liftConsole.getLifts().length);
	});

	it('should give same fore for all lift initially',function() {
		var scoreLift1 = liftConsole.getLiftScore(lift1,{from:1,to:10});
		var scoreLift2 = liftConsole.getLiftScore(lift2,{from:1,to:10});

		assert.equal(scoreLift1,scoreLift2);
		assert.equal(27,scoreLift1);
	});
});

describe('Score Assignment',function(){

	it('should have higher score the best placed lift related to call',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
		var liftConsole 	= brain.createLiftBrain();
		liftConsole.addLift(lift1);
		liftConsole.addLift(lift2);

		var liftCall = {from:1,to:10};
		var scoreLift1 = liftConsole.getLiftScore(lift1,liftCall);
		var scoreLift2 = liftConsole.getLiftScore(lift2,liftCall);
		assert.equal(true,scoreLift1>scoreLift2);
	});

	it('should have higher score the lift moving toward the call over the lift moving away the call',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
		var liftConsole 	= brain.createLiftBrain();

		var liftCall = {from:5,to:1};

		// toward the liftCall 2 ==> 4,"5"
		lift1.setCurrentFloor(2);
		lift1.setUpFloors([4,5,10]);
		lift1.setState(MOVING_UP);

		// opposite the liftCall 6 ==> 8,9...
		lift2.setCurrentFloor(6);
		lift2.setUpFloors([8,9,10]);
		lift2.setState(MOVING_UP);

		liftConsole.addLift(lift1);
		liftConsole.addLift(lift2);

		var scoreLift1 = liftConsole.getLiftScore(lift1,liftCall);
		var scoreLift2 = liftConsole.getLiftScore(lift2,liftCall);
		assert.equal(true,scoreLift1>scoreLift2);
	});

	it('should have higher score the lift moving toward with less distance',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
		var liftConsole 	= brain.createLiftBrain();

		var liftCall = {from:5,to:1};

		// toward the liftCall 2 ==> 4,"5"
		lift1.setCurrentFloor(2);
		lift1.setUpFloors([4,5,10]);
		lift1.setState(MOVING_UP);

		// toward the liftCall 4 ==> 4,"5"
		lift2.setCurrentFloor(4);
		lift2.setUpFloors([4,5,6]);
		lift2.setState(MOVING_UP);

		liftConsole.addLift(lift1);
		liftConsole.addLift(lift2);

		var scoreLift1 = liftConsole.getLiftScore(lift1,liftCall);
		var scoreLift2 = liftConsole.getLiftScore(lift2,liftCall);
		assert.equal(true,scoreLift2>scoreLift1);
	});

	it('should have both score 1 when both lift are getting away of call',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
		var liftConsole 	= brain.createLiftBrain();

		var liftCall = {from:5,to:1};

		// away the liftCall 4 ==> 1
		lift1.setCurrentFloor(4);
		lift1.setDownFloors([1]);
		lift1.setState(MOVING_DOWN);

		// away the liftCall 6 ==> 10,20
		lift2.setCurrentFloor(6);
		lift2.setUpFloors([10,20]);
		lift2.setState(MOVING_UP);

		liftConsole.addLift(lift1);
		liftConsole.addLift(lift2);

		var scoreLift1 = liftConsole.getLiftScore(lift1,liftCall);
		var scoreLift2 = liftConsole.getLiftScore(lift2,liftCall);
		assert.equal(1,scoreLift1);
		assert.equal(1,scoreLift2);
	});

	it('should have both score 1 when both lift are getting away of call [SPECIAL CASE 1]',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
		var liftConsole 	= brain.createLiftBrain();

		var liftCall = {from:5,to:1};

		lift1.setCurrentFloor(4);
		lift1.setDownFloors([1]);
		lift1.setState(MOVING_DOWN);

		lift2.setCurrentFloor(6);
		lift2.setUpFloors([10]);
		lift2.setState(MOVING_UP);

		liftConsole.addLift(lift1);
		liftConsole.addLift(lift2);

		var scoreLift1 = liftConsole.getLiftScore(lift1,liftCall);
		var scoreLift2 = liftConsole.getLiftScore(lift2,liftCall);

		assert.equal(true,scoreLift1===scoreLift2);
	});

	it('should be better scored when lift is at call floor',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
		var lift3 			= liftFactory.createLift({id:3,maxPassangers:8,currentFloor:2});
		var liftConsole 	= brain.createLiftBrain();

		var liftCall = {from:5,to:1};

		lift1.setCurrentFloor(5);
		lift1.setDownFloors([1]);
		lift1.setState(MOVING_DOWN);

		lift2.setCurrentFloor(6);
		lift2.setDownFloors([1]);
		lift2.setState(MOVING_DOWN);

		lift3.setCurrentFloor(5);
		lift3.setUpFloors([10]);
		lift3.setState(MOVING_UP);

		liftConsole.addLift(lift1);
		liftConsole.addLift(lift2);
		liftConsole.addLift(lift3);

		var scoreLift1 = liftConsole.getLiftScore(lift1,liftCall);
		var scoreLift2 = liftConsole.getLiftScore(lift2,liftCall);
		var scoreLift3 = liftConsole.getLiftScore(lift3,liftCall);

		assert.equal(true,scoreLift1>scoreLift2);
		assert.equal(true,(scoreLift1>scoreLift3&&scoreLift2>scoreLift3));
	});

	describe('Lift choose',function(){
		it('should create a listScoreHash',function(){
			var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
			var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
			var lift3 			= liftFactory.createLift({id:3,maxPassangers:8,currentFloor:2});
			var liftConsole 	= brain.createLiftBrain();
			var liftCall = {from:1,to:10};

			lift1.setCurrentFloor(5);
			lift1.setDownFloors([1]);
			lift1.setState(MOVING_DOWN);

			lift2.setCurrentFloor(1);
			lift2.setState(STOPPED);

			lift3.setCurrentFloor(5);
			lift3.setUpFloors([10]);
			lift3.setState(MOVING_UP);

			liftConsole.addLift(lift1);
			liftConsole.addLift(lift2);
			liftConsole.addLift(lift3);

			var listScoreHash = liftConsole.getBestLiftScoreHash(liftCall);
			assert.equal(3,Object.keys(listScoreHash).length);
		});

		it('should choose the best lift to answer',function(){
			var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
			var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
			var lift3 			= liftFactory.createLift({id:3,maxPassangers:8,currentFloor:2});
			var liftConsole 	= brain.createLiftBrain();
			var liftCall = {from:1,to:10};

			lift1.setCurrentFloor(5);
			lift1.setDownFloors([1]);
			lift1.setState(MOVING_DOWN);

			lift2.setCurrentFloor(1);
			lift2.setState(STOPPED);

			lift3.setCurrentFloor(5);
			lift3.setUpFloors([10]);
			lift3.setState(MOVING_UP);

			liftConsole.addLift(lift1);
			liftConsole.addLift(lift2);
			liftConsole.addLift(lift3);

			var lift = liftConsole.getBestLiftToAnswer(liftCall);
			assert.equal(true,lift!==null);
			assert.equal(2,lift.getId());
		});

		it('should choose the one not fully loaded',function(){
			var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
			var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
			var lift3 			= liftFactory.createLift({id:3,maxPassangers:8,currentFloor:2});
			var liftConsole 	= brain.createLiftBrain();
			var liftCall = {from:1,to:10};

			lift1.setCurrentFloor(5);
			lift1.setUpFloors([1,2,3,4,5,6,7,8]);
			lift1.setState(MOVING_UP);

			lift2.setCurrentFloor(2);
			lift2.setState(MOVING_UP);
			lift2.setUpFloors([2,3,4,5,6,7,8,10,11]);

			lift3.setCurrentFloor(5);
			lift3.setUpFloors([10]);
			lift3.setState(MOVING_UP);

			liftConsole.addLift(lift1);
			liftConsole.addLift(lift2);
			liftConsole.addLift(lift3);

			var lift = liftConsole.getBestLiftToAnswer(liftCall);
			assert.equal(true,lift!==null);
			assert.equal(3,lift.getId());
		});

		it('should choose the best placed lift when all are fully loaded',function(){
			var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
			var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
			var lift3 			= liftFactory.createLift({id:3,maxPassangers:8,currentFloor:2});
			var lift4 			= liftFactory.createLift({id:4,maxPassangers:8,currentFloor:2});
			var liftConsole 	= brain.createLiftBrain();
			var liftCall = {from:1,to:10};

			lift1.setCurrentFloor(5);
			lift1.setUpFloors([1,2,3,4,5,6,7,8]);
			lift1.setState(MOVING_UP);

			lift2.setCurrentFloor(2);
			lift2.setState(MOVING_UP);
			lift2.setUpFloors([2,3,4,5,6,7,8,10,11]);

			lift3.setCurrentFloor(11);
			lift3.setDownFloors([10,9,8,7,6,5,4,3,2,1]);
			lift3.setState(MOVING_DOWN);

			liftConsole.addLift(lift1);
			liftConsole.addLift(lift2);
			liftConsole.addLift(lift3);

			var lift = liftConsole.getBestLiftToAnswer(liftCall);
			assert.equal(true,lift!==null);
			assert.equal(3,lift.getId());

			lift4.setCurrentFloor(10);
			lift4.setDownFloors([9,8,7,6,5,4,3,2,1]);
			lift4.setState(MOVING_DOWN);

			liftConsole.addLift(lift4);
			var lift = liftConsole.getBestLiftToAnswer(liftCall);
			assert.equal(true,lift!==null);
			assert.equal(4,lift.getId());
		});

		it('should choose the best placed lift when all are fully loaded',function(){
			var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
			var lift2 			= liftFactory.createLift({id:2,maxPassangers:8,currentFloor:2});
			var liftConsole 	= brain.createLiftBrain();
			var liftCall = {from:1,to:10};

			lift1.setCurrentFloor(1);
			lift1.setState(STOPPED);

			lift2.setCurrentFloor(1);
			lift2.setState(STOPPED);

			liftConsole.addLift(lift1);
			liftConsole.addLift(lift2);

			var lift = liftConsole.getBestLiftToAnswer(liftCall);
			assert.equal(true,lift!==null);
			assert.equal(1,lift.getId());
		});
	});
});

describe('TimeMachine',function(){
	// it('MOVING UP - CASE 1',function(){
	// 	var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
	// 	var liftConsole 	= brain.createLiftBrain();
	// 	lift1.call({from:1,to:2,person: peopleFactory.createPerson({name:'A',arrivalTime:123123123123,targetFloor:2,inLift:false})});
	// 	lift1.call({from:1,to:4,person: peopleFactory.createPerson({name:'A',arrivalTime:123123123123,targetFloor:2,inLift:false})});

	// 	lift1.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
	// 	liftConsole.addLift(lift1);

	// 	var timeMachine = timeMachineFactory.createTimeMachine();
	// 	liftConsole.plugTimeMachine(timeMachine);
		
	// 	var lift1 = liftConsole.applyTimeMachineTo(0,10); //10 seconds
	// 	assert.equal(1,lift1.getCurrentFloor());
	// 	assert.equal(WAITING_DOOR_CLOSE_TO_GO_UP,lift1.getState());
	// });

	it('MOVING UP - CASE 2',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var liftConsole 	= brain.createLiftBrain();
		lift1.call({from:1,to:2,person: peopleFactory.createPerson({name:'A',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.call({from:1,to:4,person: peopleFactory.createPerson({name:'B',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
		liftConsole.addLift(lift1);
		
		var timeMachine = timeMachineFactory.createTimeMachine();
		liftConsole.plugTimeMachine(timeMachine);

		var lift1 = liftConsole.applyTimeMachineTo(0,20);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_UP,lift1.getState());
		assert.equal(1,lift1.getCurrentFloor());
	});

	it('MOVING UP - CASE 2',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var liftConsole 	= brain.createLiftBrain();
		lift1.call({from:1,to:2,person: peopleFactory.createPerson({name:'A',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.call({from:1,to:4,person: peopleFactory.createPerson({name:'B',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
		liftConsole.addLift(lift1);
		
		var timeMachine = timeMachineFactory.createTimeMachine();
		liftConsole.plugTimeMachine(timeMachine);

		var lift1 = liftConsole.applyTimeMachineTo(0,20);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_UP,lift1.getState());
		assert.equal(1,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,2);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_UP,lift1.getState());
		assert.equal(2,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,20);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_UP,lift1.getState());
		assert.equal(2,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,2);
		assert.equal(MOVING_UP,lift1.getState());
		assert.equal(3,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,2);
		assert.equal(STOPPED,lift1.getState());
		assert.equal(4,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,20000);
		assert.equal(STOPPED,lift1.getState());
		assert.equal(4,lift1.getCurrentFloor());
	});

	it('MOVING UP - CASE 3',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var liftConsole 	= brain.createLiftBrain();
		lift1.call({from:1,to:2,person: peopleFactory.createPerson({name:'A',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.call({from:1,to:4,person: peopleFactory.createPerson({name:'B',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.call({from:2,to:4,person: peopleFactory.createPerson({name:'C',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
		liftConsole.addLift(lift1);
		
		var timeMachine = timeMachineFactory.createTimeMachine();
		liftConsole.plugTimeMachine(timeMachine);

		assert.equal(0,lift1.getNumOfPeopleIn());

		var lift1 = liftConsole.applyTimeMachineTo(0,20);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_UP,lift1.getState());
		assert.equal(2,lift1.getNumOfPeopleIn());
		assert.equal(1,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,2);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_UP,lift1.getState());
		assert.equal(2,lift1.getNumOfPeopleIn());
		assert.equal(2,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,22);
		assert.equal(MOVING_UP,lift1.getState());
		assert.equal(2,lift1.getNumOfPeopleIn());
		assert.equal(3,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,2);
		assert.equal(STOPPED,lift1.getState());
		assert.equal(0,lift1.getNumOfPeopleIn());
		assert.equal(4,lift1.getCurrentFloor());
	});

it('MOVING DOWN - CASE 1',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var liftConsole 	= brain.createLiftBrain();
		lift1.call({from:1,to:2,person: peopleFactory.createPerson({name:'A',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.call({from:1,to:4,person: peopleFactory.createPerson({name:'B',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.call({from:2,to:4,person: peopleFactory.createPerson({name:'C',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.call({from:5,to:1,person: peopleFactory.createPerson({name:'C',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
		liftConsole.addLift(lift1);
		
		var timeMachine = timeMachineFactory.createTimeMachine();
		liftConsole.plugTimeMachine(timeMachine);

		var lift1 = liftConsole.applyTimeMachineTo(0,46);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_UP,lift1.getState());
		assert.equal(0,lift1.getNumOfPeopleIn());
		assert.equal(4,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,22);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_DOWN,lift1.getState());
		assert.equal(1,lift1.getNumOfPeopleIn());
		assert.equal(5,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,22);
		assert.equal(MOVING_DOWN,lift1.getState());
		assert.equal(1,lift1.getNumOfPeopleIn());
		assert.equal(4,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,2);
		assert.equal(MOVING_DOWN,lift1.getState());
		assert.equal(1,lift1.getNumOfPeopleIn());
		assert.equal(3,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,2);
		assert.equal(MOVING_DOWN,lift1.getState());
		assert.equal(1,lift1.getNumOfPeopleIn());
		assert.equal(2,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,2);
		assert.equal(STOPPED,lift1.getState());
		assert.equal(0,lift1.getNumOfPeopleIn());
		assert.equal(1,lift1.getCurrentFloor());		

		var lift1 = liftConsole.applyTimeMachineTo(0,20000);
		assert.equal(STOPPED,lift1.getState());
		assert.equal(0,lift1.getNumOfPeopleIn());
		assert.equal(1,lift1.getCurrentFloor());
	});

	it('MOVING UP AND DOWN - CASE 1',function(){
		var lift1 			= liftFactory.createLift({id:1,maxPassangers:8,currentFloor:1});
		var liftConsole 	= brain.createLiftBrain();


		lift1.call({from:1,to:15,person: peopleFactory.createPerson({name:'A',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.call({from:5,to:1,person: peopleFactory.createPerson({name:'B',arrivalTime:123123123123,targetFloor:2,inLift:false})});
		lift1.call({from:10,to:5,person: peopleFactory.createPerson({name:'C',arrivalTime:123123123123,targetFloor:2,inLift:false})});

		lift1.setState(WAITING_DOOR_CLOSE_TO_GO_UP);
		liftConsole.addLift(lift1);
		var timeMachine = timeMachineFactory.createTimeMachine();
		liftConsole.plugTimeMachine(timeMachine);

		var lift1 = liftConsole.applyTimeMachineTo(0,20);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_UP,lift1.getState());
		assert.equal(1,lift1.getNumOfPeopleIn());
		assert.equal(1,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,28);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_DOWN,lift1.getState());
		assert.equal(0,lift1.getNumOfPeopleIn());
		assert.equal(15,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,20);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_DOWN,lift1.getState());
		assert.equal(0,lift1.getNumOfPeopleIn());
		assert.equal(15,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,10);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_DOWN,lift1.getState());
		assert.equal(1,lift1.getNumOfPeopleIn());
		assert.equal(10,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,30);
		assert.equal(WAITING_DOOR_CLOSE_TO_GO_DOWN,lift1.getState());
		assert.equal(1,lift1.getNumOfPeopleIn());
		assert.equal(5,lift1.getCurrentFloor());

		var lift1 = liftConsole.applyTimeMachineTo(0,30);
		assert.equal(STOPPED,lift1.getState());
		assert.equal(0,lift1.getNumOfPeopleIn());
		assert.equal(1,lift1.getCurrentFloor());

	});	
});