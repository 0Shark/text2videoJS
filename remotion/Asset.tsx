import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { config } from "./config";
import "./Reveal.css";

interface Props {
  index: number;
  asset_type: string;
  src: string;
  text: string;
}

export const Asset: React.FC<Props> = (props) => {
  const frame = useCurrentFrame();

  const swipereveal = (val1, val2) => {
    return interpolate(frame, val1, val2, {
      easing: Easing.bezier(0.74, 0.06, 0.4, 0.92),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  const width = swipereveal([0, config.fps, config.fps * 2], [0, 100, 0]);
  const left = swipereveal([config.fps, config.fps * 2], [0, 100]);
  const opacity = interpolate(
    frame,
    [config.fps + config.fps / 2, config.fps * 2 + config.fps / 2],
    [0, 100],
    {
      extrapolateRight: "clamp",
    }
  );

  const width2 = swipereveal(
    [config.fps * 2, config.fps * 3, config.fps * 4],
    [0, 100, 0]
  );
  const left2 = swipereveal([config.fps * 3, config.fps * 4], [0, 100]);
  const opacity2 = interpolate(
    frame,
    [config.fps * 3 + config.fps / 2, config.fps * 4 + config.fps / 2],
    [0, 100],
    {
      extrapolateRight: "clamp",
    }
  );

  const opacity3 = interpolate(
    frame,
    [config.fps * 3 + config.fps / 2, config.fps * 4 + config.fps / 2],
    [0, 100],
    {
      extrapolateRight: "clamp",
    }
  );

  const imagescale = interpolate(
    frame,
    [0, config.fps, config.fps * 2],
    [0, 1.3, 1],
    {
      easing: Easing.in(),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const imagerotate = interpolate(
    frame,
    [0, config.fps, config.fps * 2],
    [0, 2, 0],
    {
      easing: Easing.in(),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div>
      <div
        className="asset-container"
        style={{
          position: "fixed",
          left: "-50px",
          right: "-10",
          zIndex: 1,
          display: "block",
          width: "200%",
          height: "200%",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          filter: "blur(10px)",
        }}
      ></div>

      {props.asset_type == "video" ? (
        <video
          key={props.index}
          src={props.src}
          style={
            props.index == 0
              ? {
                  transform: `scale(${imagescale}) rotate(-${imagerotate}deg)`,
                }
              : { opacity: opacity3 }
          }
        ></video>
      ) : (
        <img
          key={props.index}
          src={props.src}
          alt="..."
          style={
            props.index == 0
              ? {
                  transform: `scale(${imagescale}) rotate(-${imagerotate}deg)`,
                }
              : { opacity: opacity3 }
          }
        ></img>
      )}

      <div className="container">
        <div className="box">
          <div className="title">
            <span
              className="block"
              style={{
                width: width + "%",
                left: left + "%",
              }}
            ></span>
            <h1
              style={{
                opacity: opacity + "%",
              }}
            >
              {props.text.match(/.{1,30}\w/g)[0]}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};
