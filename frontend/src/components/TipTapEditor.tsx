import "../editor.css"
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Extension } from "@tiptap/core"
import { Command } from "@tiptap/core"

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

const editorJSXString = `
    <p>Select any text to see the menu. </p>
    <p>Select <em>this text</em> to see the menu showing italics.</p>
    <p>Try the append text command after <strong>here:</strong></p>
    <p>Neat, isn’t it?</p>
`

const TipTapEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit, AppendTextExtension],
    content: editorJSXString,
  })

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run()
      }}
      className="relative border border-gray-600 rounded-md p-4"
    >
      {editor && (
        <BubbleMenu
          className="bubble-menu"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <button
            onClick={() => editor.chain().focus().appendText().run()}
            className={editor.isActive("appendText") ? "is-active" : ""}
          >
            Append Text
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "is-active" : ""}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "is-active" : ""}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "is-active" : ""}
          >
            Strike
          </button>
        </BubbleMenu>
      )}
      {editor && (
        <FloatingMenu
          className="floating-menu"
          tippyOptions={{ duration: 20 }}
          editor={editor}
        >
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={
              editor.isActive("heading", { level: 1 }) ? "is-active" : ""
            }
          >
            H1
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor.isActive("heading", { level: 2 }) ? "is-active" : ""
            }
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "is-active" : ""}
          >
            Bullet List
          </button>
        </FloatingMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

export default TipTapEditor
