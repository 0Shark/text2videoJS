import { useCurrentFrame } from "remotion";
import { config } from "./config";
import React from "react";

export const Intro: React.FC<{ title: string }> = (props) => {
  return (
    <div>
      <h1
        className="title"
        style={{
          width: config.width,
          height: config.height,
          background: "white",
          padding: 10,
          fontFamily: "Poppins",
          fontSize: 150,
          fontWeight: "bold",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textTransform: "uppercase",
        }}
      >
        {props.title}
      </h1>
    </div>
  );
};
