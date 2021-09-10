
export async function loadImage(source: string | URL): Promise<HTMLImageElement> {
    const img = new Image();
    return new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error(`Unable to load image '${source}'`));
        };
        img.src = source instanceof URL ? source.href : `assets/${source}`;
    });
}

export function drawImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement | HTMLCanvasElement, x = 0, y = 0,
        rotation = 0, scaleX = 1, scaleY = scaleX, relCenterX = 0.5, relCenterY = 0.5): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY ?? scaleX);
    ctx.rotate(rotation);
    ctx.drawImage(img, -((img as any).naturalWidth || img.width) * relCenterX, -((img as any).naturalHeight || img.height) * relCenterY);
    ctx.restore();
}

export function drawFrame(ctx: CanvasRenderingContext2D, img: HTMLImageElement, frame = 0, x = 0, y = 0,
        rotation = 0, scaleX = 1, scaleY = scaleX, relCenterX = 0.5, relCenterY = 0.5): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY ?? scaleX);
    ctx.rotate(rotation);
    const fx = frame % img.frameCountX, fy = Math.floor(frame / img.frameCountX);
    ctx.drawImage(img, fx * img.frameWidth, fy * img.frameHeight, img.frameWidth, img.frameHeight,
        -img.frameWidth * relCenterX, -img.frameHeight * relCenterY, img.frameWidth, img.frameHeight);
    ctx.restore();
}