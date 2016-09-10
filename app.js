var acmeInc				= require('./vendor/AcmeInc.js');
var buildingFactory		= require('./vendor/BuildingFactory.js');
var peopleFactory		= require('./vendor/PeopleFactory.js');

peopleFactory.from({csv:__dirname+'/vendor/assets/elevadores.csv'},function(err,people){
	var lift1 = acmeInc.createLift({id:1,maxPassangers:8,speedByFloor:2,timeDoorsOpened:20});
	var lift2 = acmeInc.createLift({id:2,maxPassangers:8,speedByFloor:2,timeDoorsOpened:20});
	var lift3 = acmeInc.createLift({id:3,maxPassangers:8,speedByFloor:2,timeDoorsOpened:20});
	var lift4 = acmeInc.createLift({id:4,maxPassangers:8,speedByFloor:2,timeDoorsOpened:20});

	var eCorpBuilding = buildingFactory.createBuilding({numOfFloors:26});

	eCorpBuilding.addLift(lift1);
	eCorpBuilding.addLift(lift2);
	eCorpBuilding.addLift(lift3);
	eCorpBuilding.addLift(lift4);

	//enter all people in
	for (var i=0; i < people.length; i++)
	{
		eCorpBuilding.callLiftFor(people[i]);
	};

	eCorpBuilding.increaseTimeForecast( people[people.length-1].getArrivalTime() + 100000);

	console.log('Last floor lift1: ', lift1.getCurrentFloor());
	console.log('Last floor lift2: ', lift2.getCurrentFloor());
	console.log('Last floor lift3: ', lift3.getCurrentFloor());
	console.log('Last floor lift4: ', lift4.getCurrentFloor());

	var unhappyCounter = 0;
	var lockedPeople = 0;
	var neverEntered = 0;
	var sumOfSecondsToTarget = 0;
	for (var i=0; i < people.length; i++)
	{
		if (people[i].getEnterLiftTime() === null)
			neverEntered++;

		if ( people[i].isInLift() )
				lockedPeople++;

		if (!people[i].isAtTargetFloor())
		{
			unhappyCounter++;
		}
		else
		{
			sumOfSecondsToTarget+=(people[i].getLeaveLiftTime() - people[i].getArrivalTime());
		}
	}

	console.log('queue: ',eCorpBuilding.getQueue().length);
	console.log('total neverEntered: ',neverEntered);
	console.log('total lockedPeople: ',lockedPeople);
	console.log('total unhappy: ',unhappyCounter);
});