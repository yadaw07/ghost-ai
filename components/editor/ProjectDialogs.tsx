"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash, Pencil } from "lucide-react"
import { useProjectDialogs } from "@/hooks/useProjectDialogs"
import { useEffect, useState } from "react"

/**
 * Renders the create / rename / delete project dialogs. This component is placed at the
 * top‑level of the editor page so the dialogs sit above the sidebar and main content.
 */
export function ProjectDialogs({
  openDialog,
  selectedProject,
  loading,
  closeDialog,
  createProject,
  renameProject,
  deleteProject,
}: ReturnType<typeof useProjectDialogs>) {
  // Local state for the name field within create / rename dialogs.
  const [name, setName] = useState("")

  // Sync name when opening rename dialog.
  useEffect(() => {
    if (openDialog === "rename" && selectedProject) {
      setName(selectedProject.name)
    } else if (openDialog === "create") {
      setName("")
    }
  }, [openDialog, selectedProject])

  const slug = name.trim().toLowerCase().replace(/\s+/g, "-")

  return (
    <>
      {/* Create Project Dialog */}
      <Dialog open={openDialog === "create"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="create-project-name">
              Project name
            </label>
            <Input
              id="create-project-name"
              placeholder="My project"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {name && (
              <p className="text-sm text-muted-foreground">
                Slug: <span className="font-medium">{slug}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="default"
              disabled={loading || !name.trim()}
              onClick={() => createProject(name)}
            >
              Create
            </Button>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={openDialog === "rename"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            {selectedProject && (
              <DialogDescription>
                Current name: <span className="font-medium">{selectedProject.name}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="rename-project-name">
              New name
            </label>
            <Input
              id="rename-project-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  e.preventDefault()
                  renameProject(name)
                }
              }}
            />
            {name && (
              <p className="text-sm text-muted-foreground">
                Slug: <span className="font-medium">{slug}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="default"
              disabled={loading || !name.trim()}
              onClick={() => renameProject(name)}
            >
              Rename
            </Button>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={openDialog === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <DialogDescription>
              Are you sure you want to permanently delete the project{' '}
              <span className="font-medium">{selectedProject.name}</span>? This action cannot be undone.
            </DialogDescription>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => deleteProject()}
            >
              Delete
            </Button>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
