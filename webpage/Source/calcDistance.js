var calc =  function(){
    function calcDistance(points, distances) {
        if (distances == null)
            return null;
        else if(distances[0] == undefined || distances[0][0] == undefined){
            return null;
        }
        var sum = 0;
        var prev = 0;
        for (var i = 0; i < points.length; i++) {
            var d = distances[prev][points[i]];
            prev = points[i];
            sum += d;
        }
        return sum;
    }
    return { calcDistance: calcDistance };
}