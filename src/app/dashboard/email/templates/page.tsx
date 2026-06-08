"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { File, Plus, Pencil, Trash2, Eye } from "lucide-react"

interface Template {
  id: string
  name: string
  htmlBody: string
  description?: string
}

const templateSchema = z.object({
  name: z.string().min(1, "Nama template harus diisi"),
  htmlBody: z.string().min(1, "Body template harus diisi"),
})

type TemplateValues = z.infer<typeof templateSchema>

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Quotation Notification",
    htmlBody: "<h1>Quotation #{{nomor}}</h1><p>Kepada Yth. {{nama_customer}},</p><p>Terlampir quotation terbaru dari kami.</p>",
    description: "Template notifikasi quotation ke customer",
  },
  {
    id: "2",
    name: "Invoice Notification",
    htmlBody: "<h1>Invoice #{{nomor}}</h1><p>Kepada Yth. {{nama_customer}},</p><p>Invoice dengan total {{total}} telah diterbitkan.</p>",
    description: "Template notifikasi invoice ke customer",
  },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const form = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: "", htmlBody: "" },
  })

  const openCreate = () => {
    setEditingTemplate(null)
    form.reset({ name: "", htmlBody: "" })
    setSheetOpen(true)
  }

  const openEdit = (tmpl: Template) => {
    setEditingTemplate(tmpl)
    form.reset({ name: tmpl.name, htmlBody: tmpl.htmlBody })
    setSheetOpen(true)
  }

  const handleSave = (values: TemplateValues) => {
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id ? { ...t, ...values } : t,
        ),
      )
      toast.success("Template diperbarui")
    } else {
      setTemplates((prev) => [
        ...prev,
        { id: String(Date.now()), ...values },
      ])
      toast.success("Template baru ditambahkan")
    }
    setSheetOpen(false)
  }

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    toast.success("Template dihapus")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-heading font-semibold tracking-tight text-foreground">
            Email Templates
          </h2>
          <p className="text-sm text-muted-foreground">
            {templates.length} template tersedia
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
          <File className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            Belum ada template email
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tmpl) => (
            <Card key={tmpl.id} className="shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-border">
              <CardHeader>
                <CardTitle className="text-sm font-heading font-semibold tracking-tight flex items-center gap-2">
                  <File className="h-4 w-4 text-primary" />
                  {tmpl.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {tmpl.description || tmpl.htmlBody.slice(0, 100)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(tmpl)}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(tmpl.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-xl w-full">
          <SheetHeader>
            <SheetTitle className="font-heading font-semibold tracking-tight">
              {editingTemplate ? "Edit Template" : "Buat Template Baru"}
            </SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Template</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Quotation Notification" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="htmlBody"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTML Body</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Tabs defaultValue="edit">
                          <TabsList>
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                          </TabsList>
                          <TabsContent value="edit">
                            <Textarea
                              {...field}
                              placeholder="<h1>{{title}}</h1><p>...</p>"
                              className="min-h-[300px] font-mono text-xs"
                            />
                          </TabsContent>
                          <TabsContent value="preview">
                            <div
                              className="border border-border rounded-lg p-4 min-h-[300px] prose prose-sm max-w-none bg-background"
                              dangerouslySetInnerHTML={{ __html: field.value || "<p class='text-muted-foreground'>Preview kosong</p>" }}
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Button type="submit">
                  {editingTemplate ? "Simpan Perubahan" : "Buat Template"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
