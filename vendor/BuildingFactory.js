var shuffle = require('shuffle-array')

var queue = [];

module.exports = {

	createBuilding: function(config) {

		var building = (function(){

			var mNumOfFloors = 25; //default
			var mNumOfPeopleIn = 0;
			var mLifts = [];

			var lastLiftRequestTime = null;

			return {

				addLift: function(lift) {
					mLifts.push(lift);
				},
				setNumOfFloors: function(numOfFloors) {
					mNumOfFloors = numOfFloors;
				},
				getNumOfFloors: function() {
					return mNumOfFloors;
				},
				getNumOfPeopleIn: function() {
					return mNumOfPeopleIn;
				},
				incNumOfPeopleIn: function() {
					mNumOfPeopleIn++;
				},

				increaseTimeForecast: function(time) {
					for(var i=0;i<mLifts.length;i++)
						mLifts[i].updateToThisTime(time);

					console.log("lift ("+mLifts[0].getId()+") cFloor("+mLifts[0].getCurrentFloor()+") mumOfPeopleIn("+mLifts[0].getPeopleIn().length+") "+mLifts[0].getTargetFloors() + " state: " + mLifts[0].debugState() );
					console.log("lift ("+mLifts[1].getId()+") cFloor("+mLifts[1].getCurrentFloor()+") mumOfPeopleIn("+mLifts[1].getPeopleIn().length+") "+mLifts[1].getTargetFloors() + " state: " + mLifts[1].debugState() );
					console.log("lift ("+mLifts[2].getId()+") cFloor("+mLifts[2].getCurrentFloor()+") mumOfPeopleIn("+mLifts[2].getPeopleIn().length+") "+mLifts[2].getTargetFloors() + " state: " + mLifts[2].debugState() );
					console.log("lift ("+mLifts[3].getId()+") cFloor("+mLifts[3].getCurrentFloor()+") mumOfPeopleIn("+mLifts[3].getPeopleIn().length+") "+mLifts[3].getTargetFloors() + " state: " + mLifts[3].debugState() );
				},

				getQueue: function( ) {
					return queue;
				},

				callLiftFor: function(person) {
					var lobby = 1;
					var scoreHash = {};

					for(var i=0;i<mLifts.length;i++)
					{
						mLifts[i].updateToThisTime(person.getArrivalTime());
						var tempScore = mLifts[i].getFloorScore(lobby,person.getTargetFloor(),mNumOfFloors);
						if (typeof scoreHash[tempScore] === 'undefined')
							scoreHash[tempScore] = [];
						scoreHash[tempScore].push(i);
					}

					var descOrderedScores = Object.keys(scoreHash).sort(function(a,b){return b-a});
					var sameScoreLiftIdx;
					var numOfCrowded = 0;

					loop1:
					for ( var i = 0; i < descOrderedScores.length; i++ )
					{
						sameScoreLiftIdx = scoreHash[ descOrderedScores[i] ];
						// shuffle( sameScoreLiftIdx ); //in place
						loop2:
						for ( var j = 0; j < sameScoreLiftIdx.length; j++ )
						{
							if ( !mLifts[ sameScoreLiftIdx[j] ].addPersonInto(lobby,person) )
								numOfCrowded++;
							else
							{
									break loop1;
							}
						}		
					}

					if (numOfCrowded === 4)
						queue.push(person);


					console.log("lift ("+mLifts[0].getId()+") cFloor("+mLifts[0].getCurrentFloor()+") mumOfPeopleIn("+mLifts[0].getPeopleIn().length+") "+mLifts[0].getTargetFloors() + " state: " + mLifts[0].debugState() );
					console.log("lift ("+mLifts[1].getId()+") cFloor("+mLifts[1].getCurrentFloor()+") mumOfPeopleIn("+mLifts[1].getPeopleIn().length+") "+mLifts[1].getTargetFloors() + " state: " + mLifts[1].debugState() );
					console.log("lift ("+mLifts[2].getId()+") cFloor("+mLifts[2].getCurrentFloor()+") mumOfPeopleIn("+mLifts[2].getPeopleIn().length+") "+mLifts[2].getTargetFloors() + " state: " + mLifts[2].debugState() );
					console.log("lift ("+mLifts[3].getId()+") cFloor("+mLifts[3].getCurrentFloor()+") mumOfPeopleIn("+mLifts[3].getPeopleIn().length+") "+mLifts[3].getTargetFloors() + " state: " + mLifts[3].debugState() );
					console.log('-----');
				}
			};

		})();

		if (typeof config !== 'undefined' && typeof config.numOfFloors !== 'undefined')
			building.setNumOfFloors = config.numOfFloors;

		return building;
	}

}