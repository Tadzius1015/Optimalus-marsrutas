var clearr = function ()
{
    function clearDirections(directionsDisplay) {
        // Jeigu rodomas marsrutas, jÅEpanaikina        
        if (directionsDisplay != null) {
           // directionsDisplay.setMap(null);
            directionsDisplay = null;
        }
        return directionsDisplay;
    }
    return { clearDirections: clearDirections };
}