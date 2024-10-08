import { BubbleMenu, Editor, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Extension } from "@tiptap/core"
import { Command } from "@tiptap/core"
import SlashCommandExtension from "./SlashCommand"
import Placeholder from "@tiptap/extension-placeholder"
import { MCQModal, MCQData } from "./MCQModal"
import { MCQNode } from "./MCQNode"
import { useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { learningPageApi } from "../api/learningPage"
import { mcqApi } from "../api/mcq"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    appendTextExtension: {
      appendText: () => ReturnType
    }
  }
}

const AppendTextExtension = Extension.create({
  addCommands() {
    return {
      appendText:
        (): Command =>
        ({ commands }) => {
          // TODO: this is just an dummy command that appends text. implement MCQ command
          const range = this.editor.state.selection
          return commands.insertContentAt(range.to, " appends text")
        },
    }
  },
})

const TipTapEditor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openMCQModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      SlashCommandExtension({ openMCQModal }),
      AppendTextExtension,
      Placeholder.configure({
        placeholder: "Write here...",
      }),
      MCQNode,
    ],
    editorProps: {
      handleDOMEvents: {
        keydown: (_view, event) => {
          // prevent default event listeners from firing when slash command is active
          if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
            const slashCommand = document.querySelector("#slash-command")
            if (slashCommand) {
              return true
            }
          }
        },
      },
    },
    content: "",
  })
  const [initialContentLoaded, setInitialContentLoaded] = useState(false)
  useEffect(() => {
    const fetchLearningPage = async () => {
      if (initialContentLoaded) return
      try {
        const page = await learningPageApi.getLearningPage()
        if (page && page.content) {
          editor?.commands.setContent(JSON.parse(page.content))
          setInitialContentLoaded(true)
        }
      } catch (error) {
        console.error("Error fetching learning page:", error)
      }
    }
    fetchLearningPage()
  }, [editor?.commands, initialContentLoaded])

  const insertMCQNode = (data: MCQData, editor: Editor) => {
    editor
      ?.chain()
      .insertContent([
        {
          type: "mcqNode",
          attrs: { ...data },
        },
        { type: "paragraph" },
      ])
      .run()
  }

  const handleUpdateMCQ = useCallback((data: MCQData, editor: Editor) => {
    // save both the mcq and the learning page
    // invariant: when mcq exists inside the json learning page, it must also exist in the database
    const newData = { ...data, id: uuidv4() }
    insertMCQNode(newData, editor)

    mcqApi
      .upsertQuestion(newData)
      .then(() => {
        console.log("MCQ question saved successfully")
      })
      .catch((error) => {
        console.error("Error saving MCQ question:", error)
      })

    const content = JSON.stringify(editor.getJSON())
    learningPageApi
      .upsertLearningPage({ content })
      .then(() => {
        console.log("Learning page saved successfully")
      })
      .catch((error) => {
        console.error("Error saving learning page:", error)
      })
  }, [])

  const handleSave = useCallback(() => {
    if (editor) {
      const content = JSON.stringify(editor.getJSON())
      learningPageApi
        .upsertLearningPage({ content })
        .then(() => {
          console.log("Learning page saved successfully")
          // You can add a toast notification here if you want
        })
        .catch((error) => {
          console.error("Error saving learning page:", error)
          // You can add an error notification here
        })
    }
  }, [editor])

  if (!editor) return <></>

  const bubbleMenuButtonClass =
    "border-none text-black text-sm font-medium p-1 hover:bg-gray-200 rounded-md"

  return (
    <div>
      <span className="flex items-center">
        To save your work, click
        <button
          onClick={handleSave}
          className="ml-2 px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
        >
          Save
        </button>
      </span>
      <div className="p-4 m-4 border border-gray-400 rounded-lg">
        <BubbleMenu
          className="flex bg-gray-300 gap-2 p-1 rounded-md border border-gray-400"
          editor={editor}
        >
          <button
            onClick={() => editor.chain().focus().appendText().run()}
            className={bubbleMenuButtonClass}
          >
            Append Text
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleBold().run()
            }}
            className={`${bubbleMenuButtonClass} ${
              editor.isActive("bold") ? "bg-gray-100" : ""
            }`}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${bubbleMenuButtonClass} ${
              editor.isActive("italic") ? "bg-gray-100" : ""
            }`}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${bubbleMenuButtonClass} ${
              editor.isActive("strike") ? "bg-gray-100" : ""
            }`}
          >
            Strike
          </button>
        </BubbleMenu>
        <div
          onClick={(e) => {
            // Only focus the editor if the click is directly on this div
            if (e.target === e.currentTarget) {
              editor?.chain().focus().run()
            }
          }}
        >
          <EditorContent editor={editor} />
        </div>
        {/* The modal that gets opened by the slash command */}
        <MCQModal
          handleUpdateMCQ={handleUpdateMCQ}
          editor={editor}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
        />
      </div>
    </div>
  )
}

export default TipTapEditor
