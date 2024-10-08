import { Editor } from "@tiptap/react"
import { useState, useEffect } from "react"
import Modal from "react-modal"

export interface MCQData {
  id?: string
  question: string
  options: string[]
  correctAnswer?: number
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
  const [correctAnswer, setCorrectAnswer] = useState<number>(
    initialData?.correctAnswer || 0
  )
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempQuestion(e.target.value)
    setHasUnsavedChanges(true)
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...tempOptions]
    newOptions[index] = value
    setTempOptions(newOptions)
    setHasUnsavedChanges(true)
  }

  const handleCorrectAnswerChange = (index: number) => {
    setCorrectAnswer(index)
    setHasUnsavedChanges(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const mcqData: MCQData = {
      id: initialData?.id,
      question: tempQuestion,
      options: tempOptions.filter((option) => option.trim() !== ""),
      correctAnswer,
    }

    handleUpdateMCQ(mcqData, editor)
    setHasUnsavedChanges(false)
    setIsOpen(false)
  }

  useEffect(() => {
    setHasUnsavedChanges(initialData?.id === undefined)
    setTempQuestion(initialData?.question || "Write your question.")
    setTempOptions(initialData?.options || ["A", "B", "C", "D"])
    setCorrectAnswer(initialData?.correctAnswer || 0)
  }, [isOpen, initialData])

  const handleCancel = () => {
    setIsOpen(false)
  }

  const isEditing = !!initialData?.id

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      className="max-w-md mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl border border-gray-400"
    >
      <div className="flex p-2">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-2xl font-bold">
            <span>
              {isEditing ? "Edit" : "Create"} a multiple choice question
            </span>
          </h2>
          {hasUnsavedChanges ? (
            <span className="text-sm font-normal text-red-600 uppercase">
              Unsaved
            </span>
          ) : (
            <span className="text-sm font-normal text-gray-600 uppercase">
              Saved
            </span>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div className="relative">
          <label htmlFor="question" className="block mb-1 font-semibold">
            Question:
          </label>
          <input
            id="question"
            type="text"
            value={tempQuestion}
            onChange={handleQuestionChange}
            placeholder="Enter your question"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="block mb-1 font-semibold">Options:</label>
          {tempOptions.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 rounded border border-gray-300"
            >
              <input
                type="radio"
                id={`correct-answer-${index}`}
                name="correct-answer"
                checked={correctAnswer === index}
                onChange={() => handleCorrectAnswerChange(index)}
                className="mr-2 focus:ring-0 focus:outline-none"
              />
              <input
                id={`option-${index}`}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                className={`w-full p-2 border rounded-md ${
                  correctAnswer === index ? "bg-green-400 bg-opacity-30" : ""
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isEditing ? "Save MCQ" : "Create MCQ"}
          </button>
          <button
            onClick={handleCancel}
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
