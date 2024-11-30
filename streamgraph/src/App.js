import React, { useState } from "react";
import FileUpload from "./FileUpload";
import Streamgraph from "./StreamVisualization";
import "./App.css";
function App() {
  const [data, setData] = useState(null);
  return (
    <div className="App">
      <FileUpload set_data={setData} />
      {data && (
        <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
          <Streamgraph data={data} />
        </div>
      )}
    </div>
  );
}
export default App;