import logo from "./gptLogo.png";
import Dictaphone from "./ChatPage";
import "./App.css";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
function App() {
  const screenWidth = window.innerWidth;
  const [recognition, setRecognition] = useState("browser");
  const [goodToStart, setGoodToStart] = useState(false);
  const [azureApiKey, setAzureApiKey] = useState("");
  const [azureApiRegion, setAzureApiRegion] = useState("");
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setOpenAiApiKey(localStorage.getItem("openAiApiKey"));
    setAzureApiKey(localStorage.getItem("azureApiKey"));
    setAzureApiRegion(localStorage.getItem("azureApiRegion"));
    setRecognition(localStorage.getItem("recognition"));

  }, []);

  useEffect(() => {
    CheckApiConfig()
  }, [openAiApiKey, azureApiKey, azureApiRegion, recognition]);


  const Headers = () => {
    return (
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">Oral GPT</a>
        </div>

        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-5 h-5 stroke-current">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a>Language</a>
            </li>
            <li>
              <a>Speaker Option</a>
            </li>
            <li
              onClick={() => {
                setModalOpen(true);
              }}>
              <a>API Option</a>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const StartBottom = (
    <label
      htmlFor="my-modal"
      className="btn"
      onClick={() => {
        setModalOpen(true);
      }}>
      Start
    </label>
  );

  const ApiKeyInput = (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">OpenAI Api Key:</span>
      </label>
      <input
        type="text"
        id="openaiAPiKey"
        key="openaiAPiKey"
        value={openAiApiKey}
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
        onChange={(e) => {
          setOpenAiApiKey(e.target.value);
        }}
      />
    </div>
  );

  const AzureApiInput = (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Azure Api Key:</span>
      </label>
      <input
        type="text"
        placeholder="Type here"
        id="azureApiKey"
        className="input input-bordered w-full max-w-xs"
        value={azureApiKey}
        onChange={(e) => {
          setAzureApiKey(e.target.value);
        }}
      />
      <label className="label">
        <span className="label-text">Azure Api Region:</span>
      </label>
      <input
        type="text"
        id="azureApiRegion"
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
        value={azureApiRegion}
        onChange={(e) => {
          setAzureApiRegion(e.target.value);
        }}
      />
    </div>
  );

  const RecognitionOption = (
    <div className="">
      <label className="label">
        <span className="label-text">Speech Recognition:</span>
      </label>
      <select
        className="select select-bordered w-full max-w-xs"
        value={recognition}
        onChange={(e) => {
          setRecognition(e.target.value);
          console.log(e.target.value);
        }}>
        <option value="browser">Browser</option>
        <option value="azure">Azure</option>
      </select>
      {recognition == "azure" && AzureApiInput}
    </div>
  );

  const StartModal = (
    <div>
      <div
        className={modalOpen ? "modal modal-open" : "modal"}
        style={{ visibility: "visible" }}>
        <div className="modal-box">
          <label
            htmlFor="my-modal-3"
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={() => {
              setModalOpen(false);
            }}>
            ✕
          </label>
          <h3 className="font-bold text-lg">
            Before you start, please enter your API key.
          </h3>
          {ApiKeyInput}
          {RecognitionOption}
          <div className="modal-action">
            <label
              htmlFor="my-modal"
              className="btn"
              onClick={() => {
                saveApiConfig();
                CheckApiConfig();
              }}>
              Save
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const saveApiConfig = () => {
    try {
      localStorage.setItem("openAiApiKey", openAiApiKey);
      localStorage.setItem("recognition", recognition);
      localStorage.setItem("azureApiKey", azureApiKey);
      localStorage.setItem("azureApiRegion", azureApiRegion);
      toast.success("Save Successfully");

    } catch (error) { }
  };

  const CheckApiConfig = () => {
    if (recognition == "browser") {
      openAiApiKey ? setGoodToStart(true) : setGoodToStart(false);
    } else {
      openAiApiKey && azureApiKey && azureApiRegion
        ? setGoodToStart(true)
        : setGoodToStart(false);
    }
  };

  const StartContainer = (
    <body className="flex items-center justify-center h-[200px] bg-gray-400">

      {StartBottom}
    </body>
  );

  const ChatContainer = (
    <body className="bg-gray-400 flex-grow">
      <Dictaphone openAiApiKey={{ openAiApiKey }} azureApiKey={{ azureApiKey }} azureApiRegion={{ azureApiRegion }} recognitionType={{ recognition }} />
    </body>
  );

  return (
    <div className="h-screen max-h-screen min-w-[300px] bg-gray-200 flex flex-col">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Dictaphone />
      </header> */}
      <Headers />
      {/* <span className="">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</span> */}
      {!goodToStart ? StartContainer : ChatContainer}
      {StartModal}
    </div>
  );
}

export default App;
