import { useEffect } from "react"
import Modal from "react-modal"
import Header from "./components/Header"
import TipTapEditor from "./components/TipTapEditor"

function App() {
  useEffect(() => {
    Modal.setAppElement("#root")
  }, [])

  return (
    <>
      <Header />
      <div className="container mx-auto px-4">
        <TipTapEditor />
      </div>
    </>
  )
}

export default App
