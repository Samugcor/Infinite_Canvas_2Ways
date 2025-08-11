This is an exercise comparing two ways of creating an __"infinite canvas"__ which are really common on drawing an whiteboard apps. These apps simulate an infinite amount of space and the ability to zoom and pann by using math to update the coordinates of the canvas content.

We have used as reference these two articles:
- https://harrisonmilbradt.com/blog/canvas-panning-and-zooming

- https://www.sandromaglione.com/articles/infinite-canvas-html-with-zoom-and-panhttps://www.sandromaglione.com/articles/infinite-canvas-html-with-zoom-and-pan

<br>

___
# Comparing the two methods

The first of the two articles uses the `setTransform()` method of `CanvasRenderingContext2D`, while the second one relays on manual mapping. Both methods are completely valid, but there is a big differences we must take in to account:

## Who manages the transformation?

**With `setTransform()`:**

- The canvas manages the transformation.
- You must **reverse-engineer** inputs and offsets if necessary.
- You depend on the **canvas state** for rendering behavior.

**With manual mapping:**

- You manage the transformation.
- You have the necessary math to:
	- draw elements
	- convert mouse input (in order to know if the mouse is clicking on canvas element)
	- position UI elements such as tooltips or submenus

<br>
<br>

___
# The interesting bits

We took this exercise as an opportunity to also get acquainted with `Reac`, but this could be done with simple `html` and `js`.

We created two canvas and **two objects to represent their viewPorts**:
```jsx
 const viewPort1 = useRef({ x: 0, y:0 , scale: 1 });
 const viewPort2 = useRef({ x: 0, y:0 , scale: 1 });
```

We also used two different **render functions**:
```jsx
const render1 = () =>{
    const vt = viewPort1.current;

    ctx1.current.setTransform(1, 0, 0, 1, 0, 0);
    clearCanvas(ctx1.current);
    ctx1.current.setTransform(vt.scale, 0, 0, vt.scale, vt.x, vt.y);
    drawRectangle(ctx1.current, 0, 0, 100, 100, 'red');
    drawRectangle(ctx1.current, 200, 200, 100, 100, 'blue');

  }

  const render2 = (ctx) =>{
    const vt = viewPort2.current;
    
    clearCanvas(ctx);
    drawRectangle(ctx, toVirtualX(0), toVirtualY(0), 100 * vt.scale, 100 * vt.scale, 'red');
    drawRectangle(ctx, toVirtualX(200), toVirtualY(200), 100 * vt.scale, 100 * vt.scale, 'blue');

  }
```

For the manual mapping we created **helping methods to convert the values**:
```jsx
const toVirtualX = (x)=>{
    return x * viewPort2.current.scale + viewPort2.current.x;
  }

  const toVirtualY = (y)=>{
    return y * viewPort2.current.scale + viewPort2.current.y;
  }

  const toLocalX =(x) => {
    return x / viewPort2.current.scale - viewPort2.current.x;
  }

  const toLocalY =(y) => {
    return y / viewPort2.current.scale - viewPort2.current.y;
  }
```

The **panning** and **zooming** methods are the same for both cases:
```jsx
//Panning
  const updateVTPanning = (e, vt)=> {
    const localX = e.clientX;  
    const localY = e.clientY;    

    vt.current.x += localX - previousX.current;
    vt.current.y += localY - previousY.current;

    previousX.current = localX;
    previousY.current = localY;

  }

  //Zooming
  const updateVTZooming = (e, vt, canvas) =>{
    const rect = canvas.getBoundingClientRect();
    const localX = e.clientX - rect.left;  
    const localY = e.clientY - rect.top;

    const newScale = vt.current.scale * (Math.exp(-e.deltaY * 0.001));
    const newX = localX - (localX - vt.current.x) * (newScale / vt.current.scale);
    const newY = localY - (localY - vt.current.y) * (newScale / vt.current.scale);

    vt.current.x = newX;
    vt.current.y = newY;
    vt.current.scale = newScale;
  }
```

## Problems found and what to do about them

We found some problems or areas of improvement along the way, mainly regarding the zoom functionality. This are things that can be easily overlooked but will have an effect in the quality of the user experience.

### Zoom centered in cursor

If we follow the example in the firs article we may find that the **zoom doesn't occur centered on the cursor**. In the original zoom function, the event coordinates were used to position the mouse, `e.clientX` and `e.clientY`, but these coordinates correspond to the entire screen. However, if our canvas is smaller than the screen or located at coordinates other than the window's start coordinates, the window coordinates (the ones given by the event) will not correspond to the canvas coordinates.

To correctly calculate the mouse position within the canvas, we'll use `getBoundingClientRect()`, which returns (among other things):

- left: distance from the left edge of the window to the left edge of the element.
- top: distance from the top edge of the window to the top edge of the element.
- width and height: size of the canvas element.

This way, we can subtract the value of `left` from `e.clientX` and the value of `top` from `e.clientY` to obtain the canvas coordinates.

### Inconsistent Zoom / Chunky Zoom

I have seen many places that present a zoom method that will result in a zoom out that isn't progressive at all compared to the zoom in. This is due to the formula used to calculate the scale:

```js
const newScale = viewPort.scale + e.deltaY * -0.01;
```

Let's use fewer decimal places to make it simpler. Let's say that for each mouse tick we subtract `0.1`. If our zoom level is `5`, by moving back one mouse tick we will have subtracted 1/5 of the zoom level, but if the zoom level is `2` we will have moved back 1/2, half the zoom level.

With the new formula, what we do is increase in percentages, so that the increase is always proportional. If the zoom is `5` with a mouse tick we will decrease for example by 5%, which is `-0.25`, and if the zoom is `2` we will also decrease by 5%, but in this case it will be `-0.02`.

```js
const newScale = vt.current.scale * (Math.exp(-e.deltaY * 0.001));
```
