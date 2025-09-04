"use client"

import React, { useState, useMemo } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Github, Linkedin, Code2, Sparkles, Briefcase, ExternalLink, Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Import projects data from JSON file
import projectsData from "./projects.json"

// Define additional project details for UI display
const projectsWithDetails = projectsData.projects.map((project, index) => {
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
    "from-orange-500 to-amber-500",
    "from-rose-500 to-pink-500",
    "from-indigo-500 to-blue-500",
  ]

  return {
    ...project,
    gradient: gradients[index % gradients.length],
  }
})

const allTags = [...new Set(projectsWithDetails.flatMap((p) => p.tags))].sort()

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const filteredProjects = useMemo(() => {
    return projectsWithDetails.filter((project) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        project.project_name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchLower))

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => project.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [searchTerm, selectedTags])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      <Header />

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:linear-gradient(to_right,rgba(99,102,241,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.8)_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.8)_1px,transparent_1px)]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div>
              <div className="flex flex-col items-center justify-center gap-4">
                <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 group-hover:opacity-100" />
                  </span>
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                    <span>Projects Showcase</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 group-hover:opacity-40" />
                </button>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Intern <span className="gradient-text">Projects</span> Showcase
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore outstanding projects created by our talented interns during their internship at Codeunia.
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container relative z-10 mx-auto px-4">
          {/* Search and Filter Controls */}
          <div className="mb-12 flex justify-center items-center gap-4 max-w-4xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-12 pr-4 py-3 text-lg bg-background/70 backdrop-blur-sm rounded-full focus:ring-2 focus:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 rounded-full text-lg py-3 bg-background/70 backdrop-blur-sm">
                  <span>Tags</span>
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="rounded-full">{selectedTags.length}</Badge>
                  )}
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {filteredProjects.map((project, index) => (
              <div key={project.project_name} className="group" style={{ animationDelay: `${index * 100}ms` }}>
                <Card className="relative h-full overflow-hidden border-0 bg-background/60 backdrop-blur-sm shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-5",
                      `bg-gradient-to-br ${project.gradient}`,
                    )}
                  />

                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <CardHeader className="relative z-10 space-y-4 pb-4">
                    <div
                      className={cn(
                        "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110",
                        `bg-gradient-to-br ${project.gradient}`,
                      )}
                    >
                      <Code2 className="h-8 w-8 text-white drop-shadow-sm" />
                    </div>

                    <div className="space-y-2 text-center">
                      <CardTitle className="text-xl font-bold transition-colors duration-300 group-hover:text-primary">
                        {project.project_name}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 flex flex-1 flex-col justify-between space-y-6">
                    <div className="flex flex-wrap justify-center gap-2">
                      {project.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs font-medium bg-muted/50 hover:bg-muted transition-colors duration-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span className="font-medium">Created by {project.intern_name}</span>
                      </div>

                      <div className="flex justify-center gap-3">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary bg-transparent"
                        >
                          <Link
                            href={project.github_repository_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Github className="h-4 w-4" />
                            <span>Code</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>

                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary bg-transparent"
                        >
                          <Link
                            href={project.intern_linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Linkedin className="h-4 w-4" />
                            <span>Profile</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}