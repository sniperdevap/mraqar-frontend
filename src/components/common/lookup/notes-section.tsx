'use client';

import { Textarea } from '@/components/ui/textarea';

interface NotesSectionProps {
  internalNotes: string;
  invoiceNotes: string;
  onInternalNotesChange: (value: string) => void;
  onInvoiceNotesChange: (value: string) => void;
}

export function NotesSection({ internalNotes, invoiceNotes, onInternalNotesChange, onInvoiceNotesChange }: NotesSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Internal Notes */}
      <div className="space-y-2">
        <label className="text-lg font-semibold text-primary">Internal Notes</label>
        <Textarea
          placeholder="Internal notes not showing on invoice."
          value={internalNotes}
          onChange={e => onInternalNotesChange(e.target.value)}
          className="min-h-[140px] border-gray-300 rounded-lg resize-none mt-3 focus:outline-none focus:ring-0 focus:border-gray-300 text-base font-normal ps-6"
        />
      </div>

      {/* Invoice Notes */}
      <div className="space-y-2">
        <label className="text-lg font-semibold text-primary">Notes Showing on Invoice</label>
        <Textarea
          placeholder="Notes"
          value={invoiceNotes}
          onChange={e => onInvoiceNotesChange(e.target.value)}
          className="min-h-[140px] mt-3 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-0 focus:border-gray-300 text-base font-normal ps-6"
        />
      </div>
    </div>
  );
}
