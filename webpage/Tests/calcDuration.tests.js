var durations = [
   [0, 200, 359, 477, 488, 613],
    [221, 0, 159, 277, 367, 580],
    [468, 292, 0, 196, 469, 681],
    [505, 392, 232, 0, 274, 487],
    [533, 517, 468, 246, 0, 515],
    [284, 353, 415, 481, 422, 0],
];
describe("calcDuration", function () {
    it("Grazina apvaziavimo sekos bendrai uztrunkama laika", function () {
        var points = [0, 2, 4, 1, 3, 5];
        var norm = new calc2().calcDuration(points, durations);
        expect(norm).toEqual(2109);
    });
    it("Reaguoja i tai, kad points paduodamas tuscias", function () {
        var points = [];
        var norm = new calc2().calcDuration(points, durations);
        expect(norm).toEqual(0);
    });
    it("Atmeta, kai laiku matrica lygu null", function () {
        var points = [0, 2, 4, 1, 3, 5];
        var dist = null;
        var norm = new calc2().calcDuration(points, dist);
        expect(norm).toEqual(null);
    });
    it("Atmeta, kai laiku matrica aprasyta, bet neuzpildyta", function () {
        var points = [0, 2, 4, 1, 3, 5];
        var dist = [[], []];
        var norm = new calc2().calcDuration(points, dist);
        expect(norm).toEqual(null);
    });
});
