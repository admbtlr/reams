import React, { ReactNode, createContext, useCallback, useState } from 'react'
import RizzleModal from './RizzleModal'

interface ModalProviderProps {
  closeModal: () => void
  openModal: (modalProps: RizzleModal.ModalProps) => void
  isVisible: boolean
  modalProps: RizzleModal.ModalProps | null
}

const initialProps: ModalProviderProps = {
  closeModal: () => {},
  openModal: () => {},
  isVisible: false,
  modalProps: null
}

const ModalContext = createContext<ModalProviderProps>(initialProps)

const ModalProvider = ({ children }: { children: ReactNode[] }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [modalProps, setModalProps] = useState<RizzleModal.ModalProps | null>(null)
  const [hiddenModals, setHiddenModals] = useState<string[]>([])

  const openModal = (modalProps: RizzleModal.ModalProps) => {
    setModalProps(modalProps)
    setIsVisible(true)
  }

  const closeModal = () => {
    setIsVisible(false)
  }

  const value = {
    closeModal,
    openModal,
    isVisible,
    modalProps
  }

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

const useModal = () => {
  const context = React.useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export { ModalProvider, ModalContext, useModal }