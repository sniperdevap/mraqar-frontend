'use client';

import { RefObject } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import type { Service } from './services';

interface ServicesTableViewProps {
  services: Service[];
  onEditService: (id: string) => void;
  onDeleteService: (id: string) => void;
  editingCell: { id: string; field: 'price' | 'quantity' } | null;
  editValue: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onDoubleClick: (id: string, field: 'price' | 'quantity', currentValue: number | string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setEditValue: (value: string) => void;
}

export function ServicesTableView({ services, onEditService, onDeleteService, editingCell, editValue, inputRef, onDoubleClick, onBlur, onKeyDown, setEditValue }: ServicesTableViewProps) {
  const handleDelete = (id: string) => {
    onDeleteService(id);
  };

  const handleEdit = (id: string) => {
    onEditService(id);
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-sm px-6 pb-2">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200">
            <TableHead className="font-semibold text-lg text-primary h-20 text-left px-0">Item</TableHead>
            <TableHead className="font-semibold text-lg text-primary h-20 text-left w-2/5 md:w-1/5">Price</TableHead>
            <TableHead className="font-semibold text-lg text-primary h-20 text-left w-2/5 md:w-1/5">Qty</TableHead>
            <TableHead className="font-semibold text-lg text-primary h-20 text-left">Total</TableHead>
            <TableHead className="font-semibold text-lg text-primary h-20 text-left">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length > 0 ? (
            services.map((service, index) => (
              <TableRow key={service.id} className={`border-gray-200 py-4 ${index === services.length - 1 ? 'border-b-0' : ''}`}>
                <TableCell className="text-secondary text-sm px-0">
                  <div className="space-y-2">
                    <div className="font-medium text-gray-900">{service.name}</div>
                    <div className="text-xs text-gray-500 break-words whitespace-normal">{service.description}</div>
                  </div>
                </TableCell>
                <TableCell className="text-secondary text-sm h-6 text-left cursor-pointer" onClick={() => onDoubleClick(service.id, 'price', service.price)}>
                  {editingCell?.id === service.id && editingCell?.field === 'price' ? (
                    <Input
                      ref={inputRef}
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={onBlur}
                      onKeyDown={onKeyDown}
                      className="w-20 h-6 text-sm border-secondary focus:border-secondary"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    formatPrice(service.price)
                  )}
                </TableCell>
                <TableCell className="text-secondary text-sm h-16 text-left cursor-pointer" onClick={() => onDoubleClick(service.id, 'quantity', service.quantity)}>
                  {editingCell?.id === service.id && editingCell?.field === 'quantity' ? (
                    <Input
                      ref={inputRef}
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={onBlur}
                      onKeyDown={onKeyDown}
                      className="w-16 h-6 text-sm border-secondary focus:border-secondary"
                      placeholder="01"
                    />
                  ) : (
                    service.quantity
                  )}
                </TableCell>
                <TableCell className="text-secondary text-sm h-16 text-left font-medium">{formatPrice(service.total)}</TableCell>
                <TableCell className="text-secondary text-sm h-16">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(service.id)}
                      className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                      aria-label="Edit service"
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                    <ConfirmationDialog
                      trigger={
                        <button className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer" aria-label="Delete service">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      }
                      icon={{ src: '/images/icons/delete-white.svg', alt: 'Delete', bgColor: 'bg-red-primary' }}
                      title="Are you sure you want to delete?"
                      description="If you delete now, this item will be permanently removed and cannot be recovered."
                      confirmButtonText="Yes"
                      cancelButtonText="No"
                      onConfirm={() => handleDelete(service.id)}
                      onCancel={() => {}}
                      buttonOrder="reversed"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-secondary h-24">
                No Data Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
