import { useEffect, useState } from "react"
import Modal from "react-modal"
import Header from "./components/Header"
import TipTapEditor from "./components/TipTapEditor"
import TipTapViewer from "./components/TipTapViewer"

enum EditorMode {
  Edit = "edit",
  View = "view",
}

const sampleJSONContent = {
  type: "doc",
  content: [
    {
      type: "mcqNode",
      attrs: {
        id: "mcq-1234",
        question: "Choose the correct answer",
        options: ["Option A", "Option B", "Option C", "Option D"],
      },
      content: [{ type: "text", text: "MCQ: Choose the correct answer" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "This is a paragraph" }],
    },
  ],
}

function App() {
  const [mode, setMode] = useState<EditorMode>(EditorMode.Edit)
  useEffect(() => {
    Modal.setAppElement("#root")
  }, [])

  const toggleMode = (newMode: EditorMode) => {
    setMode(newMode)
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-4 flex flex-col items-center">
        <p className="mb-2">Select a mode:</p>
        <div className="flex">
          <button
            className={`mx-2 px-4 rounded ${
              mode === EditorMode.Edit ? "underline bg-gray-200" : ""
            }`}
            onClick={() => toggleMode(EditorMode.Edit)}
          >
            Edit
          </button>
          <button
            className={`mx-2 px-4 rounded ${
              mode === EditorMode.View ? "underline bg-gray-200" : ""
            }`}
            onClick={() => toggleMode(EditorMode.View)}
          >
            View
          </button>
        </div>
      </div>
      <div className="container mx-auto px-4">
        {mode === EditorMode.Edit ? (
          <TipTapEditor initialJSONContent={sampleJSONContent} />
        ) : (
          <TipTapViewer jsonContent={sampleJSONContent} />
        )}
      </div>
    </>
  )
}

export default App
