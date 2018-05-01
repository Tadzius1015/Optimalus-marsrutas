// JavaScript source code
var map;
var fin;
var nodes = [];
var markers = [];
var durations = [];
var bestDuration;
var bestRoute = [];
var adresses = [];
var directionsDisplay = null;
var directionsService;
var polylinePath;
var prevNodes = [];

// Sukuriam google maps zemelapi
function initializeMap() {
    var opts = {
        center: new google.maps.LatLng(54.902434, 23.940171),
        zoom: 13,
        streetViewControl: false,
        mapTypeControl: false,
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), opts);
    // Vykdoma paspaudus and zemelapi
    google.maps.event.addListener(map, 'click', function (event) {

        // Prideda tiksla i zemelapi
        marker = new google.maps.Marker({ position: event.latLng, map: map });
        markers.push(marker);

        // Issisaugo lat ir lng
        nodes.push(event.latLng);
        // Padidina keliones tikslu kieki
        $('#destinations-count').html(nodes.length);
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
            //adresses = response.originAdresses;
            var origins = response.originAddresses;
            for (var i = 0; i < origins.length; i++) {
                if (origins[i] != undefined)
                    adresses[i] = origins[i];
            }
            var nodeDistanceData;
            for (originNodeIndex in response.rows) {
                nodeDistanceData = response.rows[originNodeIndex].elements;
                durations[originNodeIndex] = [];
                for (destinationNodeIndex in nodeDistanceData) {
                    durations[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].duration.value;
                }
            }
            gg();
        })
        .fail(function (status) {
            output3.innerHTML = "Ivyko klaida gaunant informacija is google maps";
        })
}
//Apskaiciuoja pateikto marsruto ilgi pagal eiles tvarka
function calcDistance(points) {
    var sum = 0;
    var prev = 0;
    points.splice(0, 1);
    for (var i = 0; i < points.length; i++) {
        var d = durations[prev][points[i]];
        prev = points[i];
        sum += d;
    }
    points.unshift(0);
    return sum;
}
//Randa trumpiausia is sugeneruotu marsrutu    
function findShortest(perm) {
    bestDuration = Infinity;
    var d;
    for (var i = 0; i < perm.length; i++) {
        d = calcDistance(perm[i]);
        if (d < bestDuration) {
            bestDuration = d;
            bestRoute = perm[i];
        }
    }
}

function printRoute() {
    outputDiv.innerHTML += adresses[0] + '<br>';
    for (var i = 0; i < bestRoute.length; i++) {
        outputDiv.innerHTML += adresses[bestRoute[i]] + '<br>';
    }
}
//Ekrane isspausdina
function showRoute() {
    outputDiv.textContent = "";
    output2.textContent = "";
    findDurations();
}
function gg() {
    if (nodes.length < 10) {
        var perm;
        var ind = Array.from(Array(nodes.length).keys());
        perm = generateCityRoutes(ind);
        t = true;
        findShortest(perm);
        printRoute();
        poly();
    }
    else {
        if (directionsDisplay != null) {
            directionsDisplay.setMap(null);
            directionsDisplay = null;
        }

        var pop = new ga.population();
        pop.initialize(nodes.length);
        var route = pop.getFittest().chromosome;
        ga.evolvePopulation(pop, function (update) {

            var route = update.population.getFittest().chromosome;
            var routeCoordinates = [];
            for (index in route) {
                routeCoordinates[index] = nodes[route[index]];
            }
        });
    }
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
    // Jeigu rodomas marsrutas, jį panaikina
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
    output2.textContent = "";
    output3.textContent = "";
    route = [];
    $('#destinations-count').html('0');
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
    var pems = generatePermutations(cities.slice(1));
    for (var i = 0; i < pems.length; i++) {
        pems[i].unshift(cities[0]);
        pems[i].push(cities[0]);
    }
    return pems;
}

//sukuria linijas marsrutui atvaizduoti
function poly() {
    var routeCoordinates = [];
    routeCoordinates[0] = nodes[0];
    for (var i = 0; i < bestRoute.length; i++) {
        routeCoordinates = nodes[bestRoute[i]];
    }
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    var waypts = [];
    for (var i = 0; i < bestRoute.length - 1; i++) {
        waypts.push({
            location: nodes[bestRoute[i]],
            stopover: true
        });
    }
    console.log(waypts.length);
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
google.maps.event.addDomListener(window, 'load', initializeMap);

// Genetinio algoritmo kodas
var ga = {
    // algoritmo konstantos
    "crossoverRate": 0.5,
    "mutationRate": 0.1,
    "populationSize": 10,
    "tournamentSize": 5,
    "elitism": true,
    "maxGenerations": 50,
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
            //population.mutate();
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
                    // Replicate individual
                    var eliteIndividual = new ga.individual(this.individuals[index].chromosomeLength);
                    eliteIndividual.setChromosome(this.individuals[index].chromosome.slice());
                    newPopulation.addIndividual(eliteIndividual);
                } else {
                    // Parenka su kuo maisys
                    var parent = this.tournamentSelection();
                    // Ir pritaiko kryzminima
                    //this.individuals[index].crossover(parent, newPopulation);
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
            for (var i = 0; i < this.individuals.length; i++) {
                var randomIndex = Math.floor(Math.random() * this.individuals.length);
                var tempIndividual = this.individuals[randomIndex];
                this.individuals[randomIndex] = this.individuals[i];
                this.individuals[i] = tempIndividual;
            }
            console.log("tournament:");
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
            console.log(fittestIndex);
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
            for (var i = 0; i < this.chromosomeLength - 1; i++) {
                this.chromosome.push(i + 1);

            }
            for (var i = 0; i < this.chromosomeLength - 1; i++) {
                var randomIndex = Math.floor(Math.random() * (this.chromosome.length - 1));
                var tempNode = this.chromosome[randomIndex];
                this.chromosome[randomIndex] = this.chromosome[i];
                this.chromosome[i] = tempNode;
            }
            this.chromosome.unshift(0);
            this.chromosome.push(0);
        };

        // Nustato individo chromosomas (marsruto eiliskuma)
        this.setChromosome = function (chromosome) {
            this.chromosome = chromosome;
        };

        // Mutuoja individa
        this.mutate = function () {
            this.fitness = null;
            this.chromosome.splice(this.chromosomeLength - 1, 1);
            this.chromosome.shift();

            // Daromi atsitiktiniai pakeitimai
            for (index in this.chromosome) {
                if (ga.mutationRate > Math.random()) {
                    var randomIndex = Math.floor(Math.random() * this.chromosomeLength - 1);
                    var tempNode = this.chromosome[randomIndex];
                    this.chromosome[randomIndex] = this.chromosome[index];
                    this.chromosome[index] = tempNode;
                }
            }
            this.chromosome.unshift(0);
            this.chromosome.push(0);
        };

        // Apskaiciuojamas individo tinkamumas
        this.calcFitness = function () {
            if (this.fitness != null) {
                return this.fitness;
            }

            var totalDistance = calcDistance(this.chromosome);
            this.fitness = 1 / totalDistance;
            console.log(totalDistance);
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