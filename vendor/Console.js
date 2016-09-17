var UP = 2;
var DOWN = 3;
var TOWARDS = 4;
var OPPOSITE = 5;

module.exports = {	
	createLiftBrain: function(config) {
		var brain = (function(){

			var mLifts			= [];
			var mTimeMachine 	= null;
			var secondsByFloor 	= 2;
			var timeDoorsOpened = 20;
			var numOfFloors 	= 26;

			//private scope
			var getScore = function(lift,callObj) {
				var from = callObj.from;
				var to = callObj.to;
				var liftCurrentFloor = lift.getCurrentFloor();
				var liftTargetFloor = lift.getTargetFloor();
				var distance	  	= Math.abs(liftCurrentFloor-from); // from 0 to N-1

				if ( lift.isStopped() )
					return (numOfFloors+1)-distance;

				var callDirection 	= (from < to)? UP:DOWN;
				var liftDirection	= (lift.isMovingUp())?UP:DOWN;


				var liftMovementRelatedToCall;

				if (liftDirection === UP)
				{
					if (liftCurrentFloor<from)
						liftMovementRelatedToCall = TOWARDS;
					else if (liftCurrentFloor>from)
						liftMovementRelatedToCall = OPPOSITE;
					else
					{
						if ( callDirection === UP )
							liftMovementRelatedToCall = TOWARDS;
						else
							liftMovementRelatedToCall = OPPOSITE;
					}
				}
				else
				{
					if (liftCurrentFloor>from)
						liftMovementRelatedToCall = TOWARDS;
					else if (liftCurrentFloor<from)
						liftMovementRelatedToCall = OPPOSITE;
					else
					{
						if ( callDirection === DOWN )
							liftMovementRelatedToCall = TOWARDS;
						else
							liftMovementRelatedToCall = OPPOSITE;
					}
				}

				if ( liftDirection === callDirection && liftMovementRelatedToCall === TOWARDS )
					return (numOfFloors+2)-distance;
				else if ( liftDirection !== callDirection && liftMovementRelatedToCall === TOWARDS )
					return (numOfFloors+1)-distance;
				else if (liftMovementRelatedToCall === OPPOSITE)
					return 1;
			};

			return {

				initLifts: function(numOfLifts) {
					for(var i = 0; i < numOfLifts; i++)
					{
						var lift = liftFactory.createLift({id:i+1,maxPassangers:8});
						mLifts.push(lift);
					}
				},

				addLift: function(lift) {
					mLifts.push(lift);
				},

				getLifts: function() {
					return mLifts;
				},

				plugTimeMachine: function(timeMachine) {
					mTimeMachine = timeMachine;
				},

				callBestLift: function(intent) {
					var liftToAnswer = this.getBestLiftToAnswer(intent);
					liftToAnswer.call( intent );
				},

				getLiftScore: function(lift,callObj) {
					return getScore(lift,callObj);
				},

				getBestLiftToAnswer: function(callObj) {
					var scoreHash = this.getBestLiftScoreHash(callObj);
					var descOrderedScores = Object.keys(scoreHash).sort(function(a,b){return b-a});
					var bestLift = null;
					loop1:
					for ( var i = 0; i < descOrderedScores.length; i++ )
					{
						sameScoreLiftIdx = scoreHash[ descOrderedScores[i] ];
						for ( var j = 0; j < sameScoreLiftIdx.length; j++ )
						{
							if ( !mLifts[ sameScoreLiftIdx[j] ].isFullyLoaded() )
							{
								bestLift = mLifts[ sameScoreLiftIdx[j] ];
								break loop1;	
							}
						}
					}

					//shuffle between best scores

					return ( bestLift !== null )? bestLift: mLifts[ scoreHash[descOrderedScores[0]][0] ];
				},
				getBestLiftScoreHash: function(callObj) {
					var scoreHash = {};
					for(var i=0;i<mLifts.length;i++)
					{
						var tempScore = getScore(mLifts[i],callObj);
						if (typeof scoreHash[tempScore] === 'undefined')
							scoreHash[tempScore] = [];
						scoreHash[tempScore].push(i);
					}
					return scoreHash;
				},
				applyTimeMachine: function(bySeconds) {
					for(var i = 0; i < mLifts[i].length; i++) {
						mTimeMachine.run(mLifts[i],bySeconds,secondsByFloor);
					}
				},
				applyTimeMachineTo: function(liftIdx,bySeconds) {
					return mTimeMachine.run(mLifts[liftIdx],bySeconds,secondsByFloor);
				}
			};

		})();

		if ( typeof config !== 'undefined' && typeof config.numOfFloors !== 'undefined' )
			lift.setNumOfFloors(config.numOfFloors);

		if ( typeof config !== 'undefined' && typeof config.timeDoorsOpened !== 'undefined' )
			lift.setTimeDoorsOppened(config.timeDoorsOpened);

		if ( typeof config !== 'undefined' && typeof config.secondsByFloor !== 'undefined' )
			lift.setSecondsByFloor(config.secondsByFloor);

		return brain;
	}
}