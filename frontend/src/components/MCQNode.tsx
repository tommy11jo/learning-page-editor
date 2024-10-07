import React, { useState } from "react"
import {
  NodeViewWrapper,
  NodeViewProps,
  mergeAttributes,
  ReactNodeViewRenderer,
} from "@tiptap/react"
import { Node } from "@tiptap/core"
import { HelpCircle, Edit, Trash2 } from "lucide-react"
import { MCQData, MCQModal } from "./MCQModal"

export const MCQNodeView: React.FC<NodeViewProps> = (props) => {
  const { question, options, id } = props.node.attrs
  const initialData = { question, options, id }
  const editor = props.editor
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement submission logic
    console.log("Submitted answer:", selectedOption)
    console.log("question id", id)
  }

  const handleClear = () => {
    setSelectedOption(null)
  }

  const handleUpdateMCQ = (data: MCQData) => {
    // tiptap allows forcing a re-render using attribute updates
    props.updateAttributes({ ...data })
    setIsModalOpen(false)
  }

  return (
    <NodeViewWrapper
      className="mcq-node p-2 border border-gray-400 rounded-lg shadow-md max-w-xl relative"
      contentEditable={false}
    >
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1 text-blue-500 hover:text-blue-600"
          aria-label="Edit"
        >
          <Edit size={20} />
        </button>
        <button
          onClick={() => props.deleteNode()}
          className="p-1 text-red-500 hover:text-red-600"
          aria-label="Delete"
        >
          <Trash2 size={20} />
        </button>
      </div>
      <div className="mcq-question mb-2 pl-4 flex items-center uppercase">
        <HelpCircle size={20} className="mr-2" />
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
