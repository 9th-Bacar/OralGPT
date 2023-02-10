import React, { useEffect, useState } from "react";
import createSpeechServicesPonyfill from "web-speech-cognitive-services";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Configuration, OpenAIApi } from "openai";
import { useSpeechSynthesis } from "react-speech-kit";
import { toast } from "react-hot-toast";
import {
  SpeakerWaveIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/solid";

// import sdk from 'microsoft-cognitiveservices-speech-sdk'
// import Buffer from 'buffer'
// import PassThrough from 'stream'
// import fs from 'fs'

// const SUBSCRIPTION_KEY = "6a29b899538c49fba2dbaf5a6f65ae27";
// const REGION = "southeastasia";

const Dictaphone1 = (props) => {
//   const screenHeight = window.innerHeight;
  const [screenHeight,setScreenHeight] = useState(window.innerHeight);
  useEffect(() => {
    setScreenHeight(window.innerHeight);
  })
  const recognitionType = props.recognitionType;
  const [textToSend, setTextToSend] = useState("");
  const [inputType, setInputType] = useState("text");
  const [continuousTalk, setContinuousTalk] = useState(false);
  const azureApiKey = props.azureApiKey.azureApiKey;
  const azureApiRegion = props.azureApiRegion.azureApiRegion;
  const openAiApiKey = props.openAiApiKey.openAiApiKey;
  const [textToSpeak, setTextToSpeak] = useState("");
  const [prettyTalk, setPrettyTalk] = useState([]);
  console.log("get open api key:", openAiApiKey);
  const configuration = new Configuration({
    // apiKey: "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",
    apiKey: openAiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  function extractDialogue(conversation) {
    const lines = conversation.split("\n");
    const result = [];
    console.log(lines);
    for (const line of lines) {
      const match = line.match(/(.*):(.*)/);
      if (match) {
        const speaker = match[1];
        const speech = match[2];
        result.push({ Speaker: speaker, Speech: speech });
      }
    }

    return result;
  }

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
    continuousTalk && listenContinuously();
    console.log("speak ended");
    setTextToSpeak("");
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

  useEffect(() => {
    // toast(textToSpeak)
    textToSpeak && cancel();
    textToSpeak && SpeechRecognition.stopListening();
    textToSpeak &&
      speak({
        text: textToSpeak,
      });

  }, [textToSpeak]);

  const [promptTemp, setPromptTemp] = useState(
    "The following is a conversation with an AI assistant.The assistant is helpful, creative, clever, and very friendly.\n\n"
  );
  const commands = [
    {
      command: "reset",
      callback: () => resetTranscript(),
    },
    {
      command: "hello",
      callback: () => toast("ok?"),
    },
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
      continuous: false,
      language: "zh-CN",
    });
  };

  const askGptSpeak = async () => {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: promptTemp + `Human: ${finalTranscript}`,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Human: ", " AI:"],
    });

    setPromptTemp(
      promptTemp +
        `Human: ${finalTranscript}\n` +
        `${completion.data.choices[0].text}\n`
    );

    // SpeechRecognition.stopListening();
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

  const askGptText = async () => {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: promptTemp + `Human: ${textToSend}`,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"],
    });

    setPromptTemp(
      promptTemp +
        `Human:${textToSend}\n` +
        `${completion.data.choices[0].text}\n`
    );
    setTextToSend("");
    setTextToSpeak(
      completion.data.choices[0].text.replace("AI Assistant:", "")
    );
  };
  useEffect(() => {
    toast(interimTranscript)
    toast("final:"+finalTranscript)
    if (finalTranscript !== "") {
      console.log("Got final result:", finalTranscript);


    }
  }, [interimTranscript, finalTranscript]);

  useEffect(() => {
    setPrettyTalk(extractDialogue(promptTemp));
    console.log(extractDialogue(promptTemp));
  }, [promptTemp]);
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
    <div
      className="bg-gray-200 w-full  overflow-y-scroll"
      style={{ height: screenHeight - 124 }}>
      <p>{listening?"listening":"not listening"}</p>
      {prettyTalk.map((item, index) =>
        item.Speaker == "Human" ? (
          <div
            className="flex justify-end"
            onClick={() => {
              setTextToSpeak(item.Speech);
              
            }}>
            <p className="bg-green-400 p-4 m-4 rounded-xl">{item.Speech}</p>
          </div>
        ) : (
          <div
            className="flex justify-start"
            onClick={() => {
              setTextToSpeak(item.Speech);
            }}>
            <p className="bg-white p-4 mr-10 m-4 rounded-xl">{item.Speech}</p>
          </div>
        )
      )}
    </div>
  );

  const InputWindow = (
    <div className="w-full h-[60px] bg-gray-200 flex flex-row">
      <div
        className="bg-green-500 w-[60px] h-full flex justify-center items-center  rounded-lg"
        onClick={() => {
          setInputType("speak");
        }}>
        <MicrophoneIcon className="text-white h-10 " />
      </div>
      <div className="bg-gray-200 flex-grow h-full flex justify-center items-center p-2">
        <input
          type="text"
          hover="Type here"
          className="input input-bordered w-full flex-grow"
          value={textToSend}
          onChange={(e) => {
            setTextToSend(e.target.value);
          }}
        />
      </div>
      <div
        className="bg-green-500 w-[60px] h-full  flex justify-center items-center  rounded-lg"
        onClick={() => {
          askGptText();
        }}>
        <PaperAirplaneIcon className="text-white h-10 " />
      </div>
    </div>
  );

  const SpeakWindow = (
    <div className="w-full bg-gray-200 h-[60px] flex flex-row">
      <div
        className="bg-green-500 w-[60px] h-full flex justify-center items-center rounded-lg"
        onClick={() => {
          setInputType("text");
        }}>
        <ChatBubbleLeftEllipsisIcon className="text-white h-10 " />
      </div>
      <div className="flex-grow h-full flex justify-center items-center p-2">
        <button
          className="btn btn-wide h-[60px]] bg-green-500 border-green-500 text-white"
          onClick={() => {
            toast('listening');
            console.log("on press");
            !listening?listenContinuously():SpeechRecognition.stopListening()
          }}
         >
          Speak
        </button>
      </div>
      {/* <div
        className="bg-green-500 w-[60px] h-full  flex justify-center items-center  rounded-lg"
        onClick={() => {
          askGptText();
        }}>
        <PaperAirplaneIcon className="text-white h-10 " />
      </div> */}
    </div>
  );

  return (
    <div className="w-full " style={{ height: screenHeight - 64 }} onClick={()=>{console.log('')}}>
      {ChatHistory}
      {inputType == "text" ? InputWindow : SpeakWindow}
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
