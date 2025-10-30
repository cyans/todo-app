function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📝 To-Do List
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tasks efficiently
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Welcome to To-Do App! 🚀
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Frontend and Backend are successfully set up.
            </p>
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✅ Phase 1 (SETUP-ENV-001) is in progress
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
