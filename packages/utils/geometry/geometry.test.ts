import {
  lineIntersectsLine,
  lineRotate,
  pointInEllipse,
  pointInPolygon,
  pointLeftofLine,
  pointOnCurve,
  pointOnEllipse,
  pointOnLine,
  pointOnPolygon,
  pointOnPolyline,
  pointRightofLine,
  pointRotate,
  polygonBounds,
  polygonReflectX,
  polygonReflectXBranches,
  polygonReflectY,
  polygonReflectYBranches,
  polygonInPolygon,
  polygonInPolygonBranches
} from "./geometry";
import type { Curve, Ellipse, Line, Point, Polygon, Polyline } from "./shape";
import { geometryBranches } from "../../excalidraw/utils";

describe("point and line", () => {
  const line: Line = [
    [1, 0],
    [1, 2],
  ];

  it("point on left or right of line", () => {
    expect(pointLeftofLine([0, 1], line)).toBe(true);
    expect(pointLeftofLine([1, 1], line)).toBe(false);
    expect(pointLeftofLine([2, 1], line)).toBe(false);

    expect(pointRightofLine([0, 1], line)).toBe(false);
    expect(pointRightofLine([1, 1], line)).toBe(false);
    expect(pointRightofLine([2, 1], line)).toBe(true);
  });

  it("point on the line", () => {
    expect(pointOnLine([0, 1], line)).toBe(false);
    expect(pointOnLine([1, 1], line, 0)).toBe(true);
    expect(pointOnLine([2, 1], line)).toBe(false);
  });
});

describe("point and polylines", () => {
  const polyline: Polyline = [
    [
      [1, 0],
      [1, 2],
    ],
    [
      [1, 2],
      [2, 2],
    ],
    [
      [2, 2],
      [2, 1],
    ],
    [
      [2, 1],
      [3, 1],
    ],
  ];

  it("point on the line", () => {
    expect(pointOnPolyline([1, 0], polyline)).toBe(true);
    expect(pointOnPolyline([1, 2], polyline)).toBe(true);
    expect(pointOnPolyline([2, 2], polyline)).toBe(true);
    expect(pointOnPolyline([2, 1], polyline)).toBe(true);
    expect(pointOnPolyline([3, 1], polyline)).toBe(true);

    expect(pointOnPolyline([1, 1], polyline)).toBe(true);
    expect(pointOnPolyline([2, 1.5], polyline)).toBe(true);
    expect(pointOnPolyline([2.5, 1], polyline)).toBe(true);

    expect(pointOnPolyline([0, 1], polyline)).toBe(false);
    expect(pointOnPolyline([2.1, 1.5], polyline)).toBe(false);
  });

  it("point on the line with rotation", () => {
    const truePoints = [
      [1, 0],
      [1, 2],
      [2, 2],
      [2, 1],
      [3, 1],
    ] as Point[];

    truePoints.forEach((point) => {
      const rotation = Math.random() * 360;
      const rotatedPoint = pointRotate(point, rotation);
      const rotatedPolyline: Polyline = polyline.map((line) =>
        lineRotate(line, rotation, [0, 0]),
      );
      expect(pointOnPolyline(rotatedPoint, rotatedPolyline)).toBe(true);
    });

    const falsePoints = [
      [0, 1],
      [2.1, 1.5],
    ] as Point[];

    falsePoints.forEach((point) => {
      const rotation = Math.random() * 360;
      const rotatedPoint = pointRotate(point, rotation);
      const rotatedPolyline: Polyline = polyline.map((line) =>
        lineRotate(line, rotation, [0, 0]),
      );
      expect(pointOnPolyline(rotatedPoint, rotatedPolyline)).toBe(false);
    });
  });
});

