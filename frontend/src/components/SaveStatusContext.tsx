import React, { createContext, useContext, useState } from "react"

type SaveStatus = "Saved" | "Unsaved"

interface SaveStatusContextType {
  saveStatus: SaveStatus
  setSaveStatus: React.Dispatch<React.SetStateAction<SaveStatus>>
}

const SaveStatusContext = createContext<SaveStatusContextType | undefined>(
  undefined
)

export const SaveStatusProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved")

  return (
    <SaveStatusContext.Provider value={{ saveStatus, setSaveStatus }}>
      {children}
    </SaveStatusContext.Provider>
  )
}

export const useSaveStatus = () => {
  const context = useContext(SaveStatusContext)
  if (context === undefined) {
    throw new Error("useSaveStatus must be used within a SaveStatusProvider")
  }
  return context
}
