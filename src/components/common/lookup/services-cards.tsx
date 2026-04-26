'use client';

import { RefObject } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import type { Service } from './services';

interface ServicesCardsProps {
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

export function ServicesCards({ services, onEditService, onDeleteService, editingCell, editValue, inputRef, onDoubleClick, onBlur, onKeyDown, setEditValue }: ServicesCardsProps) {
  const handleDelete = (id: string) => {
    onDeleteService(id);
  };

  const handleEdit = (id: string) => {
    onEditService(id);
  };

  if (services.length === 0) {
    return (
      <div className="text-center text-secondary py-12">
        <p>No Data Found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map(service => (
        <div key={service.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          {/* Service Information - Two Column Layout */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-normal text-[#6A7282] mb-1">Item</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#2C2C2C]">{service.name}</p>
                <p className="text-xs text-gray-500 break-words">{service.description}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-normal text-[#6A7282] mb-1">Price</p>
              <div onClick={() => onDoubleClick(service.id, 'price', service.price)} className="cursor-pointer">
                {editingCell?.id === service.id && editingCell?.field === 'price' ? (
                  <Input
                    ref={inputRef}
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    className="w-20 h-8 text-sm border-secondary focus:border-secondary"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <p className="text-sm font-normal text-[#2C2C2C] h-8">{formatPrice(service.price)}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-normal text-[#6A7282] mb-1">Qty</p>
              <div onClick={() => onDoubleClick(service.id, 'quantity', service.quantity)} className="cursor-pointer">
                {editingCell?.id === service.id && editingCell?.field === 'quantity' ? (
                  <Input
                    ref={inputRef}
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    className="w-16 h-8 text-sm border-secondary focus:border-secondary"
                    placeholder="01"
                  />
                ) : (
                  <p className="text-sm font-normal text-[#2C2C2C] h-8">{service.quantity}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-normal text-[#6A7282] mb-1">Total</p>
              <p className="text-sm font-medium text-[#2C2C2C]">{formatPrice(service.total)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleEdit(service.id)}
              className="px-4 h-[26px] rounded-sm border border-gray-300 bg-white hover:bg-gray-50 hover:cursor-pointer transition-colors"
              aria-label="Edit service"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
            <ConfirmationDialog
              trigger={
                <button className="px-4 h-[26px] rounded-sm border border-gray-300 bg-white hover:bg-gray-50 hover:cursor-pointer transition-colors" aria-label="Delete service">
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
        </div>
      ))}
    </div>
  );
}