describe("point and polygon", () => {
  const polygon: Polygon = [
    [10, 10],
    [50, 10],
    [50, 50],
    [10, 50],
  ];

  it("point on polygon", () => {
    expect(pointOnPolygon([30, 10], polygon)).toBe(true);
    expect(pointOnPolygon([50, 30], polygon)).toBe(true);
    expect(pointOnPolygon([30, 50], polygon)).toBe(true);
    expect(pointOnPolygon([10, 30], polygon)).toBe(true);
    expect(pointOnPolygon([30, 30], polygon)).toBe(false);
    expect(pointOnPolygon([30, 70], polygon)).toBe(false);
  });

  it("point in polygon", () => {
    const polygon: Polygon = [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ];
    expect(pointInPolygon([1, 1], polygon)).toBe(true);
    expect(pointInPolygon([3, 3], polygon)).toBe(false);
  });
});

describe("point and curve", () => {
  const curve: Curve = [
    [1.4, 1.65],
    [1.9, 7.9],
    [5.9, 1.65],
    [6.44, 4.84],
  ];

  it("point on curve", () => {
    expect(pointOnCurve(curve[0], curve)).toBe(true);
    expect(pointOnCurve(curve[3], curve)).toBe(true);

    expect(pointOnCurve([2, 4], curve, 0.1)).toBe(true);
    expect(pointOnCurve([4, 4.4], curve, 0.1)).toBe(true);
    expect(pointOnCurve([5.6, 3.85], curve, 0.1)).toBe(true);

    expect(pointOnCurve([5.6, 4], curve, 0.1)).toBe(false);
    expect(pointOnCurve(curve[1], curve, 0.1)).toBe(false);
    expect(pointOnCurve(curve[2], curve, 0.1)).toBe(false);
  });
});

describe("point and ellipse", () => {
  const ellipse: Ellipse = {
    center: [0, 0],
    angle: 0,
    halfWidth: 2,
    halfHeight: 1,
  };

  it("point on ellipse", () => {
    [
      [0, 1],
      [0, -1],
      [2, 0],
      [-2, 0],
    ].forEach((point) => {
      expect(pointOnEllipse(point as Point, ellipse)).toBe(true);
    });
    expect(pointOnEllipse([-1.4, 0.7], ellipse, 0.1)).toBe(true);
    expect(pointOnEllipse([-1.4, 0.71], ellipse, 0.01)).toBe(true);

    expect(pointOnEllipse([1.4, 0.7], ellipse, 0.1)).toBe(true);
    expect(pointOnEllipse([1.4, 0.71], ellipse, 0.01)).toBe(true);

    expect(pointOnEllipse([1, -0.86], ellipse, 0.1)).toBe(true);
    expect(pointOnEllipse([1, -0.86], ellipse, 0.01)).toBe(true);

    expect(pointOnEllipse([-1, -0.86], ellipse, 0.1)).toBe(true);
    expect(pointOnEllipse([-1, -0.86], ellipse, 0.01)).toBe(true);

    expect(pointOnEllipse([-1, 0.8], ellipse)).toBe(false);
    expect(pointOnEllipse([1, -0.8], ellipse)).toBe(false);
  });

  it("point in ellipse", () => {
    [
      [0, 1],
      [0, -1],
      [2, 0],
      [-2, 0],
    ].forEach((point) => {
      expect(pointInEllipse(point as Point, ellipse)).toBe(true);
    });

    expect(pointInEllipse([-1, 0.8], ellipse)).toBe(true);
    expect(pointInEllipse([1, -0.8], ellipse)).toBe(true);

    expect(pointInEllipse([-1, 1], ellipse)).toBe(false);
    expect(pointInEllipse([-1.4, 0.8], ellipse)).toBe(false);
  });
});

describe("line and line", () => {
  const lineA: Line = [
    [1, 4],
    [3, 4],
  ];
  const lineB: Line = [
    [2, 1],
    [2, 7],
  ];
  const lineC: Line = [
    [1, 8],
    [3, 8],
  ];
  const lineD: Line = [
    [1, 8],
    [3, 8],
  ];
  const lineE: Line = [
    [1, 9],
    [3, 9],
  ];
  const lineF: Line = [
    [1, 2],
    [3, 4],
  ];
  const lineG: Line = [
    [0, 1],
    [2, 3],
  ];

  it("intersection", () => {
    expect(lineIntersectsLine(lineA, lineB)).toBe(true);
    expect(lineIntersectsLine(lineA, lineC)).toBe(false);
    expect(lineIntersectsLine(lineB, lineC)).toBe(false);
    expect(lineIntersectsLine(lineC, lineD)).toBe(true);
    expect(lineIntersectsLine(lineE, lineD)).toBe(false);
    expect(lineIntersectsLine(lineF, lineG)).toBe(true);
  });
});

