import React, { useEffect, useState } from "react";
import createSpeechServicesPonyfill from "web-speech-cognitive-services";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Configuration, OpenAIApi } from "openai";
import { useSpeechSynthesis } from "react-speech-kit";
import { toast } from "react-hot-toast";
import { SpeakerWaveIcon,PaperAirplaneIcon } from "@heroicons/react/24/solid";
// import sdk from 'microsoft-cognitiveservices-speech-sdk'
// import Buffer from 'buffer'
// import PassThrough from 'stream'
// import fs from 'fs'

// const SUBSCRIPTION_KEY = "6a29b899538c49fba2dbaf5a6f65ae27";
// const REGION = "southeastasia";

const Dictaphone1 = (props) => {
  const recognitionType = props.recognitionType;

  const azureApiKey = props.azureApiKey.azureApiKey;
  const azureApiRegion = props.azureApiRegion.azureApiRegion;
  const openAiApiKey = props.openAiApiKey.openAiApiKey;
  console.log("get open api key:", openAiApiKey);
  const configuration = new Configuration({
    // apiKey: "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",
    apiKey: openAiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  if (!openAiApiKey) {
    toast.error("OpenAI Api Key is required");
  } else {
  }

  const { SpeechRecognition: AzureSpeechRecognition } =
    createSpeechServicesPonyfill({
      credentials: {
        region: azureApiRegion,
        subscriptionKey: azureApiKey,
      },
    });

  recognitionType == "azure" &&
    SpeechRecognition.applyPolyfill(AzureSpeechRecognition);

  const onBoundary = (event) => {
    console.log(
      `${event.name} boundary reached after ${event.elapsedTime} milliseconds.`
    );
  };
  const onEnd = () => {
    listenContinuously();
    console.log("speak ended");
  };
  const onError = (event) => {
    console.warn(event);
  };

  const { cancel, speak, speaking, supported, voices, pause, resume } =
    useSpeechSynthesis({
      onEnd,
      onBoundary,
      onError,
    });
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
  const listenContinuously = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-GB",
    });
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

    setPromptTemp(
      promptTemp +
        `Human: ${finalTranscript}\n` +
        `${completion.data.choices[0].text}\n`
    );

    SpeechRecognition.stopListening();
    resetTranscript();
    console.log(
      completion.data.choices[0].text
        .replace("AI Assistant:", "")
        .replace("AI", "")
        .replace("AI Assistant:", "")
    );
    speak({
      text: completion.data.choices[0].text
        .replace("assistant:", "")
        .replace("AI", "")
        .replace("Assistant:", ""),
    });
  };
  useEffect(() => {
    if (finalTranscript !== "") {
      console.log("Got final result:", finalTranscript);
      console.log(interimTranscript);
      // askGPT()
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

  const ChatHistory = (
    <div className="bg-gray-200 w-full flex-grow">
      {promptTemp.split("\n").map((line, index) =>
        line.includes("Human:") ? (
          <div className="flex justify-end">
            <p className="bg-green-400 p-4 m-4 rounded-xl">
              {line.replace("Human:", "")}
            </p>
          </div>
        ) : line.includes("AI Assistant:") ? (
          <div className="flex justify-start">
            <p className="bg-white p-4 mr-10 m-4 rounded-xl">
              {line.replace("AI Assistant:", "")}
              {line.replace("AI Assistant:", "")}
              {line.replace("AI Assistant:", "")}
              {line.replace("AI Assistant:", "")}
              {line.replace("AI Assistant:", "")}
              {line.replace("AI Assistant:", "")}
              {line.replace("AI Assistant:", "")}
              {line.replace("AI Assistant:", "")}
              {line.replace("AI Assistant:", "")}
              {line.replace("AI Assistant:", "")}
            </p>
          </div>
        ) : (
          <div></div>
        )
      )}
    </div>
  );

  const InputWindow = (
    <div className="w-full h-[60px] bg-pink-300 flex flex-row">
      <div className="bg-green-500 w-[60px] h-full justify-center">
        <SpeakerWaveIcon className="text-white h-10 " />
      </div>
      <div className="bg-red-100 flex-grow h-full flex justify-center items-center p-2">
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full flex-grow"
        />
      </div>
      <div className="bg-green-500 w-[60px] h-full">
        <PaperAirplaneIcon/>
      </div>
    </div>
  );

  return (
    <div className="w-full flex-grow flex flex-col">
      {ChatHistory}
      {InputWindow}
      {/* <div>

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
          <button type="button" onClick={() => {
            askGPT()

          }}>
            send
          </button>
        </div>
      </div> */}
      {/* <div>{message}</div>
       */}

      {/* {ChatDisplay()}
      <div>
        <span>{transcript}</span>
      </div> */}
    </div>
  );
};
export default Dictaphone1;
