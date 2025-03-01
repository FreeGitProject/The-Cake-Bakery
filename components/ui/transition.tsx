"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface TransitionProps {
  show: boolean
  enter?: string
  enterFrom?: string
  enterTo?: string
  leave?: string
  leaveFrom?: string
  leaveTo?: string
  children: React.ReactNode
}

export const Transition: React.FC<TransitionProps> = ({
  show,
  enter = "transition ease-out duration-100",
  enterFrom = "opacity-0",
  enterTo = "opacity-100",
  leave = "transition ease-in duration-75",
  leaveFrom = "opacity-100",
  leaveTo = "opacity-0",
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (show) {
      ref.current?.classList.add(enterTo)
    } else {
      ref.current?.classList.remove(enterTo)
      ref.current?.classList.add(leaveTo)
    }
  }, [show])

  return (
    <div
      ref={ref}
      className={`${enter} ${enterFrom} ${leave} ${leaveFrom}`}
      style={{ display: show ? "block" : "none" }}
    >
      {children}
    </div>
  )
}

