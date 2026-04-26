'use client';

import React, { useEffect, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  ColumnOrderState,
  Row,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Checkbox } from '../ui/checkbox';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Icon } from '../ui/icon';
import { ASSETS } from '@/lib/assets';
import { DateRangePicker } from '../ui/date-range-picker';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableSearch?: boolean;
  enableFilters?: boolean;
  enablePagination?: boolean;
  pagination?: boolean;
  rowsPerPage?: number;
  enableSorting?: boolean;
  enableRowDrag?: boolean;
  enableColumnDrag?: boolean;
  enableSelection?: boolean;
  enableActions?: boolean;
  enableDateRange?: boolean;
  enableExport?: boolean;
  filtersConfig?: Record<string, string[]>;
  onRowSelect?: (selectedRows: TData[]) => void;
  actionRenderer?: (row: TData) => React.ReactNode;
}

// Draggable Row Component
function DraggableRow<TData>({ row, children }: { row: Row<TData>; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </TableRow>
  );
}

// Draggable Header Component
function DraggableHeader<TData>({ header, children }: { header: ColumnDef<TData, unknown>; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: header.id! });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <TableHead ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </TableHead>
  );
}

export function DataTable<TData, TValue>({
  columns: initialColumns,
  data,
  enableSearch,
  enableFilters,
  enablePagination,
  pagination,
  rowsPerPage,
  enableSorting,
  enableRowDrag,
  enableColumnDrag,
  enableSelection,
  enableActions,
  enableExport,
  enableDateRange,
  filtersConfig,
  onRowSelect,
  actionRenderer,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowOrder, setRowOrder] = useState(() => data.map((_, i) => i.toString()));
  const [selectedRows, setSelectedRows] = useState<TData[]>([]);

  const baseColumns: ColumnDef<TData, TValue>[] = [
    ...(enableSelection
      ? [
          {
            id: 'select',
            header: ({ table }: { table: ReturnType<typeof useReactTable<TData>> }) => (
              <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={value => {
                  table.toggleAllRowsSelected(!!value);
                  const selected = value ? data : [];
                  setSelectedRows(selected);
                  onRowSelect?.(selected);
                }}
                aria-label="Select all"
              />
            ),
            cell: ({ row }: { row: Row<TData> }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={value => {
                  row.toggleSelected(!!value);
                  const newSelected = value ? [...selectedRows, row.original as TData] : selectedRows.filter(r => r !== row.original);
                  setSelectedRows(newSelected);
                  onRowSelect?.(newSelected);
                }}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          } as ColumnDef<TData, TValue>,
        ]
      : []),
    ...initialColumns,
    ...(enableActions
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: { row: Row<TData> }) => (actionRenderer ? actionRenderer(row.original as TData) : null),
            enableSorting: false,
            enableHiding: false,
          } as ColumnDef<TData, TValue>,
        ]
      : []),
  ];

  const defaultColumnOrder = baseColumns.map(col => ('id' in col ? col.id! : ''));
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns: baseColumns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: !!enableSorting,
    enableRowSelection: !!enableSelection,
  });

  useEffect(() => {
    table.setPageSize(rowsPerPage ?? 10);
  }, [rowsPerPage, table]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (enableRowDrag && rowOrder.includes(active.id as string) && rowOrder.includes(over.id as string)) {
      setRowOrder(prev => arrayMove(prev, prev.indexOf(active.id as string), prev.indexOf(over.id as string)));
    }
    if (enableColumnDrag && columnOrder.includes(active.id as string) && columnOrder.includes(over.id as string)) {
      if (['select', 'actions'].includes(active.id as string) || ['select', 'actions'].includes(over.id as string)) return;
      setColumnOrder(prev => arrayMove(prev, prev.indexOf(active.id as string), prev.indexOf(over.id as string)));
    }
  };

  const exportToCSV = () => {
    const visibleColumns = table.getAllColumns().filter(col => col.getIsVisible() && !['select', 'actions'].includes(col.id));
    const headers = visibleColumns.map(col => col.id);
    const rows = table.getRowModel().rows.map(row =>
      row.getVisibleCells().map(cell => {
        const value = cell.getValue();
        return typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value);
      })
    );
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const draggableColumnIds = columnOrder.filter(id => id !== 'select' && id !== 'actions');

  return (
    <div className="space-y-4">
      {(enableSearch || enableFilters || enableExport) && (
        <div className="flex flex-wrap gap-2 items-center justify-between w-full">
          {enableSearch && (
            <div className="flex items-center gap-0 border border-primary-light rounded-md px-3 py-0 w-full sm:max-w-xs bg-white">
              <Icon src={ASSETS.images.icons.search} size="md" />
              <Input placeholder="Search..." value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} className="border-0 shadow-none focus:ring-0 flex-1" />
            </div>
          )}
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto justify-end sm:justify-start">
            {enableFilters &&
              filtersConfig &&
              Object.entries(filtersConfig).map(([key, options]) => (
                <Select key={key} onValueChange={value => table.getColumn(key)?.setFilterValue(value === '__all__' ? undefined : value)}>
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue placeholder={`All ${key}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All {key}</SelectItem>
                    {options.map(value => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            {enableDateRange && (
              <div className="w-full sm:w-auto">
                <DateRangePicker />
              </div>
            )}
            {enableExport && (
              <Button variant="table" onClick={exportToCSV} className="w-full sm:w-auto">
                Export CSV <Icon src={ASSETS.images.icons.download} size="sm" className="text-gray-500" />
              </Button>
            )}
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="rounded-md border-none">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  <SortableContext items={enableColumnDrag ? draggableColumnIds : []} strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map(header =>
                      enableColumnDrag && !['select', 'actions'].includes(header.id) ? (
                        <DraggableHeader key={header.id} header={header.column.columnDef}>
                          {header.isPlaceholder ? null : (
                            <div className={`flex items-center ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`} onClick={header.column.getToggleSortingHandler()}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
                            </div>
                          )}
                        </DraggableHeader>
                      ) : (
                        <TableHead key={header.id} className={`${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`} onClick={header.column.getToggleSortingHandler()}>
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
                            </div>
                          )}
                        </TableHead>
                      )
                    )}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              <SortableContext items={enableRowDrag ? rowOrder : []} strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row =>
                    enableRowDrag ? (
                      <DraggableRow key={row.id} row={row}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </DraggableRow>
                    ) : (
                      <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    )
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={initialColumns.length + (enableSelection ? 1 : 0) + (enableActions ? 1 : 0)} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </div>
      </DndContext>

      {enablePagination && pagination && (
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalItems={table.getFilteredRowModel().rows.length}
          pageSize={table.getState().pagination.pageSize}
          onPageChange={page => table.setPageIndex(page - 1)}
          className="mt-4"
        />
      )}
    </div>
  );
}
