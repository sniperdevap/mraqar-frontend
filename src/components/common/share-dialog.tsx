'use client';

import { FacebookShareButton, FacebookIcon, WhatsappShareButton, WhatsappIcon, TwitterShareButton, TwitterIcon, EmailShareButton, EmailIcon, LinkedinShareButton, LinkedinIcon } from 'react-share';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareDialog({ isOpen, onClose, url, title }: ShareDialogProps) {
  const t = useTranslations('common.buttons');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{t('share') || 'Share'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-4 py-4 justify-items-center">
          <div className="flex flex-col items-center gap-2">
            <WhatsappShareButton url={url} title={title} onClick={onClose}>
              <WhatsappIcon size={48} round />
            </WhatsappShareButton>
            <span className="text-xs">WhatsApp</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <FacebookShareButton url={url} onClick={onClose}>
              <FacebookIcon size={48} round />
            </FacebookShareButton>
            <span className="text-xs">Facebook</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <TwitterShareButton url={url} title={title} onClick={onClose}>
              <TwitterIcon size={48} round />
            </TwitterShareButton>
            <span className="text-xs">Twitter</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <LinkedinShareButton url={url} title={title} onClick={onClose}>
              <LinkedinIcon size={48} round />
            </LinkedinShareButton>
            <span className="text-xs">LinkedIn</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <EmailShareButton url={url} subject={title} body={url} onClick={onClose}>
              <EmailIcon size={48} round />
            </EmailShareButton>
            <span className="text-xs">Email</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <CopyToClipboard text={url} onCopy={() => toast.success(t('linkCopied') || 'Link Copied')}>
              <button className="w-[48px] h-[48px] bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <Copy className="h-6 w-6 text-gray-700" />
              </button>
            </CopyToClipboard>
            <span className="text-xs">{t('copyLink') || 'Copy Link'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
