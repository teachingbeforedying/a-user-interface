/*
Based on:
https://stackoverflow.com/questions/11075505/get-all-points-within-a-triangle

public IEnumerable<Point> PointsInTriangle(Point pt1, Point pt2, Point pt3)
{
    if (pt1.Y == pt2.Y && pt1.Y == pt3.Y)
    {
        throw new ArgumentException("The given points must form a triangle.");
    }

    Point tmp;

    if (pt2.X < pt1.X)
    {
        tmp = pt1;
        pt1 = pt2;
        pt2 = tmp;
    }

    if (pt3.X < pt2.X)
    {
        tmp = pt2;
        pt2 = pt3;
        pt3 = tmp;

        if (pt2.X < pt1.X)
        {
            tmp = pt1;
            pt1 = pt2;
            pt2 = tmp;
        }
    }

    var baseFunc = CreateFunc(pt1, pt3);
    var line1Func = pt1.X == pt2.X ? (x => pt2.Y) : CreateFunc(pt1, pt2);

    for (var x = pt1.X; x < pt2.X; x++)
    {
        int maxY;
        int minY = GetRange(line1Func(x), baseFunc(x), out maxY);

        for (var y = minY; y <= maxY; y++)
        {
            yield return new Point(x, y);
        }
    }

    var line2Func = pt2.X == pt3.X ? (x => pt2.Y) : CreateFunc(pt2, pt3);

    for (var x = pt2.X; x <= pt3.X; x++)
    {
        int maxY;
        int minY = GetRange(line2Func(x), baseFunc(x), out maxY);

        for (var y = minY; y <= maxY; y++)
        {
            yield return new Point(x, y);
        }
    }
}

private int GetRange(double y1, double y2, out int maxY)
{
    if (y1 < y2)
    {
        maxY = (int)Math.Floor(y2);
        return (int)Math.Ceiling(y1);
    }

    maxY = (int)Math.Floor(y1);
    return (int)Math.Ceiling(y2);
}

private Func<int, double> CreateFunc(Point pt1, Point pt2)
{
    var y0 = pt1.Y;

    if (y0 == pt2.Y)
    {
        return x => y0;
    }

    var m = (double)(pt2.Y - y0) / (pt2.X - pt1.X);

    return x => m * (x - pt1.X) + y0;
}
*/

class Rasterize {

    static _createKeyForPoint(point) {
        const arr = [
            "x", ...point.x.d, point.x.e, point.x.s,
            "y", ...point.y.d, point.y.e, point.y.s,
          ];
          const str__point = arr.toString(); 
          return str__point;
    }

    static pointsForParallelogram(dict_point) {
        const arr_point__triangle1 = [dict_point.tl, dict_point.tr, dict_point.br];
        const arr_point__triangle2 = [dict_point.br, dict_point.bl, dict_point.tl];

        const arr_point__forParallelogram__with_duplicates = [
            ...this.pointsForTriangle(arr_point__triangle1),
            ...this.pointsForTriangle(arr_point__triangle2),
        ];

        const dict_point__forParallelogram = arr_point__forParallelogram__with_duplicates.reduce((acc, point) => {
            const key__point = this._createKeyForPoint(point);
            if(!acc[key__point]) {
                acc[key__point] = point;
            }
            return acc;
        }, {});

        const arr_point__forParallelogram__without_duplicates = Object.values(dict_point__forParallelogram);
        return arr_point__forParallelogram__without_duplicates;
    }


