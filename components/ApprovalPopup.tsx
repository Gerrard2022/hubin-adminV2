import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

  interface ApprovalPopupProps {
    Description: string;
    Title: string;
    Trigger?: React.ReactNode;
    OnConfirm: () => void;
    OnCancel: () => void;
    isOpen?: boolean
    disabled?: boolean
  }
  export const ApprovalPopup = ({
    Description,
    Title,
    Trigger,
    OnConfirm,
    OnCancel,
    isOpen,
    disabled
  }: ApprovalPopupProps) => {
    return (
      <AlertDialog open={isOpen}>
        <AlertDialogTrigger asChild>
          {Trigger}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{Title}</AlertDialogTitle>
            <AlertDialogDescription>
              {Description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={OnCancel} disabled={disabled}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={OnConfirm} disabled={disabled}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };