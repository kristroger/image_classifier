import React from "react";
import ReactDOM from "react-dom";
import MagicDropzone from "react-magic-dropzone";

import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";
import "./styles.css";

class App extends React.Component {
  state = {
    model: null,
    preview: "",
    predictions: []
  };

  componentDidMount() {
    posenet.load().then(model => {
      this.setState({
        model: model
      });
    });
  }

  onDrop = (accepted, rejected, links) => {
    this.setState({ preview: accepted[0].preview || links[0] });
  };

  cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (naturalWidth > naturalHeight) {
      ctx.drawImage(
        image,
        (naturalWidth - naturalHeight) / 2,
        0,
        naturalHeight,
        naturalHeight,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    } else {
      ctx.drawImage(
        image,
        0,
        (naturalHeight - naturalWidth) / 2,
        naturalWidth,
        naturalWidth,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    }
  };

  onImageChange = e => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    this.cropToCanvas(e.target, c, ctx);
    this.state.model.estimateMultiplePoses(c).then(predictions => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#00ffff";
      predictions.forEach(prediction => {
        prediction.keypoints.forEach(keypoint => {
          ctx.beginPath();
          ctx.arc(keypoint.position.x, keypoint.position.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
    });
  };

  render() {
    return (
      <div className="Dropzone-page">
        {this.state.model ? (
          <MagicDropzone
            className="Dropzone"
            accept="image/jpeg, image/png, .jpg, .jpeg, .png"
            multiple={false}
            onDrop={this.onDrop}
          >
            {this.state.preview ? (
              <img
                alt="upload preview"
                onLoad={this.onImageChange}
                className="Dropzone-img"
                src={this.state.preview}
              />
            ) : (
              "Choose or drop a file."
            )}
            <canvas id="canvas" />
          </MagicDropzone>
        ) : (
          <div className="Dropzone">Loading model...</div>
        )}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
