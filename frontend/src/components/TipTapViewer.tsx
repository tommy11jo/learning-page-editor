import React, { useEffect, useRef } from "react"
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

  const initialContentLoaded = useRef(false)
  useEffect(() => {
    const fetchLearningPage = async () => {
      if (!editor || initialContentLoaded.current) return
      try {
        const page = await learningPageApi.getLearningPage()
        editor?.commands.setContent(JSON.parse(page.content))
      } catch (error) {
        console.error("Error fetching learning page:", error)
      }
      initialContentLoaded.current = true
    }
    fetchLearningPage()
  }, [editor])

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
