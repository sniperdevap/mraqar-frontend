'use client';

import { useState, useRef, useMemo } from 'react';
import { VehicleInfo } from './vehicle-info';
import { Breadcrumb } from '../breadcrumb';
import { ServicesTable, type Service } from './services';
import { NotesSection } from './notes-section';
import { CustomerDetailsForm, type CustomerDetailsFormRef } from './customer-details-form';
import { QuoteSummary } from './quote-summary';
import { ServiceLineModal } from './service-line-modal';
import { AddServiceLineModal } from './add-service-line-modal';
import { SendQuoteModal } from './send-quote-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import ROLES from '@/constants/roles';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

// Calculate totals from services
const calculateTotals = (services: Service[]) => {
  // Calculate subtotal by summing all service totals
  const subtotalAmount = services.reduce((sum, service) => {
    return sum + service.total;
  }, 0);

  // Calculate tax (13% tax rate)
  const taxRate = 0.13;
  const taxAmount = subtotalAmount * taxRate;

  // Calculate total
  const totalAmount = subtotalAmount + taxAmount;

  return {
    subtotal: formatPrice(subtotalAmount),
    tax: formatPrice(taxAmount),
    total: formatPrice(totalAmount),
  };
};

// Calculate service total from price and quantity
const calculateServiceTotal = (price: number, quantity: string): number => {
  const quantityNum = parseInt(quantity, 10) || 1;
  return price * quantityNum;
};

interface LookupViewProps {
  vin?: string;
  partName?: string;
  partNumber?: string;
  OEM?: string;
  calibrationType?: string;
}

// Mock data - will be replaced with actual data from API
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Auto Glass Miami',
    description: 'Offers premium glass solutions',
    price: 750,
    quantity: '02',
    total: 1500,
  },
  {
    id: '2',
    name: 'Crystal Clear Glass',
    description: 'Offers premium glass solutions',
    price: 120,
    quantity: '01',
    total: 120,
  },
];

// Service templates library - available services that can be added to quotes
const initialServiceTemplates: Omit<Service, 'id' | 'quantity' | 'total'>[] = [
  {
    name: ' Auto Glass Miami',
    description: 'Offers premium glass solutions',
    price: 750,
  },
  {
    name: 'Crystal Clear Glass',
    description: 'Offers premium glass solutions',
    price: 120,
  },
  {
    name: 'Perfect Pane Auto',
    description: 'Professional auto glass installation',
    price: 350,
  },
  {
    name: 'ShineMax Auto Glass',
    description: 'Offers premium glass solutions',
    price: 350,
  },
  {
    name: 'NextGen Auto Glass',
    description: 'Offers premium glass solutions',
    price: 350,
  },
];

