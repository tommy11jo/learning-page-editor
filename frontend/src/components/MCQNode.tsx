import React, { useState } from "react"
import {
  NodeViewWrapper,
  NodeViewProps,
  mergeAttributes,
  ReactNodeViewRenderer,
} from "@tiptap/react"
import { Node } from "@tiptap/core"
import { Edit, Trash2 } from "lucide-react"
import { MCQData, MCQModal } from "./MCQModal"
import { mcqApi } from "../api/mcq"
import { useSaveStatus } from "./SaveStatusContext"
import { toast } from "react-hot-toast"
import { learningPageApi } from "../api/learningPage"

export const MCQNodeView: React.FC<NodeViewProps> = (props) => {
  const { question, options, id, correctAnswer } = props.node.attrs
  const initialData = { question, options, id, correctAnswer }
  const editor = props.editor

  const { setSaveStatus } = useSaveStatus()

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOption) {
      toast.error("Please select an option before submitting.")
      return
    }

    try {
      const submission = {
        question_id: id,
        selected_answer: options.indexOf(selectedOption),
      }
      const response = await mcqApi.submitAnswer(submission)
      setSubmissionResult(
        response.is_correct ? "Correct!" : "Incorrect. Try again."
      )
    } catch (error) {
      console.error("Error submitting answer:", error)
      setSubmissionResult("Error submitting answer. Please try again.")
    }
  }

  const handleClear = () => {
    setSelectedOption(null)
  }

  const handleUpdateMCQ = (data: MCQData) => {
    // tiptap allows forcing a re-render using attribute updates
    props.updateAttributes({ ...data })
    setIsModalOpen(false)

    mcqApi
      .upsertQuestion(data)
      .then(() => {
        toast.success("MCQ question saved successfully")
      })
      .catch((error) => {
        toast.error("Error saving MCQ question: " + error.message)
        toast.error("Error saving MCQ question. Please try again.")
      })
    setSaveStatus("Saved")
  }
  const deleteMCQ = async () => {
    props.deleteNode()
    try {
      await mcqApi.deleteQuestion(id)
      toast.success("MCQ question deleted successfully")
    } catch (error) {
      console.error("Error deleting MCQ question:", error)
      toast.error("Error deleting MCQ question. Please try again.")
    }
    try {
      await learningPageApi.upsertLearningPage({
        content: JSON.stringify(editor.getJSON()),
      })
      setSaveStatus("Saved")
    } catch (error) {
      console.error("Error saving learning page:", error)
      toast.error("Error saving learning page. Please try again.")
    }
  }

  return (
    <NodeViewWrapper
      className="mcq-node p-2 border border-gray-400 rounded-lg shadow-md max-w-xl relative"
      contentEditable={false}
    >
      {props.editor.isEditable && (
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 text-blue-500 hover:text-blue-600"
            aria-label="Edit"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={deleteMCQ}
            className="p-1 text-red-500 hover:text-red-600"
            aria-label="Delete"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}
      <div className="mcq-question mb-2 pl-4 flex items-center uppercase">
        <span>Quick Quiz</span>
      </div>
      <div className="mcq-content bg-gray-50 px-4">
        <div className="mcq-question mb-4">{question}</div>
        <form onSubmit={handleSubmit} className="mcq-form">
          {options.map((option: string, index: number) => (
            <div
              key={index}
              className="mcq-option flex items-center space-x-2 p-2 mb-2 border border-gray-400 rounded shadow-sm"
            >
              <input
                type="radio"
                id={`option-${index}`}
                name="mcq-option"
                value={option}
                checked={selectedOption === option}
                onChange={() => setSelectedOption(option)}
                className="mr-2 focus:ring-0 focus:outline-none"
              />
              <label
                htmlFor={`option-${index}`}
                className="w-full cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
          {!props.editor.isEditable && (
            <div className="flex justify-between mt-4">
              <button
                type="submit"
                className="mcq-submit px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="mcq-clear px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Clear
              </button>
            </div>
          )}
          {submissionResult && (
            <div
              className={`mt-4 p-2 rounded ${
                submissionResult.includes("Correct")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {submissionResult}
            </div>
          )}
        </form>
      </div>
      <MCQModal
        handleUpdateMCQ={handleUpdateMCQ}
        editor={editor}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        initialData={initialData}
      />
    </NodeViewWrapper>
  )
}

export const MCQNode = Node.create({
  name: "mcqNode",
  group: "block",
  content: "inline*",
  atom: true, // this node doesn't have any directly editable content
  isolating: true, // editing boundaries like backspacing don't affect this node
  selectable: false,
  draggable: false,
  addAttributes() {
    return {
      id: {
        default: "",
      },
      question: {
        default: "",
      },
      options: {
        default: [],
      },
      correctAnswer: {
        default: 0,
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="mcq"]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "mcq" }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(MCQNodeView)
  },
})
