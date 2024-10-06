import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Extension } from "@tiptap/core"
import { Command } from "@tiptap/core"
import SlashCommandExtension from "./SlashCommand"
import Placeholder from "@tiptap/extension-placeholder"

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
  const editor = useEditor({
    extensions: [
      StarterKit,
      SlashCommandExtension,
      AppendTextExtension,
      Placeholder.configure({
        placeholder: "Write here...",
      }),
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
  })

  if (!editor) return <></>

  const bubbleMenuButtonClass =
    "border-none text-black text-sm font-medium p-1 hover:bg-gray-200 rounded-md"

  return (
    <div
      onClick={() => {
        editor.chain().focus().run()
      }}
    >
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
      <EditorContent editor={editor} />
    </div>
  )
}

export default TipTapEditor
