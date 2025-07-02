"use client"

import { useState } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook, 
  MessageCircle, 
  Send, 
  Copy, 
  Mail,
  Check
} from "lucide-react"

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  hashtags?: string[]
}

export function ShareButton({ url, title, description = "", hashtags = [] }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async (platform: string) => {
    setIsSharing(true)
    
    try {
      const hashtagString = hashtags.length > 0 ? hashtags.map(tag => `#${tag}`).join(' ') : ''
      const shareText = `${title}${description ? ` - ${description}` : ''} ${hashtagString}`.trim()
      
      let shareUrl = ''
      
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
          break
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
          break
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
          break
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`
          break
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
          break
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nRead more: ${url}`)}`
          break
        default:
          return
      }
      
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
    } catch (error) {
      console.error('Failed to share:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => handleShare('twitter'),
      color: 'hover:text-blue-500'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => handleShare('linkedin'),
      color: 'hover:text-blue-600'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => handleShare('facebook'),
      color: 'hover:text-blue-700'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => handleShare('whatsapp'),
      color: 'hover:text-green-500'
    },
    {
      name: 'Telegram',
      icon: Send,
      action: () => handleShare('telegram'),
      color: 'hover:text-blue-400'
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => handleShare('email'),
      color: 'hover:text-gray-600'
    }
  ]

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-primary/10 transition-colors"
              disabled={isSharing}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>
          Share this post
        </TooltipContent>
      </Tooltip>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          onClick={handleCopyLink}
          className="cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-green-500">Link copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </>
          )}
        </DropdownMenuItem>
        
        {shareOptions.map((option) => {
          const IconComponent = option.icon
          return (
            <DropdownMenuItem 
              key={option.name}
              onClick={option.action}
              className={`cursor-pointer ${option.color}`}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              Share on {option.name}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 