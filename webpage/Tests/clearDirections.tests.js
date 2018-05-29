describe("clearDirections", function () {
    it("Grazina, ar isvalo zemelapio kelius", function () {
        var distanceDirections = "ChIJw5_XLIwY50YRWVgkXrce5Bk";
        var tmp = new clearr().clearDirections(distanceDirections);
        expect(tmp).toEqual(null);
    });
});