import { BubbleMenu, Editor, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Extension } from "@tiptap/core"
import { Command } from "@tiptap/core"
import SlashCommandExtension from "./SlashCommand"
import Placeholder from "@tiptap/extension-placeholder"
import { MCQModal, MCQData } from "./MCQModal"
import { MCQNode } from "./MCQNode"
import { useState, useCallback } from "react"

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

const editorHTMLString = `
    <p>Select any text to see the menu. </p>
    <p>Select <em>this text</em> to see the menu showing italics.</p>
    <p>Try the append text command after <strong>here:</strong></p>
    <p>Neat, isn’t it?</p>
`

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
    content: editorHTMLString,
    onUpdate: ({ editor }) => {
      const lastNode = editor.state.doc.lastChild
      if (lastNode && lastNode.type.name !== "paragraph") {
        editor.commands.insertContentAt(
          editor.state.doc.content.size,
          "<p></p>"
        )
      }
    },
  })

  const handleMCQSubmit = (data: MCQData, editor: Editor) => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "mcqNode",
          attrs: { ...data },
        })
        .run()
    }
  }

  if (!editor) return <></>

  const bubbleMenuButtonClass =
    "border-none text-black text-sm font-medium p-1 hover:bg-gray-200 rounded-md"

  return (
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
        onSubmit={handleMCQSubmit}
        editor={editor}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        initQuestion={"Choose the correct answer"}
        initOptions={["Option A", "Option B", "Option C", "Option D"]}
      />
    </div>
  )
}

export default TipTapEditor
