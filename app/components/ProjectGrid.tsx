'use client'

import { useState, useMemo, useEffect } from 'react'
import { ProjectCard } from './ProjectCard'
import { AISearchBar } from './AISearchBar'
import { Slider } from '@/components/ui/slider'
import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import projectsData from '../data/projects.json'
import { AndOrToggle } from './AndOrToggle'

interface ProjectGridProps {
  globalSearchQuery: string
  setGlobalSearchQuery: (query: string) => void
}

export function ProjectGrid({ globalSearchQuery, setGlobalSearchQuery }: ProjectGridProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedBlockchains, setSelectedBlockchains] = useState<string[]>([])
  const [tvlRange, setTvlRange] = useState<[number, number]>([0, 100])
  const [aiSearchResult, setAiSearchResult] = useState<{ description: string, itemName: string } | null>(null)
  const [isAndLogic, setIsAndLogic] = useState(true)

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    projectsData.forEach(item => item.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet)
  }, [])

  const allBlockchains = useMemo(() => {
    const blockchainSet = new Set<string>()
    projectsData.forEach(item => {
      if (item.blockchain) blockchainSet.add(item.blockchain)
    })
    return Array.from(blockchainSet)
  }, [])

  const tvlValues = useMemo(() => {
    return projectsData.map(item => {
      if (item.tvl) {
        return parseFloat(item.tvl.replace('$', '').replace('M', ''))
      }
      return 0
    }).filter(value => value > 0)
  }, [])

  const minTVL = Math.min(...tvlValues)
  const maxTVL = Math.max(...tvlValues)

  const filteredProjects = projectsData.filter(item =>
    (item.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
     item.description.toLowerCase().includes(globalSearchQuery.toLowerCase())) &&
    (selectedTags.length === 0 || (isAndLogic
      ? selectedTags.every(tag => item.tags.includes(tag))
      : selectedTags.some(tag => item.tags.includes(tag)))) &&
    (selectedBlockchains.length === 0 || (isAndLogic
      ? selectedBlockchains.every(blockchain => item.blockchain === blockchain)
      : selectedBlockchains.some(blockchain => item.blockchain === blockchain))) &&
    (!item.tvl || (parseFloat(item.tvl.replace('$', '').replace('M', '')) >= tvlRange[0] &&
                   parseFloat(item.tvl.replace('$', '').replace('M', '')) <= tvlRange[1]))
  )

  const handleAISearchResult = (description: string, itemName: string) => {
    setAiSearchResult({ description, itemName })
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleBlockchainSelect = (blockchain: string) => {
    setSelectedBlockchains(prev => 
      prev.includes(blockchain) ? prev.filter(b => b !== blockchain) : [...prev, blockchain]
    )
  }

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  const removeBlockchain = (blockchain: string) => {
    setSelectedBlockchains(prev => prev.filter(b => b !== blockchain))
  }

  return (
    <div>
      <AISearchBar onSearchResult={handleAISearchResult} />
      {aiSearchResult && (
        <div className="mb-4 p-4 bg-[#2A2D3A]">
          <h3 className="text-lg font-semibold mb-2">AI Search Result:</h3>
          <p className="mb-4">{aiSearchResult.description}</p>
          {projectsData.find(item => item.name === aiSearchResult.itemName) && (
            <ProjectCard project={projectsData.find(item => item.name === aiSearchResult.itemName)!} />
          )}
        </div>
      )}
      <div className="mb-4 space-y-4">
        <input
          type="text"
          placeholder="Filter by name or description..."
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          className="w-full bg-[#2A2D3A] text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Tags</label>
              <AndOrToggle isAnd={isAndLogic} onToggle={setIsAndLogic} />
            </div>
            <Select onValueChange={handleTagSelect}>
              <SelectTrigger className="w-full bg-[#1FD978] text-primary">
                <SelectValue placeholder="Select tags" />
              </SelectTrigger>
              <SelectContent>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <span key={tag} className="bg-[#1FD978] text-primary text-xs px-2 py-1 flex items-center">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 focus:outline-none">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Blockchains</label>
            <Select onValueChange={handleBlockchainSelect}>
              <SelectTrigger className="w-full bg-[#1FD978] text-primary">
                <SelectValue placeholder="Select blockchains" />
              </SelectTrigger>
              <SelectContent>
                {allBlockchains.map((blockchain) => (
                  <SelectItem key={blockchain} value={blockchain}>
                    {blockchain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedBlockchains.map((blockchain) => (
                <span key={blockchain} className="bg-[#1FD978] text-primary text-xs px-2 py-1 flex items-center">
                  {blockchain}
                  <button onClick={() => removeBlockchain(blockchain)} className="ml-1 focus:outline-none">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        {tvlValues.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">TVL Range (in millions)</label>
            <Slider
              min={minTVL}
              max={maxTVL}
              step={0.1}
              value={tvlValues.length === 1 ? [minTVL, minTVL] : tvlRange}
              onValueChange={setTvlRange}
              disabled={tvlValues.length === 1}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span>${tvlRange[0].toFixed(1)}M</span>
              <span>${tvlRange[1].toFixed(1)}M</span>
            </div>
          </div>
        )}
      </div>
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((item, index) => (
            <ProjectCard key={index} project={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold mb-2">No projects found</h3>
          <p className="text-gray-400">
            Try adjusting your filters or search terms to find more results.
          </p>
          <a
            href="https://github.com/PotLock/awesome-pump"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-2 bg-[#1FD978] text-primary hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Submit a Project
          </a>
        </div>
      )}
    </div>
  )
}