describe("polygon in polygon", () => {

  it("dummy test", () => {
    expect(0).toBe(0);
  });

  it("detects vertex outside polygon", () => {

    const poly1 : Polygon = [
      [-4.5, 0.5],
      [-4.5, 3.5],
      [-7.5, 3.5],
      [-7.5, 0.5]
    ]
    const poly2 : Polygon = [
      [-6, 0],
      [-4, 2],
      [-4, 4],
      [-8, 4],
      [-8, 0]
    ]
    
    expect(polygonInPolygon(poly1, poly2)).toBe(false);
  });

  it("detects line intersection in polygon", () => {
    const poly1 : Polygon = [
      [3.5, 0.5],
      [3.5, 2],
      [0.5, 2],
      [0.5, 0.5]
    ]
    const poly2 : Polygon = [
      [2, 1],
      [4, 0],
      [4, 3],
      [0, 3],
      [0, 0]
    ]

    expect(polygonInPolygon(poly1, poly2)).toBe(false);

  });

  it("detects enclosed polygon", () => {
    const poly1 : Polygon = [
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 1]
    ]
    const poly2 : Polygon = [
      [0, 0],
      [0, 3],
      [3, 3],
      [3, 0]
    ]

    expect(polygonInPolygon(poly1, poly2)).toBe(true);



  });



  afterAll(() => {

    const totalBranches = Object.keys(polygonInPolygonBranches).length;
    const trueBranches = Object.values(polygonInPolygonBranches).filter(branch => {
      return branch === true;
    }).length;
    const branchPercent = (trueBranches / totalBranches) * 100;

    console.log('Branch coverage of polygonInPolygon: ', polygonInPolygonBranches);
    console.log(`Coverage: ${trueBranches} of ${totalBranches} (${branchPercent.toFixed(2)})%`);

  });


});

describe("polygon bounds checking", () => {
  const testBounds = (poly: Polygon, expectedRes: [Point, Point]) => {
    expect(polygonBounds(poly)).toEqual(expectedRes);
  }

  it("should return full space for empty polygon", () => {
    testBounds([], [
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ]);
  });

  it("should return correctly for single point", () => {
    testBounds([[1, -1]], [
      [1, -1],
      [1, -1],
    ]);
  });

  it("should return correct for basic quadrilateral", () => {
    const poly: Polygon = [
      [1, 3],
      [3, 5],
      [6, 8],
      [0, -1],
    ];

    const expected: [Point, Point] = [
      [0, -1],
      [6, 8],
    ];

    testBounds(poly, expected);
  });

  it("should not explode with weird values", () => {
    const poly: Polygon = [
      [1, 3],
      [null, 5],
      [6, null],
      [NaN, -Infinity],
    ];

    const expected: [Point, Point] = [
      [1, 3],
      [1, 3],
    ];

    testBounds(poly, expected);
  });

  it("should work with huge polygon", () => {
    // create a 100001-agon with clear bounds of [0, 0] - [100000, 1000000]
    const poly: Polygon = [...Array(100001)].map((_, i) => [i, i * 10]);;

    const expected: [Point, Point] = [
      [0, 0],
      [100000, 1000000]
    ];

    testBounds(poly, expected);
  });
});

