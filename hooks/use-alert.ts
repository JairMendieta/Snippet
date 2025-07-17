"use client"

import { create } from "zustand"

interface AlertState {
  isOpen: boolean
  title: string
  description: string
  confirmText: string
  cancelText: string
  variant: "default" | "destructive"
  onConfirm: () => void
  onCancel: () => void
}

interface AlertStore extends AlertState {
  showAlert: (config: Partial<AlertState>) => void
  hideAlert: () => void
}

export const useAlert = create<AlertStore>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  confirmText: "Confirmar",
  cancelText: "Cancelar",
  variant: "default",
  onConfirm: () => {},
  onCancel: () => {},

  showAlert: (config) =>
    set((state) => ({
      ...state,
      ...config,
      isOpen: true,
    })),

  hideAlert: () =>
    set((state) => ({
      ...state,
      isOpen: false,
    })),
}))
