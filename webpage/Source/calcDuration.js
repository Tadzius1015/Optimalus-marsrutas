var calc2 =  function(){
    function calcDuration(points, durations) {
        if (durations == null)
            return null;
        else if(durations[0] == undefined || durations[0][0] == undefined){
            return null;
        }
        var sum = 0;
        var prev = 0;
        for (var i = 0; i < points.length; i++) {
            var d = durations[prev][points[i]];
            prev = points[i];
            sum += d;
        }
        return sum;
    }
    return { calcDuration: calcDuration };
}