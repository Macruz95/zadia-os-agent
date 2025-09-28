"use client"

import * as React from "react"
import { cva, VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sidebarMenuSubVariants = cva("", {
  variants: {
    size: {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export function SidebarMenuSub({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export function SidebarMenuSubItem({
  ...props
}: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-sub-item" {...props} />
}

export function SidebarMenuSubButton({
  asChild = false,
  size = "default",
  isActive,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: VariantProps<typeof sidebarMenuSubVariants>["size"]
  isActive?: boolean
}) {
  const Comp = asChild ? "a" : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        sidebarMenuSubVariants({ size }),
        className
      )}
      {...props}
    />
  )
}

