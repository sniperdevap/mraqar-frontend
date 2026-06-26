export default function Loading() {
  return (
    <main className="min-h-[calc(100vh-150px)] bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6">
        <div className="h-10 w-2/3 rounded-lg bg-gray-100 sm:w-1/3" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-44 rounded-lg border border-gray-100 bg-gray-50"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
