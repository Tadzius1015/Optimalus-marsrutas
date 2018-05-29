var map;
var nodes = [];
var markers = [];
var durations = [];
var distances = [];
var bestDuration;
var bestRoute = [];
var adresses = [];
var distancesLength = [];
var directionsDisplay = null;
var directionsService;
var polylinePath;
var myLocation = false;
var travelType = null;

    // Sukuriam google maps zemelapi
function initializeMap() {
    var opts = {
        center: new google.maps.LatLng(54.902434, 23.940171),
        zoom: 13,
        streetViewControl: false,
        mapTypeId: 'roadmap'
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), opts);
    // Vykdoma paspaudus and zemelapi
    google.maps.event.addListener(map, 'click', function(event) {

        // Prideda tiksla i zemelapi
        marker = new google.maps.Marker({ position: event.latLng, map: map });
    markers.push(marker);

        // Issisaugo lat ir lng
        nodes.push(event.latLng);
        // Padidina keliones tikslu kieki
        $('#destinations-count').html(nodes.length);
    });

    // Prideda mygtuka kuris i marsruta itraukia dabartine vartotojo vieta
    var myLocationDiv = document.createElement('div');
    new getMyLocation(myLocationDiv, map);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(myLocationDiv);

    function getMyLocation(myLocationDiv, map) {
        var myLocationBtn = document.createElement('button');
        myLocationBtn.innerHTML = 'Mano buvimo vieta';
        myLocationBtn.className = 'large-btn';
        myLocationBtn.style.margin = '5px';
        myLocationBtn.style.opacity = '0.95';
        myLocationBtn.style.borderRadius = '3px';
        myLocationDiv.appendChild(myLocationBtn);

        google.maps.event.addDomListener(myLocationBtn, 'click', function () {
        navigator.geolocation.getCurrentPosition(function (success) {
            if (!myLocation) {
                var pos = {
                    lat: success.coords.latitude,
                    lng: success.coords.longitude
                };
                nodes.push(pos);
                $('#destinations-count').html(nodes.length);
                // Prideda tiksla i zemelapi
                marker = new google.maps.Marker({ position: pos, map: map });
                markers.push(marker);
                map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));
                map.setZoom(13);
                myLocation = true;
            }
            else {
                window.alert("Buvimo vieta jau paþymëta!");
            }
        });
    });
    }
}
    // Pridedamas paieðkos laukas
function initAutocomplete() {

    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        places.forEach(function (place) {

        marker = new google.maps.Marker({ position: place.geometry.location, map: map });
    markers.push(marker);
            nodes.push(place.geometry.location);
            $('#destinations-count').html(nodes.length);
        });
        document.getElementById('pac-input').value = '';
    });
}

