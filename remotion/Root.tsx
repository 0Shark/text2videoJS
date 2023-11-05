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
        durationInFrames={-1} // Temporary
        fps={config.fps}
        width={config.width}
        height={config.height}
        defaultProps={{
          topic: "Topic",
          user_id: "1",
          script: {"topic":"Why drinking coffee is good for your health","subtitles":[{"text":"Coffee has several health benefits that contribute to overall well-being.","search_tags":["health benefits","well-being"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\audio\\subtitle_0.wav","audio_duration":4.625,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_0\\image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_0\\video_0.mp4"]},{"text":"Coffee is rich in antioxidants, which help protect against chronic diseases like heart disease and certain types of cancer.","search_tags":["antioxidants","chronic diseases","heart disease","cancer"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\audio\\subtitle_1.wav","audio_duration":7.525,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_1\\image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_1\\video_0.mp4"]},{"text":"Drinking coffee may lower the risk of developing Parkinson's disease and Alzheimer's disease.","search_tags":["Parkinson's disease","Alzheimer's disease","lower risk"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\audio\\subtitle_2.wav","audio_duration":6.1375,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_2\\image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_2\\video_0.mp4"]},{"text":"Coffee can boost metabolism and enhance physical performance, making it a popular choice among athletes.","search_tags":["metabolism","physical performance","athletes"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\audio\\subtitle_3.wav","audio_duration":7.025,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_3\\image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_3\\video_0.mp4"]},{"text":"Caffeine in coffee improves cognitive function, alertness, and may reduce the risk of depression.","search_tags":["caffeine","cognitive function","alertness","reduce risk of depression"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\audio\\subtitle_4.wav","audio_duration":6.1625,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_4\\image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_4\\video_0.mp4"]},{"text":"Moderate coffee consumption has been associated with a lower risk of liver cirrhosis and liver cancer.","search_tags":["moderate consumption","liver cirrhosis","liver cancer"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\audio\\subtitle_5.wav","audio_duration":6.775,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_5\\image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_5\\video_0.mp4"]},{"text":"Coffee can also improve mood, increase energy levels, and help burn fat.","search_tags":["mood improvement","energy boost","fat burning"],"audio_file_path":"C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\audio\\subtitle_6.wav","audio_duration":5.225,"images":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_6\\image_0.jpg"],"videos":["C:\\Users\\Fujitsu\\Desktop\\text2videoJS\\public\\videos\\test\\assets\\subtitle_6\\video_0.mp4"]}]},
        }}
        calculateMetadata={async ({ props }) => {
          let duration = 0;
          props.script.subtitles.forEach((subtitle) => {
            duration += subtitle.audio_duration.toFixed(0) * config.fps;
          });

          return {
            durationInFrames: Math.floor(duration + config.intro_duration * config.fps),
          };
        }}
      />
    </>
  );
};
