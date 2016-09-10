var moment = require('moment');

// var peopleFromCsv = null;

module.exports = {

	from: function(config,done) {

		if (typeof config.csv !== 'undefined')
		{
			var fs = require('fs');
			var csv = require('csv');
			var that = this;

	    	var parser = csv.parse({delimiter: ','}, function(err,data) {
			  if ( err )
			  	done(err);

			  var people = [];
			  for(var i = 0; i<data.length; i++)
			  	people.push( that.createPerson({name:data[i][0],arrivalTime:data[i][1],targetFloor: parseInt(data[i][2])}) );
			  
			  done(null,people);
			});

	    	fs.createReadStream(config.csv).pipe(parser);
		}

	},

	createPerson: function(config) {

		return (function(name,arrivalTime,targetFloor){

			var mArrivalTime = moment(arrivalTime,"YYYY-MM-DD HH:mm:ss").unix();
			var leftLiftTime = null;
			var enterLiftTime = null;
			var callLiftTime = null;

			var mName = name;
			var mTargetFloor = targetFloor;
			var currentFloor = 1;


			var inLift = false;

			return {
				getArrivalTime: function() {
					return mArrivalTime;
				},
				getName: function() {
					return mName;
				},
				getTargetFloor: function() {
					return mTargetFloor;
				},
				isInLift: function() {
					return inLift;
				},
				callLift: function(time) {
					callLiftTime = time;
				},
				getCallLiftTime: function() {
					return callLiftTime;
				},
				leaveLift: function(time,floor) {
					leftLiftTime = time;
					currentFloor = floor;
					inLift = false;
				},
				isAtTargetFloor: function() {
					return ( mTargetFloor === currentFloor );
				},
				getLeaveLiftTime: function() {
					return leftLiftTime;
				},
				enterLift: function(time) {
					enterLiftTime = time;
					inLift = true;
				},
				getEnterLiftTime: function() {
					return enterLiftTime;
				}
			};

		})(config.name,config.arrivalTime,config.targetFloor);
	}
}