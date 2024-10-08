import React, { createContext, useContext, useEffect, useState } from "react"
import { mcqApi, Submission } from "../api/mcq"
type SaveStatus = "Saved" | "Unsaved"
export enum EditorMode {
  Edit = "edit",
  View = "view",
}
interface EditorContextType {
  saveStatus: SaveStatus
  setSaveStatus: React.Dispatch<React.SetStateAction<SaveStatus>>
  submissions: Submission[]
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>
  mode: EditorMode
  setMode: (mode: EditorMode) => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export const EditorProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [mode, setMode] = useState<EditorMode>(EditorMode.Edit)

  useEffect(() => {
    const fetchSubmissions = async () => {
      const submissions = await mcqApi.getSubmissions()
      setSubmissions(submissions)
    }
    fetchSubmissions()
  }, [mode])
  return (
    <EditorContext.Provider
      value={{
        saveStatus,
        setSaveStatus,
        submissions,
        setSubmissions,
        mode,
        setMode,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export const useTipTapEditor = () => {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider")
  }
  return context
}
