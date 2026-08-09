export default function Progress() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-gray-500 text-sm">Overall Progress</p>
          <p className="text-3xl font-bold mt-2">0%</p>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-black h-2 rounded-full"
              style={{ width: "0%" }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-gray-500 text-sm">Completed Tasks</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-gray-500 text-sm">Active Tasks</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Team Progress</h2>

        <p className="text-gray-500">
          Team progress will appear here once tasks are assigned.
        </p>
      </div>
    </div>
  );
}