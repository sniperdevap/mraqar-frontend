'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Service } from './services';
import { ServiceLineModal } from './service-line-modal';

interface AddServiceLineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddServices: (serviceIds: string[]) => void;
  availableServices: Service[];
  onServiceCreated?: (service: Omit<Service, 'id' | 'quantity' | 'total'>) => Service;
}

export function AddServiceLineModal({ open, onOpenChange, onAddServices, availableServices, onServiceCreated }: AddServiceLineModalProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newlyCreatedService, setNewlyCreatedService] = useState<Service | null>(null);
  const [localAvailableServices, setLocalAvailableServices] = useState<Service[]>(availableServices);

  useEffect(() => {
    setLocalAvailableServices(availableServices);
  }, [availableServices]);

  useEffect(() => {
    if (!open) {
      setSelectedServiceIds([]);
      setNewlyCreatedService(null);
    }
  }, [open]);

  useEffect(() => {
    if (newlyCreatedService && open) {
      // Add the newly created service to available services
      setLocalAvailableServices(prev => {
        if (!prev.find(s => s.id === newlyCreatedService.id)) {
          return [...prev, newlyCreatedService];
        }
        return prev;
      });

      // Auto-select the newly created service
      setSelectedServiceIds(prev => {
        if (!prev.includes(newlyCreatedService.id)) {
          return [...prev, newlyCreatedService.id];
        }
        return prev;
      });
      setNewlyCreatedService(null);
    }
  }, [newlyCreatedService, open]);

  const handleAddService = () => {
    if (selectedServiceIds.length > 0) {
      onAddServices(selectedServiceIds);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setSelectedServiceIds([]);
    onOpenChange(false);
  };

  const handleCreateService = async (serviceData: Omit<Service, 'id' | 'quantity' | 'total'>): Promise<void> => {
    if (onServiceCreated) {
      const newService = onServiceCreated(serviceData);
      setNewlyCreatedService(newService);
    }
    setIsCreateModalOpen(false);
  };

  const multiSelectOptions = localAvailableServices.map(service => ({
    value: service.id,
    label: service.name,
  }));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl p-8 md:p-10 bg-white" showCloseButton={false}>
          <DialogHeader className="text-left space-y-1 mb-4">
            <DialogTitle className="text-3xl font-bold text-primary leading-tight mb-0">Add Service Line</DialogTitle>
            <DialogDescription className="text-base font-normal text-secondary/60">Add service line details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add Items Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-lg font-semibold text-primary">Add Items</label>
                <button onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer text-blue-primary hover:text-blue-primary/80 underline text-sm font-semibold whitespace-nowrap">
                  Create New Service
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative w-full">
                  <MultiSelect options={multiSelectOptions} value={selectedServiceIds} onChange={setSelectedServiceIds} placeholder="e.g Auto Glass" className="w-full" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-3 mt-32 -mx-8 md:-mx-10 px-8 md:px-10">
            <Button onClick={handleCancel} variant="outline" className="border-[#E2E2E2] text-secondary flex-1 md:flex-none md:w-36 hover:bg-gray-50 px-6 rounded-lg font-normal text-base h-11">
              Cancel
            </Button>
            <Button
              onClick={handleAddService}
              disabled={selectedServiceIds.length === 0}
              className="bg-blue-primary hover:bg-blue-primary/90 text-white flex-1 md:flex-none md:w-36 px-6 rounded-lg font-semibold text-base disabled:!bg-[#A3A3A3] disabled:!cursor-not-allowed disabled:hover:!bg-gray-300 disabled:!opacity-100 h-11"
            >
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Service Modal */}
      <ServiceLineModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSave={handleCreateService} editData={null} />
    </>
  );
}
