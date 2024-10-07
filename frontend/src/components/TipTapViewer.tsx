import React from "react"
import { EditorContent, JSONContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { MCQNode } from "./MCQNode"

interface TipTapViewerProps {
  jsonContent: JSONContent | JSONContent[]
}

const TipTapViewer: React.FC<TipTapViewerProps> = ({ jsonContent }) => {
  const editor = useEditor({
    extensions: [StarterKit, MCQNode],
    content: jsonContent,
    editable: false,
  })

  if (!editor) {
    return null
  }

  return (
    <div className="p-4 m-4">
      <EditorContent editor={editor} />
    </div>
  )
}

export default TipTapViewer
