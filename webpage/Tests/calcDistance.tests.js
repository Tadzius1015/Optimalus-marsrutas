
var distances = [
   [0, 778, 2026, 1815, 1110, 676],
   [778, 0, 623, 1593, 888, 710],
   [1398, 620, 0, 961, 1055, 1446],
   [1815, 1634, 1875, 0, 748, 1138],
   [1406, 1226, 1466, 756, 0, 730],
   [676, 710, 1349, 1138, 433, 0]
];
describe("calcDistance", function () {
    it("Grazina apvaziavimo sekos bendra atsuma", function () {
        var points = [0, 2, 4, 1, 3, 5];
        var norm = new calc().calcDistance(points,distances);
        expect(norm).toEqual(7038);
    });
    it("Reaguoja i tai, kad points paduodamas tuscias", function () {
        var points = [];
        var norm = new calc().calcDistance(points, distances);
        expect(norm).toEqual(0);
    });
    it("Atmeta, kai atstumu matrica lygu null", function () {
        var points = [0, 2, 4, 1, 3, 5];
        var dist = null;
        var norm = new calc().calcDistance(points, dist);
        expect(norm).toEqual(null);
    });
    it("Atmeta, kai atstumu matrica aprasyta, bet neuzpildyta", function () {
        var points = [0, 2, 4, 1, 3, 5];
        var dist = [[],[]];
        var norm = new calc().calcDistance(points, dist);
        expect(norm).toEqual(null);
    });
});