describe("polygon reflection of x coordinate", () => {

  it("dummy test", () => {
    expect(0).toBe(0);
  });

  it("Reflection factor 0 leaves polygon unchanged", () => {

    const reflectionFactor = 0;
    const polygon : Polygon = [
      [0, 0],
      [2, 0],
      [3, 1],
      [2, 2],
      [0, 2]
    ];
    const expectedResult : Polygon = [
      [0, 0],
      [2, 0],
      [3, 1],
      [2, 2],
      [0, 2]
    ];

    expect(polygonReflectX(polygon, reflectionFactor)).toEqual(expectedResult);
  });

  it("Reflection factor 1 reflects polygon fully", () => {

    const reflectionFactor = 1;
    const polygon : Polygon = [
      [0, 0],
      [2, 0],
      [3, 1],
      [2, 2],
      [0, 2]
    ];
    const expectedResult : Polygon = [
      [3, 0],
      [1, 0],
      [0, 1],
      [1, 2],
      [3, 2]
    ];

    expect(polygonReflectX(polygon, reflectionFactor)).toEqual(expectedResult);

  });

  it("Reflection factor 0.5 collapses polygon", () => {

    const reflectionFactor = 0.5;
    const polygon : Polygon = [
      [0, 0],
      [2, 0],
      [3, 1],
      [2, 2],
      [0, 2]
    ];
    const expectedResult : Polygon = [
      [1.5, 0],
      [1.5, 0],
      [1.5, 1],
      [1.5, 2],
      [1.5, 2]
    ];

    expect(polygonReflectX(polygon, reflectionFactor)).toEqual(expectedResult);

  });

  afterAll(() => {


    const totalBranches = Object.keys(polygonReflectXBranches).length;
    const trueBranches = Object.values(polygonReflectXBranches).filter(branch => {
      return branch === true;
    }).length;
    const branchPercent = (trueBranches / totalBranches) * 100;

    console.log('Branch coverage of polygonReflectX: ', polygonReflectXBranches);
    console.log(`Coverage: ${trueBranches} of ${totalBranches} (${branchPercent.toFixed(2)})%`);

  });

});

describe("polygon reflection in y coordinate", () => {

  it("dummy test", () => {
    expect(0).toBe(0);
  });

  it("Reflection factor 0 leaves polygon unchanged", () => {

    const reflectionFactor = 0;
    const polygon : Polygon = [
      [0, 0],
      [0, 2],
      [1, 3],
      [2, 2],
      [2, 0]
    ];
    const expectedResult : Polygon = [
      [0, 0],
      [0, 2],
      [1, 3],
      [2, 2],
      [2, 0]
    ];

    expect(polygonReflectY(polygon, reflectionFactor)).toEqual(expectedResult);
  });

  it("Reflection factor 1 reflects polygon fully", () => {

    const reflectionFactor = 1;
    const polygon : Polygon = [
      [0, 0],
      [0, 2],
      [1, 3],
      [2, 2],
      [2, 0]
    ];
    const expectedResult : Polygon = [
      [0, 3],
      [0, 1],
      [1, 0],
      [2, 1],
      [2, 3]
    ];

    expect(polygonReflectY(polygon, reflectionFactor)).toEqual(expectedResult);

  });

  it("Reflection factor 0.5 collapses polygon", () => {

    const reflectionFactor = 0.5;
    const polygon : Polygon = [
      [0, 0],
      [0, 2],
      [1, 3],
      [2, 2],
      [2, 0]
    ];
    const expectedResult : Polygon = [
      [0, 1.5],
      [0, 1.5],
      [1, 1.5],
      [2, 1.5],
      [2, 1.5]
    ];

    expect(polygonReflectY(polygon, reflectionFactor)).toEqual(expectedResult);

  });

  afterAll(() => {

    const totalBranches = Object.keys(polygonReflectYBranches).length;
    const trueBranches = Object.values(polygonReflectYBranches).filter(branch => {
      return branch === true;
    }).length;
    const branchPercent = (trueBranches / totalBranches) * 100;

    console.log('Branch coverage of polygonReflectY: ', polygonReflectYBranches);
    console.log(`Coverage: ${trueBranches} of ${totalBranches} (${branchPercent.toFixed(2)})%`);

  });

});

afterAll(() => {
  const branchCount = Object.keys(geometryBranches).length;
  const takenBranchCount = Object.values(geometryBranches).filter(branch => branch).length;
  const branchPercent = (takenBranchCount / branchCount) * 100;

  console.log('Branches taken for geometry.ts (polygonBounds): ', geometryBranches);
  console.log(`\nBranch percentage: ${branchPercent.toFixed(2)}%`);
});
