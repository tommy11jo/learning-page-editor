const Header = () => {
  return (
    <header className="p-4">
      <div className="container mx-auto flex justify-between items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-black">
            Learning Page Builder
          </h1>
          <p className="text-sm text-gray-600">
            A notion-like editor for authoring rich media for course content
          </p>
          <p className="text-sm text-gray-600">
            Press "/" to open the command menu.
          </p>
        </div>
        <a
          href="https://github.com/tommy11jo/learning-page-builder"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-gray-900 underline"
        >
          Github
        </a>
      </div>
      <hr className="border-t border-gray-700 w-full mt-4" />
    </header>
  )
}

export default Header
