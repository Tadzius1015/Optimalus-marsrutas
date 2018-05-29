var ans = [
    [0, 1, 2, 3, 0],
    [0, 2, 1, 3, 0],
    [0, 3, 1, 2, 0],
    [0, 1, 3, 2, 0],
    [0, 2, 3, 1, 0],
    [0, 3, 2, 1, 0],
];
var ans2 = [
    [0, 1, 2, 3],
    [0, 2, 1, 3],
];
describe("generateCityRoutes", function () {
    it("Generuojami visos galimos apvaziavimo sekos, kai griztama i pradzia", function () {
        var norm = gen().generateCityRoutes([0,1,2,3],"GR");
        expect(norm).toEqual(ans);
    });
    it("Generuojami visos galimos apvaziavimo sekos, kai vaziuojama i paskutini pazymeta", function () {
        var norm = gen().generateCityRoutes([0, 1, 2, 3], "NGR");
        expect(norm).toEqual(ans2);
    });
});
