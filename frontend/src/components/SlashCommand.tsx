import { Extension, Range, ReactRenderer } from "@tiptap/react"
import { Editor } from "@tiptap/core"
import { Heading1, Heading2, Text } from "lucide-react"
import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import Suggestion from "@tiptap/suggestion"
import tippy from "tippy.js"

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

const getSuggestionItems = () => {
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

  return items.length > 0 ? (
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
  ) : (
    <></>
  )
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
      popup[0].destroy()
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

const SlashCommandExtension = Command.configure({
  suggestion: {
    items: getSuggestionItems,
    render: renderItems,
  },
})
export default SlashCommandExtension