// Gauna keliones laikus ir atstumus tarp tikslu
function getDurations(origin, destination) {
    var service = new google.maps.DistanceMatrixService();
    var d = $.Deferred();
    service.getDistanceMatrix({
        origins: origin,
        destinations: destination,
        travelMode: 'DRIVING',
    },
    function (response, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
        d.reject(status);
    } else {
        d.resolve(response);
    }
    });
    return d.promise();
}
function findDurations() {
        getDurations(nodes, nodes)
            .done(function (response) {
                var origins = response.originAddresses;
                for (var i = 0; i < origins.length; i++) {
                    if (origins[i] != undefined)
                        adresses[i] = origins[i];
                }
                var nodeDistanceData;
                for (originNodeIndex in response.rows) {
                    nodeDistanceData = response.rows[originNodeIndex].elements;
                    durations[originNodeIndex] = [];
                    distances[originNodeIndex] = [];
                    for (destinationNodeIndex in nodeDistanceData) {
                        durations[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].duration.value;
                        distances[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].distance.value;
                    }
                }
                gg(adresses);
            })
            .fail(function (status) {
                output3.innerHTML = "Ivyko klaida gaunant informacija is google maps ";
            })
    }

    //Apskaiciuoja pateikto marsruto ilgi pagal eiles tvarka
    function calcDistance(points) {
    var sum = 0;
    var prev = 0;
    for (var i = 0; i < points.length; i++) {
        var d = distances[prev][points[i]];
        prev = points[i];
        sum += d;
    }
    //points.unshift(0);
    return sum;
}
function Distance(points) {
    var prev = 0;
    if (travelType == "GR") {
        points.unshift(0);
    points.push(0);
    }
    else if (travelType == "NGR") {
        points.unshift(0);
    points.push(nodes.length - 1);
    }
    for (var i = 1; i < points.length; i++) {
        distancesLength[i] = distances[prev][points[i]];
    prev = points[i];
    }
}
//Apskaiciuoja pateikto marsruto laika pagal eiles tvarka
function calcDuration(points) {
    var sum = 0;
    var prev = 0;
    //points.splice(0, 1);
    for (var i = 1; i < points.length; i++) //!!!!!!!!!!!!!!!! i=0 buvo
    {
        var d = durations[prev][points[i]];
        prev = points[i];
        sum += d;
    }
    //points.unshift(0);
    return sum;
}
//Randa trumpiausia is sugeneruotu marsrutu
function findShortest(perm) {
        bestDuration = Infinity;
    var d;
    for (var i = 0; i < perm.length; i++) {
        d = calcDuration(perm[i]);
    if (d < bestDuration) {
        bestDuration = d;
    bestRoute = perm[i];
        }
    }
    return bestRoute;
}

//Ekrane isspausdina
function showRoute() {
        outputDiv.textContent = "";
    travelType = $('#travel-type').val();
    findDurations();
}

