import { useEffect, useState } from "react"
import Modal from "react-modal"
import Header from "./components/Header"
import TipTapEditor from "./components/TipTapEditor"
import TipTapViewer from "./components/TipTapViewer"

enum EditorMode {
  Edit = "edit",
  View = "view",
}

function App() {
  const [mode, setMode] = useState<EditorMode>(EditorMode.Edit)
  useEffect(() => {
    Modal.setAppElement("#root")
  }, [])

  const handleModeToggle = () => {
    setMode(mode === EditorMode.Edit ? EditorMode.View : EditorMode.Edit)
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-2 flex flex-col items-start">
        <div className="flex items-center space-x-2">
          <span>Choose a mode:</span>
          <span
            className={`text-sm ${mode === EditorMode.Edit ? "font-bold" : ""}`}
          >
            Edit
          </span>
          <button
            onClick={handleModeToggle}
            className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-400 focus:outline-none"
          >
            <span className="sr-only">Toggle mode</span>
            <span
              className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                mode === EditorMode.View ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm ${mode === EditorMode.View ? "font-bold" : ""}`}
          >
            View
          </span>
        </div>
      </div>
      <div className="container mx-auto px-4">
        {mode === EditorMode.Edit ? <TipTapEditor /> : <TipTapViewer />}
      </div>
    </>
  )
}

export default App