    static pointsForTriangle(arr_point__triangle) {
        // logger.log("logRasterize", "pointsForTriangle", "arr_point__triangle:", arr_point__triangle);
        var outArr = [];

        const zero = new Decimal(0);
        const one  = new Decimal(1);

        // if (pt1.Y == pt2.Y && pt1.Y == pt3.Y)
        // {
        //     throw new ArgumentException("The given points must form a triangle.");
        // }

        //sort(.x, ascending)
        const [pt1,pt2,pt3] = arr_point__triangle.toSorted((point1, point2) => {
            var outNumber;

            const dX = Decimal.sub(point1.x , point2.x);
            
            if(dX.lessThan(zero)) {
                outNumber = -1;
            } 
            else if(dX.greaterThan(zero)) {
                outNumber = +1;
            } 
            else {
                outNumber = 0;
            }

            return outNumber;
        });
    
        const func__base = this._createFunc(pt1, pt3);

        //get points "between" line1(pt1,pt2) and base(pt1,pt3)
        {
            var func__line1;
            if((pt1.x).equals(pt2.x)) {
                func__line1 = (function(x) {
                    return pt2.y;
                });
            } else {
                func__line1 = this._createFunc(pt1, pt2);
            }

            var x = pt1.x;
            while(Decimal.sub(x , pt2.x).lessThan(zero)) {
                const [minY, maxY] = this._getRange(func__line1(x), func__base(x));
                var y = minY;
                while(Decimal.sub(y , maxY).lessThan(zero)) {
                    const point = {x:x,y:y};
                    outArr.push(point);
                    y = Decimal.add(y, one);
                }
                x = Decimal.add(x, one);
            }
        }

        //get points "between" line1(pt2,pt3) and base(pt1,pt3)
        {
            var func__line2;
            if((pt2.x).equals(pt3.x)) {
                func__line2 = (function(x) {
                    return pt2.y;
                });
            } else {
                func__line2 = this._createFunc(pt2, pt3);
            }

            var x = pt2.x;
            while(Decimal.sub(x , pt3.x).lessThan(zero)) {
                const [minY, maxY] = this._getRange(func__line2(x), func__base(x));
                var y = minY;
                while(Decimal.sub(y , maxY).lessThan(zero)) {
                    const point = {x:x,y:y};
                    outArr.push(point);
                    y = Decimal.add(y, one);
                }
                x = Decimal.add(x, one);
            }
        }

        return outArr;
    }

    static _getRange(y1, y2) {
        var outArr;

        var minY,maxY;
        if (y1.lessThan(y2))
        {
            minY = y1;
            maxY = y2;
        } else {
            minY = y2;
            maxY = y1;
        }

        // outArr = [
        //     Decimal.ceil(minY), 
        //     Decimal.floor(maxY),
        // ];

        //i want it all
        outArr = [
            Decimal.floor(minY), 
            Decimal.ceil(maxY),
        ];

        return outArr;
    }

    static _createFunc(pt1, pt2) {
        var outFunc;

        if((pt2.y).equals(pt1.y))
        {
            const y = pt1.y;
            outFunc = (function(x) {
                return y
            });
        } else {
            const m = Decimal.div( Decimal.sub(pt2.y, pt1.y) , Decimal.sub(pt2.x, pt1.x) );
    
            outFunc = (function(x) {
                return Decimal.add( Decimal.mul( m , Decimal.sub(x , pt1.x) ) , pt1.y );
            });
        }
    
        return outFunc;
    }






    //https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon

    static pointIsInPoly(p, polygon) {
        var isInside = false;
        var minX = polygon[0].x, maxX = polygon[0].x;
        var minY = polygon[0].y, maxY = polygon[0].y;
        for (var n = 1; n < polygon.length; n++) {
            var q = polygon[n];
            minX = Math.min(q.x, minX);
            maxX = Math.max(q.x, maxX);
            minY = Math.min(q.y, minY);
            maxY = Math.max(q.y, maxY);
        }
    
        if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
            return false;
        }
    
        var i = 0, j = polygon.length - 1;
        for (i, j; i < polygon.length; j = i++) {
            if ( (polygon[i].y > p.y) != (polygon[j].y > p.y) &&
                    p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x ) {
                isInside = !isInside;
            }
        }
    
        return isInside;
    }

    /** Get relationship between a point and a polygon using ray-casting algorithm
     * @param {{x:number, y:number}} P: point to check
     * @param {{x:number, y:number}[]} polygon: the polygon
     * @returns -1: outside, 0: on edge, 1: inside
     */
    static relationPP(P, polygon) {
        const between = (p, a, b) => p >= a && p <= b || p <= a && p >= b
        let inside = false
        for (let i = polygon.length-1, j = 0; j < polygon.length; i = j, j++) {
            const A = polygon[i]
            const B = polygon[j]
            // corner cases
            if (P.x == A.x && P.y == A.y || P.x == B.x && P.y == B.y) return 0
            if (A.y == B.y && P.y == A.y && between(P.x, A.x, B.x)) return 0

            if (between(P.y, A.y, B.y)) { // if P inside the vertical range
                // filter out "ray pass vertex" problem by treating the line a little lower
                if (P.y == A.y && B.y >= A.y || P.y == B.y && A.y >= B.y) continue
                // calc cross product `PA X PB`, P lays on left side of AB if c > 0 
                const c = (A.x - P.x) * (B.y - P.y) - (B.x - P.x) * (A.y - P.y)
                if (c == 0) return 0
                if ((A.y < B.y) == (c > 0)) inside = !inside
            }
        }

        return inside? 1 : -1
    }

}