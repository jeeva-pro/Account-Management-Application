import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HiExclamationTriangle } from 'react-icons/hi2';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <HiExclamationTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <Dialog.Title className="text-lg font-semibold text-slate-900">
                      {title}
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-slate-600">
                      {message}
                    </Dialog.Description>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    variant={variant}
                    onClick={onConfirm}
                    loading={loading}
                  >
                    {confirmLabel}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
