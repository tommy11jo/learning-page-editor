import { Editor } from "@tiptap/react"
import { useState } from "react"
import Modal from "react-modal"

export interface MCQData {
  id?: string
  question: string
  options: string[]
}

interface MCQModalProps {
  handleUpdateMCQ: (data: MCQData, editor: Editor) => void
  editor: Editor
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  initialData?: MCQData
}
// this exists as a global var since it is must be called outside of a react context via a tip tap command
const MCQModal = ({
  handleUpdateMCQ,
  editor,
  isOpen,
  setIsOpen,
  initialData,
}: MCQModalProps) => {
  const [tempQuestion, setTempQuestion] = useState(
    initialData?.question || "Write your question."
  )
  const [tempOptions, setTempOptions] = useState<string[]>(
    initialData?.options || ["A", "B", "C", "D"]
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleUpdateMCQ(
      {
        id: initialData?.id,
        question: tempQuestion,
        options: tempOptions.filter((option) => option.trim() !== ""),
      },
      editor
    )
    setIsOpen(false)
  }

  const isEditing = !!initialData?.id

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      className="max-w-md mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl border border-gray-400"
    >
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? "Edit" : "Create"} a multiple choice question
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div className="relative">
          <label htmlFor="question" className="block mb-1 font-semibold">
            Question:
          </label>
          <input
            id="question"
            type="text"
            value={tempQuestion}
            onChange={(e) => setTempQuestion(e.target.value)}
            placeholder="Enter your question"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="block mb-1 font-semibold">Options:</label>
          {tempOptions.map((option, index) => (
            <div key={index}>
              <input
                id={`option-${index}`}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...tempOptions]
                  newOptions[index] = e.target.value
                  setTempOptions(newOptions)
                }}
                placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isEditing ? "Update MCQ" : "Create MCQ"}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export { MCQModal }
