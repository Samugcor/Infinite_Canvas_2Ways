function DataDisplay ({data}) {
    return (
        <>
            Scale: {data.scale} <br />
            Offset X: {data.x} <br />
            Offset Y: {data.y} <br />
        </>
    );
}

export default DataDisplay