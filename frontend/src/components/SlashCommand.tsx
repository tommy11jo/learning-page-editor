import { Extension, Range, ReactRenderer } from "@tiptap/react"
import { Editor } from "@tiptap/core"
import { Heading1, Heading2, Text, List, Sigma } from "lucide-react"
import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import Suggestion from "@tiptap/suggestion"
import tippy from "tippy.js"
import "katex/dist/katex.min.css"
import { latexApi } from "../api/latex"

// adapted the code from https://github.com/steven-tey/novel/blob/main/packages/core/src/ui/editor/extensions/slash-command.tsx

interface CommandProps {
  editor: Editor
  range: Range
}

interface CommandItemProps {
  title: string
  description: string
  icon: ReactNode
}

const getSuggestionItems = (config: SlashCommandConfig) => {
  return [
    {
      title: "Text",
      description: "Just start typing with plain text.",
      searchTerms: ["p", "paragraph"],
      icon: <Text size={18} />,
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleNode("paragraph", "paragraph")
          .run()
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading.",
      searchTerms: ["title"],
      icon: <Heading1 size={18} />,
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run()
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading.",
      searchTerms: ["subtitle"],
      icon: <Heading2 size={18} />,
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run()
      },
    },
    {
      title: "MCQ",
      description: "Multiple choice question.",
      searchTerms: ["mcq", "multiple choice"],
      icon: <List size={18} />,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).run()
        config.openMCQModal()
      },
    },
    {
      title: "LaTex AI",
      description: "Describe a math formula in english.",
      searchTerms: ["latex", "formula"],
      icon: <Sigma size={18} />,
      command: ({ editor, range }: CommandProps) => {
        handleLatexInput(editor)
        editor.chain().focus().deleteRange(range).run()
      },
    },
  ]
}

const CommandList = ({
  items,
  command,
}: {
  items: CommandItemProps[]
  command: (item: CommandItemProps) => void
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index]
      if (item) {
        command(item)
      }
    },
    [command, items]
  )

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"]
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault()
        if (e.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length)
          return true
        }
        if (e.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % items.length)
          return true
        }
        if (e.key === "Enter") {
          selectItem(selectedIndex)
          return true
        }
        return false
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [items, selectedIndex, setSelectedIndex, selectItem])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const commandListContainer = useRef<HTMLDivElement>(null)

  return (
    <div
      id="slash-command"
      ref={commandListContainer}
      className="z-3000 w-50 max-h-[330px] h-auto overflow-y-auto rounded-md bg-gray-300 p-2 shadow-md transition-all border border-gray-400"
    >
      {items.map((item: CommandItemProps, index) => {
        return (
          <button
            className={`
              flex w-full items-center rounded-md gap-2 px-2 py-1 text-left
              ${index === selectedIndex ? "bg-gray-100" : ""}
            `}
            key={index}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-dark-200">
              {item.icon}
            </div>
            <div className="flex flex-col">
              <p className="text-md font-medium">{item.title}</p>
              <p className="text-xs">{item.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

const handleLatexInput = (editor: Editor) => {
  // Create an input element
  const { from, to } = editor.state.selection
  const coords = editor.view.coordsAtPos(from)

  const inputBox = document.createElement("div")
  inputBox.style.position = "absolute"
  inputBox.style.left = `${coords.left}px`
  inputBox.style.top = `${coords.top + window.scrollY}px`
  inputBox.style.zIndex = "100"
  inputBox.style.display = "flex"
  inputBox.style.flexDirection = "column"

  const input = document.createElement("input")
  input.style.color = "black"

  const subtext = document.createElement("span")
  subtext.textContent = "type enter to generate"
  subtext.style.color = "gray"
  subtext.style.fontSize = "12px"
  subtext.style.marginTop = "2px"

  inputBox.appendChild(input)
  inputBox.appendChild(subtext)

  // Append the input box to the editor
  // Append to the body for absolute positioning parent
  document.body.appendChild(inputBox)

  // Focus the input
  setTimeout(() => input.focus(), 0)

  // Handle the 'Enter' event
  // Also in the capture phase, to override the previous one
  inputBox.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      event.stopPropagation()

      document.body.removeChild(inputBox)
      subtext.textContent = "generating..."
      document.body.appendChild(inputBox)

      const englishText = input.value
      const result = await latexApi.englishToLatex(englishText)
      const latex = `$${result}$`
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent(latex)
        .enter()
        .run()

      inputBox.remove()
    }
  })
}

const renderItems = () => {
  let component: ReactRenderer | null = null
  let popup: any | null = null

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      })

      // @ts-ignore
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      })
    },
    onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
      component?.updateProps(props)
      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      })
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === "Escape") {
        popup[0].hide()
      }
    },
    onExit: () => {
      component?.destroy()
    },
  }
}

const Command = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: Range
          props: any
        }) => {
          props.command({ editor, range })
        },
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
export { CommandList }

interface SlashCommandConfig {
  openMCQModal: () => void
}

const SlashCommandExtension = (config: SlashCommandConfig) =>
  Command.configure({
    suggestion: {
      items: () => getSuggestionItems(config),
      render: renderItems,
    },
  })

export default SlashCommandExtension