function addTable(address, best) {
    var table = document.getElementById("myTable");
    console.log("Length in table"+best.length);
    for (var i = 0; i < best.length; i++) {
        console.log(best[i]);
    var newRow = table.insertRow(table.length);
        var ceil1 = newRow.insertCell(0);
        var ceil2 = newRow.insertCell(1);
        var ceil3 = newRow.insertCell(2);

        ceil1.innerHTML = i + 1;
        ceil2.innerHTML = adresses[best[i]];
        if (i == 0) {
        ceil3.innerHTML = "0";
    }
        else {
        ceil3.innerHTML = (distancesLength[i] / 1000).toFixed(1) + "km";
    }
    }
}
function gg(adress) {
    if (nodes.length < 8) {
        var perm;
        var ind = Array.from(Array(nodes.length).keys());
        perm = generateCityRoutes(ind);
        t = true;
        var best = findShortest(perm);
        poly(best);
        Distance(best);
        addTable(adress, best);
    }
    else {
        if (directionsDisplay != null) {
        directionsDisplay.setMap(null);
    directionsDisplay = null;
        }

        var pop = new ga.population();
        if (travelType == "GR")
            pop.initialize(nodes.length - 1);
        else if (travelType == "NGR")
            pop.initialize(nodes.length - 2);
        var best = pop.getFittest().chromosome.slice();
        ga.evolvePopulation(pop, function (update) {

    }, function (result) {
        // Get route
        route = result.population.getFittest().chromosome;
    if (travelType == "GR") {
        route.unshift(0);
    route.push(0);
            }
            else if (travelType == "NGR") {
        route.unshift(0);
    route.push(nodes.length - 1);
            }
            // Add route to map
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer();
            directionsDisplay.setMap(map);
            var waypts = [];
            for (var i = 1; i < route.length-1; i++) {
        waypts.push({
            location: nodes[route[i]],
            stopover: true
        });
    }
            var destination;
            if (travelType == "GR") {
        destination = nodes[route[0]];
    }
            else if (travelType == "NGR") {
        destination = nodes[route[route.length - 1]];
    }
            // Add final route to map
            var request = {
        origin: nodes[route[0]],
                destination: destination,
                waypoints: waypts,
                travelMode: 'DRIVING',
            };
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
    }
                clearMapMarkers();
            });

            });
        Distance(best);
        addTable(adress, best);
    }
    bestDuration = calcDuration(best);
    bestDistance = calcDistance(best);
    var temp = bestDuration / 60;
    outputDiv.innerHTML += "" + '<br>';
    outputDiv.innerHTML += "Apytikslis keliones laikas: " + Math.floor(temp) + " min "+ ((temp.toFixed(2)-Math.floor(temp))*60).toFixed(0) + " s" + '<br>';
    outputDiv.innerHTML += "Apytikslis keliones atstumas: " + (bestDistance / 1000).toFixed(1) + " km" + '<br>';
    }


    //sukuria linijas marsrutui atvaizduoti
    function poly(best) {
                    directionsService = new google.maps.DirectionsService();
                directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);
        var waypts = [];
        if (travelType == "GR") {
            for (var i = 1; i < best.length-1; i++) {
                    waypts.push({
                        location: nodes[best[i]],
                        stopover: true
                    });
                }
            // Pridedamas marsrutas i zemelapi
            var request = {
                    origin: nodes[0],
                destination: nodes[0],
                waypoints: waypts,
                travelMode: 'DRIVING',
            };
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
                clearMapMarkers();
            });
        }
        else if (travelType == "NGR") {
            for (var i = 1; i < best.length-1; i++) {
                    waypts.push({
                        location: nodes[best[i]],
                        stopover: true
                    });
                }
            // Pridedamas marsrutas i zemelapi
            var request = {
                    origin: nodes[0],
                destination: nodes[nodes.length - 1],
                waypoints: waypts,
                travelMode: 'DRIVING',
            };
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
                clearMapMarkers();
            });
        }
        best.shift();
        best.splice(best.length - 1, 1);
    }
    // Panaikina zymeklius ir kelius
    function clearMapMarkers() {
        for (index in markers) {
                    markers[index].setMap(null);
                }
        nodes = [];
        if (polylinePath != undefined) {
                    polylinePath.setMap(null);
                }
        markers = [];
    }
    // Panaikina marsrutus, jei rodomi
    function clearDirections() {
        // Jeigu rodomas marsrutas, já panaikina
        if (directionsDisplay != null) {
                    directionsDisplay.setMap(null);
                directionsDisplay = null;
        }
    }
    // Isvalo zemelapi
    function clearMap() {
                    clearMapMarkers();
                clearDirections();
        outputDiv.textContent = "";
        route = [];
        bestDuration = Infinity;
        bestRoute = [];
        adresses = [];
        myLocation = false;
        $('#destinations-count').html('0');
        $('#myTable').find("tr:not(:first)").remove();
    }
    //Generuoja galimus aibes isdestymo variantus
    function generatePermutations(Arr) {
        var permutations = [];
        var A = Arr.slice();

        function swap(a, b) {
            var tmp = A[a];
            A[a] = A[b];
            A[b] = tmp;
        }

        function generate(n, A) {
            if (n == 1) {
                    permutations.push(A.slice());
                } else {
                for (var i = 0; i <= n - 1; i++) {
                    generate(n - 1, A);
                swap(n % 2 === 0 ? i : 0, n - 1);
                }
            }
        }
        generate(A.length, A);
        return permutations;
    }
    //Generuoja visus marsrutus, kuriuos galima sudaryti is aibes
    function generateCityRoutes(cities) {
        var pems = null;
        if (travelType == "GR")
            pems = generatePermutations(cities.slice(1));
        else if (travelType == "NGR")
            pems = generatePermutations(cities.slice(1, cities.length - 1));
        for (var i = 0; i < pems.length; i++) {
                    pems[i].unshift(cities[0]);
                if (travelType == "GR") {
                    pems[i].push(cities[0]);
                }
            else if (travelType == "NGR") {
                    pems[i].push(cities[cities.length - 1]);
                }
        }
        return pems;
    }

    google.maps.event.addDomListener(window, 'load', initializeMap);
    google.maps.event.addDomListener(window, 'load', initAutocomplete);


    // Genetinio algoritmo kodas
    var ga = {
                    // algoritmo konstantos
                    "crossoverRate": 0.5,
        "mutationRate": 0.1,
        "populationSize": 50,
        "tournamentSize": 5,
        "elitism": true,
        "maxGenerations": 100,
        "tickerSpeed": 60,

        // Evoliucionuoja populiacija
        "evolvePopulation": function (population, generationCallBack, completeCallBack) {
            var generation = 1;
            var evolveInterval = setInterval(function () {
                if (generationCallBack != undefined) {
                    generationCallBack({
                        population: population,
                        generation: generation,
                    });
                }
                population = population.crossover();
                population.mutate();
                generation++;

                // Tikrina ar praejo pakankamai kartu
                if (generation > ga.maxGenerations) {
                    clearInterval(evolveInterval);

                if (completeCallBack != undefined) {
                    completeCallBack({
                        population: population,
                        generation: generation,
                    });
                }
                }
            }, ga.tickerSpeed);
        },
        // Populiacijos klase
        "population": function () {
                    // Populiacija - individu masyvas
                    this.individuals = [];

                // Pradine populiacija su atsitiktiniais individais
                this.initialize = function (chromosomeLength) {
                    this.individuals = [];

                for (var i = 0; i < ga.populationSize; i++) {
                    var newIndividual = new ga.individual(chromosomeLength);
                    newIndividual.initialize();
                    this.individuals.push(newIndividual);
                }
            };

            // Mutuoja populiacija
            this.mutate = function () {
                var fittestIndex = this.getFittestIndex();
                for (index in this.individuals) {
                    // Nemutuoti geriausio individo
                    if (ga.elitism != true || index != fittestIndex) {
                    this.individuals[index].mutate();
                }
                }
            };
            // Pritaiko kryzminima ir grazina nauja karta
            this.crossover = function () {
                // nauja karta
                var newPopulation = new ga.population();

                var fittestIndex = this.getFittestIndex();
                for (index in this.individuals) {
                    // Paima geriausia individa ir prideda ji i nauja karta
                    if (ga.elitism == true && index == fittestIndex) {
                        var eliteIndividual = new ga.individual(this.individuals[index].chromosomeLength);
                        eliteIndividual.setChromosome(this.individuals[index].chromosome.slice());
                        newPopulation.addIndividual(eliteIndividual);
                    } else {
                        // Parenka su kuo maisys
                        var parent = this.tournamentSelection();
                        // Ir pritaiko kryzminima
                        this.individuals[index].crossover(parent, newPopulation);
                    }
                }

                return newPopulation;
            };
            // Prideda individa i populiacija
            this.addIndividual = function (individual) {
                    this.individuals.push(individual);
                };
            // Isrenka individa naudojant turnyro selekcija
            this.tournamentSelection = function () {
                for (var i = 0; i < this.individuals.length - 1; i++) {
                    var randomIndex = Math.floor(Math.random() * this.individuals.length);
                    var tempIndividual = this.individuals[randomIndex];
                    this.individuals[randomIndex] = this.individuals[i];
                    this.individuals[i] = tempIndividual;
                }
                var tournamentPopulation = new ga.population();
                for (var i = 0; i < ga.tournamentSize; i++) {

                    tournamentPopulation.addIndividual(this.individuals[i]);
                }
                var fittest = tournamentPopulation.getFittest();
                return fittest;
            };

            // Grazina geriausio individo indeksa populiacijoje
            this.getFittestIndex = function () {
                var fittestIndex = 0;
                for (var i = 1; i < this.individuals.length; i++) {
                    if (this.individuals[i].calcFitness() > this.individuals[fittestIndex].calcFitness()) {
                    fittestIndex = i;
                }
                }
                return fittestIndex;
            };
            this.getFittest = function () {
                return this.individuals[this.getFittestIndex()];
            };
        },
        // Individo klase
        "individual": function (chromosomeLength) {
                    this.chromosomeLength = chromosomeLength;
                this.fitness = null;
            this.chromosome = [];
            // Sukuriamas atsitiktinis individas(marsrutas)
            this.initialize = function () {
                    this.chromosome = [];
                for (var i = 0; i < this.chromosomeLength; i++) {
                    this.chromosome.push(i + 1);

                }
                for (var i = 0; i < this.chromosomeLength; i++) {
                    var randomIndex = Math.floor(Math.random() * (this.chromosome.length));
                    var tempNode = this.chromosome[randomIndex];
                    this.chromosome[randomIndex] = this.chromosome[i];
                    this.chromosome[i] = tempNode;
                }
            };

            // Nustato individo chromosomas (marsruto eiliskuma)
            this.setChromosome = function (chromosome) {
                    this.chromosome = chromosome;
                };

            // Mutuoja individa
            this.mutate = function () {
                    this.fitness = null;
                // Daromi atsitiktiniai pakeitimai
                for (index in this.chromosome) {
                    if (ga.mutationRate > Math.random()) {
                        var randomIndex = Math.floor(Math.random() * this.chromosomeLength);
                        var tempNode = this.chromosome[randomIndex];
                        this.chromosome[randomIndex] = this.chromosome[index];
                        this.chromosome[index] = tempNode;
                    }
                }

            };

            // Grazina individo keliones trukme
            this.getDistance = function () {
                var totalDistance = 0;
                if (travelType == "GR") {
                    this.chromosome.unshift(0);
                this.chromosome.push(0);
                }
                else if(travelType == "NGR"){
                    this.chromosome.unshift(0);
                this.chromosome.push(this.chromosome.length);
                }
                for (var index = 0; index < this.chromosome.length-1 ; index++) {
                    var startNode = this.chromosome[index];
                    var endNode = this.chromosome[0];
                    if ((parseInt(index)+1) < (this.chromosome.length)) {
                    endNode = this.chromosome[(parseInt(index) + 1)];
                }
                    totalDistance += durations[startNode][endNode];
                }
                totalDistance += durations[startNode][endNode];
                this.chromosome.shift();
                this.chromosome.splice(this.chromosome.length - 1, 1);
                return totalDistance;
            };
            // Apskaiciuojamas individo tinkamumas
            this.calcFitness = function () {
                if (this.fitness != null) {
                    return this.fitness;
                }

                var totalDistance = this.getDistance();
                this.fitness = 1 / totalDistance;
                return this.fitness;
            };
            //Pritaiko kryzminima individui ir nurodytam partneriui ir rezultatus sudeda i nauja populiacija
            this.crossover = function (individual, offspringPopulation) {
                var offspringChromosome = [];
                // Atsitiktinai atrenkama ka prideti i nauja populiacija
                var startPos = Math.floor(this.chromosome.length * Math.random());
                var endPos = Math.floor(this.chromosome.length * Math.random());
                var i = startPos;
                while (i != endPos) {
                    offspringChromosome[i] = individual.chromosome[i];
                i++
                    if (i >= this.chromosome.length) {
                    i = 0;
                }
                }
                // Pridedama likusi informacija
                for (parentIndex in individual.chromosome) {
                    var node = individual.chromosome[parentIndex];
                    var nodeFound = false;
                    for (offspringIndex in offspringChromosome) {
                        if (offspringChromosome[offspringIndex] == node) {
                    nodeFound = true;
                break;
                        }
                    }
                    if (nodeFound == false) {
                        for (var offspringIndex = 0; offspringIndex < individual.chromosome.length; offspringIndex++) {
                            if (offspringChromosome[offspringIndex] == undefined) {
                    offspringChromosome[offspringIndex] = node;
                break;
                            }
                        }
                    }
                }
                // Naujam individui pridedamos atrinktos chromosomos ir jis pridedamas prie naujos populiacijos 
                var offspring = new ga.individual(this.chromosomeLength);
                offspring.setChromosome(offspringChromosome);
                offspringPopulation.addIndividual(offspring);
            };
        },
    };