export function LookupView({ vin = 'W1K5J4HB5MN245314', partName = '2022 Honda Civic', partNumber = 'DW2552', OEM = '1A2B3C', calibrationType = 'Static' }: LookupViewProps) {
  // State management
  const [services, setServices] = useState<Service[]>(mockServices);
  const [serviceTemplates, setServiceTemplates] = useState<Omit<Service, 'id' | 'quantity' | 'total'>[]>(initialServiceTemplates);
  const [internalNotes, setInternalNotes] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [canSendQuote, setCanSendQuote] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSendQuoteModalOpen, setIsSendQuoteModalOpen] = useState(false);
  const customerDetailsFormRef = useRef<CustomerDetailsFormRef>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const source = searchParams.get('source');

  // Determine basePath from user role
  const basePath = useMemo(() => {
    if (user?.role === ROLES.BUSINESS_OWNER) {
      return '/business';
    }
    if (user?.role === ROLES.STAFF) {
      return '/staff';
    }
    return '/business'; // Default fallback
  }, [user?.role]);

  // Calculate totals dynamically from services
  const { subtotal, tax, total } = useMemo(() => calculateTotals(services), [services]);

  // Handlers
  const handleAddService = () => {
    setIsAddServiceModalOpen(true);
  };

  const handleEditService = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setEditingService(service);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveServiceTemplate = (serviceData: Omit<Service, 'id' | 'quantity' | 'total'>) => {
    // Add to service templates library
    // Calculate the new service ID based on current templates length
    const newTemplateIndex = serviceTemplates.length;
    setServiceTemplates([...serviceTemplates, serviceData]);

    // Return the service with an ID matching the template format for immediate selection
    const calculatedTotal = calculateServiceTotal(serviceData.price, '01');
    const newService: Service = {
      id: `template-${newTemplateIndex}`,
      ...serviceData,
      quantity: '01',
      total: calculatedTotal,
    };
    return newService;
  };

  const handleSaveEditedService = async (serviceData: Omit<Service, 'id' | 'quantity' | 'total'>): Promise<void> => {
    if (editingService) {
      const updatedTotal = calculateServiceTotal(serviceData.price, editingService.quantity);
      setServices(services.map(service => (service.id === editingService.id ? { ...service, ...serviceData, total: updatedTotal } : service)));
      toast.success('Service updated successfully!');
    }
    setIsEditModalOpen(false);
    setEditingService(null);
  };

  const handleAddServicesToQuote = (serviceIds: string[]) => {
    // Map selected service IDs to actual service templates
    const newServices: Service[] = serviceIds
      .map((id, index) => {
        // Extract template index from ID (format: "template-0", "template-1", etc.)
        const templateIndex = parseInt(id.replace('template-', ''), 10);
        const template = serviceTemplates[templateIndex];

        if (!template) {
          // Fallback if template not found
          return null;
        }

        const calculatedTotal = calculateServiceTotal(template.price, '01');
        return {
          id: Date.now().toString() + '-' + index,
          ...template,
          quantity: '01',
          total: calculatedTotal,
        };
      })
      .filter((service): service is Service => service !== null);

    setServices([...services, ...newServices]);

    if (newServices.length > 0) {
      toast.success(newServices.length === 1 ? 'Service added successfully!' : `${newServices.length} services added successfully!`);
    }
  };

  // Convert service templates to format expected by AddServiceLineModal
  const availableServicesForSelection: Service[] = serviceTemplates.map((template, index) => {
    const calculatedTotal = calculateServiceTotal(template.price, '01');
    return {
      id: `template-${index}`,
      ...template,
      quantity: '01',
      total: calculatedTotal,
    };
  });

  const handleDeleteService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
    toast.success('Service deleted successfully!');
  };

  const handleUpdateService = (id: string, updates: { price?: number; quantity?: string }) => {
    setServices(
      services.map(service => {
        if (service.id === id) {
          const newPrice = updates.price !== undefined ? updates.price : service.price;
          const newQuantity = updates.quantity !== undefined ? updates.quantity : service.quantity;
          const newTotal = calculateServiceTotal(newPrice, newQuantity);
          return {
            ...service,
            price: newPrice,
            quantity: newQuantity,
            total: newTotal,
          };
        }
        return service;
      })
    );
  };

  const handleSaveQuote = () => {
    // const customerData = customerDetailsFormRef.current?.getValues();
    // TODO: Implement save quote logic
    toast.success('Quote saved successfully!');
  };

  const handleSendQuote = async () => {
    // Validate that either phone or email is provided
    const isValid = await customerDetailsFormRef.current?.triggerSendQuoteValidation();
    if (!isValid) {
      return;
    }
    // Open send quote modal
    setIsSendQuoteModalOpen(true);
  };

  // Check which contact methods are available
  const getAvailableContactMethods = () => {
    const customerData = customerDetailsFormRef.current?.getValues();
    if (!customerData) {
      return { hasEmail: false, hasPhone: false };
    }

    const hasEmail = Boolean(customerData.email && customerData.email.trim() !== '');
    const hasPhone = Boolean(customerData.phone && customerData.phone.trim() !== '');

    return { hasEmail, hasPhone };
  };

  const handleConfirmSendQuote = (method: 'email' | 'sms') => {
    // TODO: Implement send quote logic based on method
    // const customerData = customerDetailsFormRef.current?.getValues();

    if (method === 'email') {
      toast.success('Quote sent via email successfully!');
    } else if (method === 'sms') {
      toast.success('Quote sent via SMS successfully!');
    }

    if (source === 'saved-quotes') {
      router.push(`${basePath}/quotes/Q-009`);
    } else {
      router.push(`${basePath}/lookup/details/view/quote`);
    }
  };

  // Determine breadcrumb label based on source
  const breadcrumbLabel = source === 'saved-quotes' || source === 'dashboard' ? 'Edit' : 'Add';

  return (
    <div className="space-y-6 md:px-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Vehicle Lookup', href: `${basePath}/lookup` }, { label: 'Details', href: `${basePath}/lookup/details` }, { label: breadcrumbLabel }]} />

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 md:p-8 space-y-8">
        {/* Vehicle Information */}
        <VehicleInfo vin={vin} partName={partName} partNumber={partNumber} OEM={OEM} calibrationType={calibrationType} />

        {/* Services Table */}
        <ServicesTable services={services} onAddService={handleAddService} onEditService={handleEditService} onDeleteService={handleDeleteService} onUpdateService={handleUpdateService} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          {/* Customer Details */}
          <CustomerDetailsForm ref={customerDetailsFormRef} onValidationChange={setCanSendQuote} />

          {/* Quote Summary */}
          <QuoteSummary subtotal={subtotal} tax={tax} total={total} onSaveQuote={handleSaveQuote} onSendQuote={handleSendQuote} isSendQuoteDisabled={!canSendQuote} />
        </div>
        {/* Notes Section */}
        <NotesSection internalNotes={internalNotes} invoiceNotes={invoiceNotes} onInternalNotesChange={setInternalNotes} onInvoiceNotesChange={setInvoiceNotes} />
      </div>

      {/* Add Service Line Modal */}
      <AddServiceLineModal
        open={isAddServiceModalOpen}
        onOpenChange={setIsAddServiceModalOpen}
        onAddServices={handleAddServicesToQuote}
        availableServices={availableServicesForSelection}
        onServiceCreated={handleSaveServiceTemplate}
      />

      {/* Edit Service Line Modal */}
      <ServiceLineModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSave={handleSaveEditedService} editData={editingService} />
      {/* Send Quote Modal */}
      <SendQuoteModal open={isSendQuoteModalOpen} onOpenChange={setIsSendQuoteModalOpen} onSend={handleConfirmSendQuote} {...getAvailableContactMethods()} />
    </div>
  );
}
