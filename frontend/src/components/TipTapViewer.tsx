import React, { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { MCQNode } from "./MCQNode"
import { learningPageApi } from "../api/learningPage"

const TipTapViewer: React.FC = () => {
  const editor = useEditor({
    extensions: [StarterKit, MCQNode],
    content: "",
    editable: false,
  })

  useEffect(() => {
    const fetchLearningPage = async () => {
      try {
        const page = await learningPageApi.getLearningPage()
        editor?.commands.setContent(JSON.parse(page.content))
      } catch (error) {
        console.error("Error fetching learning page:", error)
      }
    }

    fetchLearningPage()
  }, [editor?.commands])

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
