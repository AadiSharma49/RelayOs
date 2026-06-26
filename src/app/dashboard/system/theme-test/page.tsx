import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/lib/icons"

export const metadata: Metadata = {
  title: "Theme Test",
  description: "QA page for theme consistency",
}

export default function ThemeTestPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-page-title">Theme Test</h1>
        <p className="text-caption mt-1">
          Verify all components render correctly in both light and dark modes.
        </p>
      </div>

      {/* Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Cards &amp; Surfaces</CardTitle>
          <CardDescription>Background, card, popover, muted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm font-medium">Background</p>
              <p className="text-caption">bg-background surface</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm font-medium">Card</p>
              <p className="text-caption">bg-card surface</p>
            </div>
            <div className="rounded-xl border bg-muted p-4">
              <p className="text-sm font-medium text-foreground">Muted</p>
              <p className="text-caption">bg-muted surface</p>
            </div>
            <div className="rounded-xl border bg-popover p-4">
              <p className="text-sm font-medium">Popover</p>
              <p className="text-caption">bg-popover surface</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>All button variants</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status badges</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
          <CardDescription>Inputs, textareas, selects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Input</label>
            <Input placeholder="Enter text..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Textarea</label>
            <Textarea placeholder="Enter longer text..." rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Dialogs & Dropdowns */}
      <Card>
        <CardHeader>
          <CardTitle>Overlays</CardTitle>
          <CardDescription>Dialog and dropdown</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  Verify this dialog is readable in both themes.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-body">Dialog body content.</p>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open Dropdown</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Item 1</DropdownMenuItem>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Font scale and spacing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-section-title">Section Title</p>
          <p className="text-card-title">Card Title</p>
          <p className="text-body">
            Body text — all components should use semantic text tokens.
          </p>
          <p className="text-caption">Caption — secondary information</p>
        </CardContent>
      </Card>
    </div>
  )
}
