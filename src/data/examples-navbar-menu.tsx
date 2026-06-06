import * as React from "react"
import {
  NavbarMenu,
  MenuItem,
  ProductItem,
  HoveredLink,
} from "@/components/ui/navbar-menu"

const NavbarMenuDemo: React.FC = () => {
  const [active, setActive] = React.useState<string | null>(null)

  return (
    <div className="relative w-full flex items-center justify-center">
      <NavbarMenu setActive={setActive}>
        <MenuItem item="Products" active={active} setActive={setActive}>
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/web-dev">Web Development</HoveredLink>
            <HoveredLink href="/interface-design">Interface Design</HoveredLink>
            <HoveredLink href="/seo">Search Engine Optimization</HoveredLink>
            <HoveredLink href="/branding">Branding</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem item="Pricing" active={active} setActive={setActive}>
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/hobby">Hobby</HoveredLink>
            <HoveredLink href="/individual">Individual</HoveredLink>
            <HoveredLink href="/team">Team</HoveredLink>
            <HoveredLink href="/enterprise">Enterprise</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem item="Blog" active={active} setActive={setActive}>
          <div className="text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Algochurn"
              description="Prepare for tech interviews like never before."
              href="https://algochurn.com"
              src="https://picsum.photos/seed/algochurn/140/70"
            />
            <ProductItem
              title="Tailwind Master Kit"
              description="Production ready Tailwind css components for your next project."
              href="https://tailwindmasterkit.com"
              src="https://picsum.photos/seed/tailwindkit/140/70"
            />
            <ProductItem
              title="Moonbeam"
              description="Never write from scratch again. Go from idea to blog in minutes."
              href="https://moonbeam.io"
              src="https://picsum.photos/seed/moonbeam/140/70"
            />
            <ProductItem
              title="Rogue"
              description="Respond to government RFPs, RFIs and RFQs 10x faster using AI."
              href="https://userogue.com"
              src="https://picsum.photos/seed/rogue/140/70"
            />
          </div>
        </MenuItem>
      </NavbarMenu>
    </div>
  )
}

const NavbarMenuBasicDemo: React.FC = () => {
  const [active, setActive] = React.useState<string | null>(null)

  return (
    <div className="relative w-full flex items-center justify-center">
      <NavbarMenu setActive={setActive}>
        <MenuItem item="Features" active={active} setActive={setActive}>
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/analytics">Analytics</HoveredLink>
            <HoveredLink href="/automation">Automation</HoveredLink>
            <HoveredLink href="/integrations">Integrations</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem item="Company" active={active} setActive={setActive}>
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/about">About</HoveredLink>
            <HoveredLink href="/careers">Careers</HoveredLink>
            <HoveredLink href="/contact">Contact</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem item="Support" active={active} setActive={setActive}>
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/docs">Documentation</HoveredLink>
            <HoveredLink href="/help">Help Center</HoveredLink>
            <HoveredLink href="/status">Status</HoveredLink>
          </div>
        </MenuItem>
      </NavbarMenu>
    </div>
  )
}

import type { Example } from "@/data/examples"

export const examplesNavbarMenu: Record<string, Example[]> = {
  "navbar-menu": [
    {
      title: "Navbar com submenu dropdown",
      description:
        "Navbar pill com menu hover-dropdown fullscreen-blur. Hover nos itens abre card dropdown com ProductItem (imagem + título + descrição) e HoveredLink (links simples).",
      code: `<NavbarMenu setActive={setActive}>
  <MenuItem item="Products" active={active} setActive={setActive}>
    <div className="flex flex-col space-y-4 text-sm">
      <HoveredLink href="/web-dev">Web Development</HoveredLink>
      <HoveredLink href="/interface-design">Interface Design</HoveredLink>
    </div>
  </MenuItem>
  <MenuItem item="Blog" active={active} setActive={setActive}>
    <div className="text-sm grid grid-cols-2 gap-10 p-4">
      <ProductItem
        title="Algochurn"
        description="Prepare for tech interviews."
        href="https://algochurn.com"
        src="https://picsum.photos/seed/algochurn/140/70"
      />
    </div>
  </MenuItem>
</NavbarMenu>`,
      render: (
        <div className="w-full">
          <NavbarMenuDemo />
        </div>
      ),
    },
    {
      title: "Navbar básico com links",
      description:
        "Navbar pill simples com 3 itens e dropdowns de links úteis usando HoveredLink.",
      code: `<NavbarMenu setActive={setActive}>
  <MenuItem item="Features" active={active} setActive={setActive}>
    <div className="flex flex-col space-y-4 text-sm">
      <HoveredLink href="/analytics">Analytics</HoveredLink>
      <HoveredLink href="/automation">Automation</HoveredLink>
    </div>
  </MenuItem>
  <MenuItem item="Company" active={active} setActive={setActive}>
    <div className="flex flex-col space-y-4 text-sm">
      <HoveredLink href="/about">About</HoveredLink>
      <HoveredLink href="/careers">Careers</HoveredLink>
    </div>
  </MenuItem>
</NavbarMenu>`,
      render: (
        <div className="w-full">
          <NavbarMenuBasicDemo />
        </div>
      ),
    },
  ],
}
