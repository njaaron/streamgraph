import React, { Component } from "react";
class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = { file: null };
  }
  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.props.set_data(json);
      };
      reader.readAsText(file);
    }
  };
  csvToJson = (csv) => {
    const [header, ...lines] = csv.trim().split("\n").map((row) => row.split(","));
    return lines.map((line) =>
      header.reduce((obj, col, i) => {
        obj[col.trim()] = col === "Date" ? line[i] : parseInt(line[i], 10) || 0;
        return obj;
      }, {})
    );
  };
  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input
            type="file"
            accept=".csv"
            onChange={(event) => this.setState({ file: event.target.files[0] })}
          />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;