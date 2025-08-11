import { useEffect, useRef, useState } from 'react'
import './App.css'
import DataDisplay from './DataDisplay';

function App() {

  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);
  const viewPort1 = useRef({ x: 0, y:0 , scale: 1 });
  const viewPort2 = useRef({ x: 0, y:0 , scale: 1 });

  const [vT1Data, setVT1Data] = useState(viewPort1.current);
  const [vT2Data, setVT2Data] = useState(viewPort2.current);   

  let ctx1 = useRef(null);
  let ctx2 = useRef(null);

  const previousX = useRef(0);
  const previousY = useRef(0);  
  let dragging = useRef(false);

  /* 📑APUNTES
  * When your component is added to the DOM, React will run your setup function. 
  * After every re-render with changed dependencies, React will first run the cleanup function (if you provided it) 
  * with the old values, and then run your setup function with the new values. 
  * After your component is removed from the DOM, React will run your cleanup function. 
  * */
  useEffect(()=>{
    // los guardamos en variables porque el DOM ya no está disponible a la hora de desmontar los listeners
    const canvas1 = canvas1Ref.current;
    const canvas2 = canvas2Ref.current; 
    //Necesitamos que los canvas esten cargados en el DOM antes de pedir su contexto.
    ctx1.current = canvas1Ref.current.getContext('2d');
    ctx2.current = canvas2Ref.current.getContext('2d');
    
    //Tenemos que usar esta forma de listener porque los que usa react de normal son pasivos, y no nos dejan cancelar el comportamiento predeterminado.
    canvas1Ref.current.addEventListener("wheel", handleMouseWheel, {passive: false});
    canvas2Ref.current.addEventListener("wheel", handleMouseWheel, {passive: false});

    render1();
    render2(ctx2.current);

    //La función que limpia cuando se desmonta el componente, aquí deberemos eliminar los listeners que hayamos puesto para que no se dupliquen si se vuelve a montar el componente.
    return () => {
      canvas1.removeEventListener("wheel", handleMouseWheel, {passive: false});
      canvas2.removeEventListener("wheel", handleMouseWheel, {passive: false});
    };

  },[]);

  
  //Canvas methods
  const drawRectangle = (ctx, x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height)

  }
  const clearCanvas = (ctx)=>{
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  //Render

  //Method for Canvas1 that uses setTransform
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

  //Conversiones
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
  //const toVirtualHeight = () => {
  //  
  //}  
  //const toVirtualHeight = () => {
  //  
  //}

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

  //Eventos

  const handleMouseDown = (e) =>{
    dragging.current = true;
    previousX.current= e.clientX;      
    previousY.current= e.clientY;    

    console.log('mouse down on:', e.target.id, ' dragging =',dragging.current);

    e.target.addEventListener('mousemove', handleMouseMove);
  }

  const handleMouseUp = (e) =>{
    dragging.current = false;
    console.log('mouse release, dragging =', dragging.current);
  }

  const handleMouseMove = (e) =>{
    if (!dragging.current) return;

    if (e.target.id == 'canvas1') {
      updateVTPanning(e, viewPort1);
      render1();
      setVT1Data({...viewPort1.current});
    }

    if (e.target.id == 'canvas2') {
      //console.log("Vamos a actualizar el panning del viewport2")
      updateVTPanning(e, viewPort2);
      render2(ctx2.current);
      setVT2Data({...viewPort2.current});
    }
    
    console.log('mouse is moving')
  }

  const handleMouseWheel = (e) =>{
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.target.id == 'canvas1') {
        updateVTZooming(e, viewPort1,canvas1Ref.current);
        render1();
        setVT1Data({...viewPort1.current});
      }

      if (e.target.id == 'canvas2') {
        //console.log("Vamos a actualizar el panning del viewport2")
        updateVTZooming(e, viewPort2,canvas2Ref.current);
        render2(ctx2.current);
        setVT2Data({...viewPort2.current});
      }
    }

    //console.log(e);
  }

  return (
    <div className='container'>
      <div className='canvasHolder'>
        <h1>Canvas 1</h1>
        <DataDisplay data = {vT1Data}></DataDisplay>
        <canvas id='canvas1' ref={canvas1Ref} width={500} height={500} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} ></canvas>
      </div>
      <div className='canvasHolder'>
        <h1>Canvas 2</h1>
        <DataDisplay data = {vT2Data}></DataDisplay>
        <canvas id='canvas2' ref={canvas2Ref} width={500} height={500} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} ></canvas>
      </div>
    </div>
  )
}

export default App
