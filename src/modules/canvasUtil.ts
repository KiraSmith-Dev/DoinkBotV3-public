import { NodeCanvasRenderingContext2D } from 'canvas';

export function trimTransparency(ctx: NodeCanvasRenderingContext2D) {
    const imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    //imgData.data
    const min = { x: -1, y: -1 };
    const max = { x: -1, y: -1 };
    for (let y = 0; y < ctx.canvas.height; y++) {
        for (let x = 0; x < ctx.canvas.width; x++) {
            let RGBAindex = (y * ctx.canvas.width + x) * 4;
            if ((imgData.data[RGBAindex+3] ?? 0) <= 0)
                continue;
            
            min.x = (x < min.x || min.x == -1) ? x : min.x;
            min.y = (y < min.y || min.y == -1) ? y : min.y;
            
            max.x = (x > max.x || max.x == -1) ? x : max.x;
            max.y = (y > max.y || max.y == -1) ? y : max.y;
        }
    }
    
    let data = ctx.getImageData(min.x, min.y, max.x - min.x, max.y - min.y);
    ctx.canvas.width = max.x - min.x;
    ctx.canvas.height = max.y - min.y;
    ctx.putImageData(data, 0, 0);
}
