import { BubbleMenu, Editor, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import SlashCommandExtension from "./SlashCommand"
import Placeholder from "@tiptap/extension-placeholder"
import { MCQModal, MCQData } from "./MCQModal"
import { MCQNode } from "./MCQNode"
import { useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { learningPageApi } from "../api/learningPage"
import { mcqApi } from "../api/mcq"
import { useSaveStatus } from "./SaveStatusContext"
import { toast } from "react-hot-toast"

const TipTapEditor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { saveStatus, setSaveStatus } = useSaveStatus()

  const openMCQModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      SlashCommandExtension({ openMCQModal }),
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
    onUpdate: () => {
      setSaveStatus("Unsaved")
    },
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

  const handleUpdateMCQ = useCallback(
    (data: MCQData, editor: Editor) => {
      // save both the mcq and the learning page
      // invariant: when mcq exists inside the json learning page, it must also exist in the database
      const newData = { ...data, id: uuidv4() }
      insertMCQNode(newData, editor)

      mcqApi
        .upsertQuestion(newData)
        .then(() => {
          toast.success("MCQ question saved successfully")
        })
        .catch((error) => {
          console.error("Error saving MCQ question:", error)
          toast.error("Failed to save MCQ question")
        })

      const content = JSON.stringify(editor.getJSON())
      learningPageApi
        .upsertLearningPage({ content })
        .then(() => {
          toast.success("Learning page saved successfully")
        })
        .catch((error) => {
          console.error("Error saving learning page:", error)
          toast.error("Failed to save learning page")
        })
      setSaveStatus("Saved")
    },
    [setSaveStatus]
  )

  const handleSave = useCallback(() => {
    if (editor) {
      const content = JSON.stringify(editor.getJSON())
      learningPageApi
        .upsertLearningPage({ content })
        .then(() => {
          toast.success("Learning page saved successfully")
          setSaveStatus("Saved")
        })
        .catch((error) => {
          console.error("Error saving learning page:", error)
          toast.error("Failed to save learning page")
        })
    }
  }, [editor, setSaveStatus])

  if (!editor) return <></>

  const bubbleMenuButtonClass =
    "border-none text-black text-sm font-medium p-1 hover:bg-gray-200 rounded-md"

  return (
    <div className="relative">
      <span>
        Press{" "}
        <kbd className="inline-block px-1 rounded-md bg-gray-300">"/"</kbd> to
        open the command menu.
      </span>
      <span className="flex items-center">
        To save your work, click
        <button
          onClick={handleSave}
          className="ml-2 px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
        >
          Save
        </button>
      </span>

      <div className="relative p-4 m-4 border border-gray-400 rounded-lg">
        <div className="absolute top-2 right-2">
          {saveStatus === "Saved" ? (
            <span className="text-sm font-normal text-gray-600 uppercase">
              Saved
            </span>
          ) : (
            <span className="text-sm font-normal text-red-600 uppercase">
              Unsaved
            </span>
          )}
        </div>

        <BubbleMenu
          className="flex bg-gray-300 gap-2 p-1 rounded-md border border-gray-400"
          editor={editor}
        >
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
