"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TabsContent } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { useState } from "react"
import { ContentType } from "./sidebar-switcher"

const SAMPLE_DATA: Record<ContentType, { id: number; name: string }[]> = {
  chats: [
    { id: 1, name: "Reactのhooksについて" },
    { id: 2, name: "Next.js App Router解説" },
    { id: 3, name: "TypeScriptの型推論" },
    { id: 4, name: "Tailwind CSS tips" },
  ],
  prompts: [
    { id: 1, name: "コードレビュー用プロンプト" },
    { id: 2, name: "要件定義テンプレート" },
  ],
  files: [
    { id: 1, name: "design.pdf" },
    { id: 2, name: "requirements.md" },
  ],
}

const LABELS: Record<ContentType, string> = {
  chats: "チャット",
  prompts: "プロンプト",
  files: "ファイル",
}

interface SidebarProps {
  showSidebar: boolean
}

export function Sidebar({ showSidebar }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const renderContent = (contentType: ContentType) => {
    const filtered = SAMPLE_DATA[contentType].filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <TabsContent value={contentType} className="m-0 h-full">
        <div className="flex h-full flex-col p-3 gap-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-xs h-8"
          >
            <Plus className="size-4" />
            新しいチャット
          </Button>
          <p className="text-xs font-semibold text-gray-500 px-1">
            {LABELS[contentType]}
          </p>
          <Input
            placeholder={`${LABELS[contentType]}を検索...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-xs"
          />
          <ScrollArea className="flex-1">
            <div className="space-y-0.5">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors truncate"
                >
                  {item.name}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  見つかりません
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>
    )
  }

  return (
    <div
      className="overflow-hidden transition-all duration-200 border-r border-gray-200 bg-gray-50"
      style={{
        minWidth: showSidebar ? "220px" : "0px",
        maxWidth: showSidebar ? "220px" : "0px",
        width: showSidebar ? "220px" : "0px",
      }}
    >
      {showSidebar && (
        <div className="h-full">
          {renderContent("chats")}
          {renderContent("prompts")}
          {renderContent("files")}
        </div>
      )}
    </div>
  )
}
