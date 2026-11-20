import { ErrorState } from '../common/States.jsx';

/**
 * Compact data table used by every admin list screen.
 * `columns`: [{ key, header, render(row), className }]
 */
export default function AdminTable({
  columns,
  rows = [],
  loading = false,
  error = '',
  onRetry,
  emptyMessage = 'Belum ada data.',
  rowKey = '_id',
}) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="border-b border-line bg-cream/60">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`admin-th ${column.className || ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && !rows.length
              ? Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} className="border-b border-line last:border-0">
                    {columns.map((column) => (
                      <td key={column.key} className="admin-td">
                        <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-cocoa/10" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={row[rowKey] || row.id}
                    className="border-b border-line transition-colors last:border-0 hover:bg-cream/40"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={`admin-td ${column.className || ''}`}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}

            {!loading && !rows.length && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <p className="font-display text-lg text-cocoa">{emptyMessage}</p>
                  <p className="mt-1 font-sans text-xs text-cocoa-soft">
                    Tambahkan data baru atau ubah filter yang aktif.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
