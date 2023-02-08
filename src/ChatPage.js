import React, { useEffect, useState } from "react";
import createSpeechServicesPonyfill from "web-speech-cognitive-services";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Configuration, OpenAIApi } from "openai";
import { useSpeechSynthesis } from "react-speech-kit";
import { toast } from "react-hot-toast";
// import sdk from 'microsoft-cognitiveservices-speech-sdk'
// import Buffer from 'buffer'
// import PassThrough from 'stream'
// import fs from 'fs'

// const SUBSCRIPTION_KEY = "6a29b899538c49fba2dbaf5a6f65ae27";
// const REGION = "southeastasia";





const Dictaphone1 = (props) => {
  const recognitionType = props.recognitionType;
  const azureApiKey = props.azureApiKey;
  const azureApiRegion = props.azureApiRegion;
  const openAiApiKey = props.openAiApiKey;
  const configuration = new Configuration({
    // apiKey: "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",
    apiKey: openAiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  if (!openAiApiKey){
    toast.error("OpenAI Api Key is required");
  }else{
  }

  const { SpeechRecognition: AzureSpeechRecognition } =
  createSpeechServicesPonyfill({
    credentials: {
      region: azureApiRegion,
      subscriptionKey: azureApiKey,
    },
  });

  recognitionType=='azure'&&SpeechRecognition.applyPolyfill(AzureSpeechRecognition);

  const [message, setMessage] = useState("");
  const { speak } = useSpeechSynthesis();
  const [reply, setReply] = useState("");
  const [promptTemp, setPromptTemp] = useState(
    "The following is a conversation with an AI assistant.The assistant is helpful, creative, clever, and very friendly.\n\n"
  );
  const commands = [
    {
      command: "reset",
      callback: () => resetTranscript(),
    },
    // {
    //   command: "shut up",
    //   callback: () => setMessage("I wasn't talking."),
    // },
    // {
    //   command: "Hello",
    //   callback: () => setMessage("Hi there!"),
    // },
  ];
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
  } = useSpeechRecognition({ commands });

  const resetAll = () => {
    resetTranscript();
    setPromptTemp(
      "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\n"
    );
  };

  const askGPT = async () => {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: promptTemp + `Human: ${finalTranscript}`,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"],
    });

    console.log(completion.data);
    setReply(completion.data.choices[0].text);
    setPromptTemp(
      promptTemp +
        `Human: ${finalTranscript}\n` +
        `${completion.data.choices[0].text}\n`
    );
    speak({
      text: completion.data.choices[0].text
        .replace("AI assistant:", "")
        .replace("AI", "")
        .replace("AI Assistant:", ""),
    });
    resetTranscript();
  };
  useEffect(() => {
    if (finalTranscript !== "") {
      console.log("Got final result:", finalTranscript);
      console.log(interimTranscript);
      //   askGPT()
    }
  }, [interimTranscript, finalTranscript]);
  //   if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
  //       return null;
  //   }
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    console.log(
      "Your browser does not support speech recognition software! Try Chrome desktop, maybe?"
    );
  }
  const listenContinuously = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: "zh-CN",
    });
  };

  const ChatDisplay = () => (
    <div>
      {promptTemp.split("\n").map((line, index) => (
        <p>
          {/* {React.createElement('br')} */}
          {line}
        </p>
      ))}
    </div>
  );

  return (
    <div className="bg-white w-screen h-[500px]">
      <div>

        <span>listening: {listening ? "on" : "off"}</span>
        <div>
          <button type="button" onClick={resetAll}>
            Reset
          </button>
          <button type="button" onClick={listenContinuously}>
            Listen
          </button>
          <button type="button" onClick={SpeechRecognition.stopListening}>
            Stop
          </button>
          <button type="button" onClick={askGPT}>
            send
          </button>
        </div>
      </div>
      {/* <div>{message}</div>
       */}

      {ChatDisplay()}
      <div>
        <span>{transcript}</span>
      </div>
    </div>
  );
};
export default Dictaphone1;
