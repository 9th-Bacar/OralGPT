import React, { useEffect, useState } from 'react';
import createSpeechServicesPonyfill from 'web-speech-cognitive-services';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Configuration, OpenAIApi } from 'openai'
import { useSpeechSynthesis } from 'react-speech-kit';
// import sdk from 'microsoft-cognitiveservices-speech-sdk'
// import Buffer from 'buffer'
// import PassThrough from 'stream'
// import fs from 'fs'

const SUBSCRIPTION_KEY = '6a29b899538c49fba2dbaf5a6f65ae27';
const REGION = 'southeastasia';

const { SpeechRecognition: AzureSpeechRecognition } = createSpeechServicesPonyfill({
    credentials: {
        region: REGION,
        subscriptionKey: SUBSCRIPTION_KEY,
    }
});

const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

SpeechRecognition.applyPolyfill(AzureSpeechRecognition);
const Dictaphone1 = () => {
    const [message, setMessage] = useState('');
    const { speak } = useSpeechSynthesis();
    const commands = [
        {
            command: 'reset',
            callback: () => resetTranscript()
        },
        {
            command: 'shut up',
            callback: () => setMessage('I wasn\'t talking.')
        },
        {
            command: 'Hello',
            callback: () => setMessage('Hi there!')
        },
    ]
    const {
        transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
        listening,
    } = useSpeechRecognition({ commands });

    const askGPT = async () => {
        const completion = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: finalTranscript,
        });
        console.log(completion.data);
        speak({ text: completion.data.choices[0].text })
        resetTranscript()
    }
    useEffect(() => {
        if (finalTranscript !== '') {
            console.log('Got final result:', finalTranscript);
            console.log(interimTranscript);
            // askGPT()
        }
    }, [interimTranscript, finalTranscript]);
    // if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    //     return null;
    // }
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        console.log('Your browser does not support speech recognition software! Try Chrome desktop, maybe?');
    }
    const listenContinuously = () => {
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-GB',
        });
    };
    return (
        <div>
            <div>
                <span>
                    listening:
                    {' '}
                    {listening ? 'on' : 'off'}
                </span>
                <div>
                    <button type="button" onClick={resetTranscript}>Reset</button>
                    <button type="button" onClick={listenContinuously}>Listen</button>
                    <button type="button" onClick={SpeechRecognition.stopListening}>Stop</button>
                    <button type="button" onClick={askGPT}>send</button>
                </div>
            </div>
            <div>
                {message}
            </div>
            <div>
                <span>{transcript}</span>
            </div>
        </div>
    );
};
export default Dictaphone1;