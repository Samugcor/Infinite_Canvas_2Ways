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
    //Necesitamos que los canvas esten cargados en el DOM antes de pedir su contexto.
    ctx1.current = canvas1Ref.current.getContext('2d');
    ctx2.current = canvas2Ref.current.getContext('2d'); 

    render1();
    render2(ctx2.current);

  },[]);

  
  

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

    clearCanvas(ctx);
    drawRectangle(ctx, toVirtualX(0), toVirtualY(0), 100, 100, 'red');
    drawRectangle(ctx, toVirtualX(200), toVirtualY(200), 100, 100, 'blue');
  }

  //Conversiones
  const toVirtualX = (x)=>{
    return (x + viewPort2.current.x) * viewPort2.current.scale;
  }
  const toVirtualY = (y)=>{
    return (y + viewPort2.current.y) * viewPort2.current.scale;
  }
  const toLocalX =(x) => {
    return x / viewPort2.current.scale - viewPort2.current.x;
  }
  const toLocalY =(y) => {
    return y / viewPort2.current.scale - viewPort2.current.y;
  }


  //Panning

  const updateVTPanning = (e, vt)=> {
    const localX = e.clientX;  
    const localY = e.clientY;    

    vt.current.x += localX - previousX.current;
    vt.current.y += localY - previousY.current;

    previousX.current = localX;
    previousY.current = localY;

    

    //console.log(vt);
    //console.log(vt.current);
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

  return (
    <div className='container'>
      <div className='canvasHolder'>
        <h1>Canvas 1</h1>
        <DataDisplay data = {vT1Data}></DataDisplay>
        <canvas id='canvas1' ref={canvas1Ref} width={500} height={500} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}></canvas>
      </div>
      <div className='canvasHolder'>
        <h1>Canvas 2</h1>
        <DataDisplay data = {vT2Data}></DataDisplay>
        <canvas id='canvas2' ref={canvas2Ref} width={500} height={500} onMouseDown={handleMouseDown}onMouseUp={handleMouseUp}></canvas>
      </div>
    </div>
  )
}

export default App
