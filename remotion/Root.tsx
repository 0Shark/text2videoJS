import React from "react";
import { Composition } from "remotion";
import { Text2Video } from "./Timeline";
import { config } from "./config";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Text2Video"
        component={Text2Video}
        durationInFrames={20} // Temporary
        fps={config.fps}
        width={config.width}
        height={config.height}
        defaultProps={{
          topic: "Topic",
          user_id: "1",
          script: {"topic":"Is it me you're looking for?","subtitles":[{"text":"Hello, is it me you're looking for?","search_tags":["hello","looking for","search"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB\\audio\\subtitle_0.wav","audio_duration":2.7625,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_0/image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_0/video_0.mp4"]},{"text":"I can see it in your eyes","search_tags":["eyes","see"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB\\audio\\subtitle_1.wav","audio_duration":2.325,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_1/image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_1/video_0.mp4"]},{"text":"I can see it in your smile","search_tags":["smile","see"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB\\audio\\subtitle_2.wav","audio_duration":2.2875,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_2/image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_2/video_0.mp4"]},{"text":"You're all I've ever wanted","search_tags":["wanted","all","ever"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB\\audio\\subtitle_3.wav","audio_duration":2.3375,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_3/image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_3/video_0.mp4"]},{"text":"And my arms are open wide","search_tags":["arms","open wide"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB\\audio\\subtitle_4.wav","audio_duration":2.55,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_4/image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_4/video_0.mp4"]},{"text":"'Cause you know just what to say","search_tags":["know","what to say"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB\\audio\\subtitle_5.wav","audio_duration":2.325,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_5/image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_5/video_0.mp4"]},{"text":"And you know just what to do","search_tags":["know","what to do"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB\\audio\\subtitle_6.wav","audio_duration":2.275,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_6/image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_6/video_0.mp4"]},{"text":"And I want to tell you so much","search_tags":["want","tell","so much"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB\\audio\\subtitle_7.wav","audio_duration":2.5125,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_7/image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_7/video_0.mp4"]},{"text":"I love you","search_tags":["love"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB\\audio\\subtitle_8.wav","audio_duration":1.6375,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_8/image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\videos\\3FZCukYJJptsb_CZAAAB/assets/subtitle_8/video_0.mp4"]}]},
        }}
        calculateMetadata={async ({ props }) => {
          let duration = 0;
          props.script.subtitles.forEach((subtitle) => {
            duration += subtitle.audio_duration;
          });

          return {
            durationInFrames: Math.floor(duration + config.intro_duration * config.fps),
          };
        }}
      />
    </>
  );
};
