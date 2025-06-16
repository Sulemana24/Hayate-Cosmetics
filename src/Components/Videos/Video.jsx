import React from "react";
import "./Video.css";

const Video = () => {
  return (
    <div className="video-section">
      <div className="video-container">
        <div class="video-wrapper">
          <iframe
            width="760"
            height="315"
            src="https://www.youtube.com/embed/DjY-01S_dgs?si=75026y0OX5pyuKkj"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Video;
