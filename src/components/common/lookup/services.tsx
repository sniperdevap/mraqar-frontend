'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ServicesCards } from './services-cards';
import { ServicesTableView } from './services-table-view';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: string;
  total: number;
}

interface ServicesTableProps {
  services: Service[];
  onAddService: () => void;
  onEditService: (id: string) => void;
  onDeleteService: (id: string) => void;
  onUpdateService?: (id: string, updates: { price?: number; quantity?: string }) => void;
}

export function Services({ services, onAddService, onEditService, onDeleteService, onUpdateService }: ServicesTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'price' | 'quantity' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleDoubleClick = (id: string, field: 'price' | 'quantity', currentValue: number | string) => {
    setEditingCell({ id, field });
    setEditValue(field === 'price' ? String(currentValue) : String(currentValue));
  };

  const handleBlur = () => {
    if (editingCell && onUpdateService) {
      const service = services.find(s => s.id === editingCell.id);
      if (service) {
        if (editingCell.field === 'price') {
          const newPrice = parseFloat(editValue) || 0;
          if (newPrice >= 0 && newPrice !== service.price) {
            onUpdateService(editingCell.id, { price: newPrice });
          }
        } else if (editingCell.field === 'quantity') {
          const newQuantity = editValue.trim() || '01';
          if (newQuantity !== service.quantity) {
            onUpdateService(editingCell.id, { quantity: newQuantity });
          }
        }
      }
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Service Button */}
      <div className="flex justify-end">
        <Button onClick={onAddService} className="bg-blue-primary hover:bg-blue-primary/90 text-white px-3 py-3 rounded-lg font-semibold text-base mt-5 md:mt-0">
          Add Service
        </Button>
      </div>

      {/* Mobile/Tablet Cards View */}
      <div className="md:hidden">
        <ServicesCards
          services={services}
          onEditService={onEditService}
          onDeleteService={onDeleteService}
          editingCell={editingCell}
          editValue={editValue}
          inputRef={inputRef}
          onDoubleClick={handleDoubleClick}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          setEditValue={setEditValue}
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <ServicesTableView
          services={services}
          onEditService={onEditService}
          onDeleteService={onDeleteService}
          editingCell={editingCell}
          editValue={editValue}
          inputRef={inputRef}
          onDoubleClick={handleDoubleClick}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          setEditValue={setEditValue}
        />
      </div>
    </div>
  );
}

// Export as ServicesTable for backward compatibility
export const ServicesTable = Services;
