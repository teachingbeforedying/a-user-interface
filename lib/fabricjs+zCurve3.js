fabric.Curve3 = fabric.util.createClass(fabric.Object, {
    type: 'curve3',
    initialize: function (arr_point) {
        logger.log("logFabric+Curve3", "initialize", arr_point);

        this.arr_point = arr_point;
        
        // this.canvas.renderAll();
    },
    _render: function (ctx_in) {
        logger.log("logFabric+Curve3", "_render", ctx_in);

        const arr_x_y_x_y = this.arr_point.reduce((acc,point) => {
            acc.push(point.x);
            acc.push(point.y);
            return acc;
        }, []);
        
        const rgbaColor__stroke = new fabric.Color(this.stroke).toRgba();

        function myRender(ctx) {

            //set width
            ctx.lineWidth = 3;
            // ctx.lineWidth = 2;

            //set color
            ctx.strokeStyle = rgbaColor__stroke;
    
            //bugfix: prevent canvas border being drawn
            ctx.beginPath();      
            ctx.closePath();

            //draw curve
            // ctx.moveTo(arr_x_y_x_y[0], arr_x_y_x_y[1]);     // optionally move to first point
            // ctx.curve(arr_x_y_x_y);                      // add cardinal spline to path                     
            // ctx.stroke();     
    
            //draw zCurve
            ctx.moveTo(arr_x_y_x_y[0], arr_x_y_x_y[1]);     // optionally move to first point
            ctx.zCurve(arr_x_y_x_y);                         
        }

        //raster render         //SHU: it seems that this 'raster effect' is because this context is kinda copy/pasted
        const ctx__top = ctx_in; 
        myRender(ctx__top);

        //vector render
        const ctx__container = this.canvas.contextContainer;
        myRender(ctx__container);
        
    },
});