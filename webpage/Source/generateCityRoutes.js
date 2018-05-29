var gen = function () {
    function generateCityRoutes(cities,travelType) {
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
    return { generateCityRoutes: generateCityRoutes };
}

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