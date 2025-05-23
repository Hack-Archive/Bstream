"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Copy, InfoIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { env } from "@/lib/env"

// Function to convert Tenor URL to direct media URL if possible
const processTenorUrl = (url: string): string => {
  if (!url.includes('tenor.com')) return url;
  
  // Try to extract the GIF ID from various Tenor URL formats
  const tenorIdMatch = url.match(/\/(\d+)\/?(?:\?|$)/);
  if (tenorIdMatch && tenorIdMatch[1]) {
    // If we can get the ID, construct a direct media URL
    return `https://media.tenor.com/images/${tenorIdMatch[1]}/tenor.gif`;
  }
  
  // If we can't parse it, return the original URL
  return url;
};

export default function AlertsPage() {
  const [background, setBackground] = useState("#1e1b8b")
  const [color, setColor] = useState("#ffffff")
  const [gifUrl, setGifUrl] = useState("")
  const [playSound, setPlaySound] = useState(true)
  const [isValidGif, setIsValidGif] = useState(false)
  const [processedGifUrl, setProcessedGifUrl] = useState("")
  
  // Browser source link with dynamic URL from environment
  const baseUrl = new URL(env.NEXT_PUBLIC_BASE_URL).host
  const browserSourceLink = `${baseUrl}/donations/events/${Math.random().toString(36).substring(2, 15)}`
  
  // Process and validate the GIF URL
  useEffect(() => {
    if (!gifUrl) {
      setIsValidGif(false)
      setProcessedGifUrl("");
      return
    }
    
    // Check if it's a direct image URL
    const isDirectImageUrl = /\.(gif|jpe?g|png)($|\?)/i.test(gifUrl);
    
    // Check if it's from tenor or giphy (needs special handling)
    const isTenorUrl = gifUrl.includes('tenor.com');
    const isGiphyUrl = gifUrl.includes('giphy.com');
    
    // For most URLs, validate simply
    const isValidImageUrl = isDirectImageUrl || isTenorUrl || isGiphyUrl;
    
    // Process the URL if needed
    let processed = gifUrl;
    if (isTenorUrl) {
      processed = processTenorUrl(gifUrl);
    }
    setProcessedGifUrl(processed);
    
    console.log("GIF validation:", { 
      originalUrl: gifUrl,
      processedUrl: processed,
      isDirectImageUrl,
      isTenorUrl, 
      isGiphyUrl,
      isValid: isValidImageUrl 
    });
    
    setIsValidGif(isValidImageUrl);
  }, [gifUrl]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(browserSourceLink)
    toast.success("Copied to clipboard")
  }

  const handleSave = () => {
    // Save alert settings to backend/localStorage
    toast.success("Alert settings saved")
  }
  
  const playPreview = () => {
    // Play preview animation/sound
    toast.info("Playing alert preview")
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 relative">
      <h1 className="text-2xl font-bold mb-2">Alerts</h1>
      <p className="text-gray-600 mb-6">Customize your alerts and change alert settings.</p>
      
      {/* Alerts Browser Source Link */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100/50 shadow-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-gray-800 text-base font-medium">Alerts Browser Source Link</h2>
          <InfoIcon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-gray-50 text-gray-800 rounded-md px-3 py-2 flex-1 truncate border border-gray-200">
            {browserSourceLink}
          </div>
          <Button size="icon" variant="ghost" className="ml-1 h-8 w-8" onClick={copyToClipboard} aria-label="Copy link">
            <Copy className="h-4 w-4 text-blue-500" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Alert Settings */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100/50 shadow-lg">
          <h2 className="text-gray-800 text-base font-medium mb-4">Alert Settings</h2>
          
          <div className="space-y-4">
            {/* Play Sound */}
            <div className="flex justify-between items-center">
              <label className="text-gray-700 text-sm">Play Sound</label>
              <Switch 
                checked={playSound} 
                onCheckedChange={setPlaySound} 
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
            
            {/* Background */}
            <div>
              <label className="text-gray-700 text-sm block mb-1">Background</label>
              <div className="flex gap-3 items-center">
                <Input 
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="flex-1 bg-gray-50 border-gray-200 text-gray-700 h-9 text-sm"
                />
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-9 h-9 p-1 rounded border border-gray-200 cursor-pointer"
                />
              </div>
            </div>
            
            {/* Color */}
            <div>
              <label className="text-gray-700 text-sm block mb-1">Text Color</label>
              <div className="flex gap-3 items-center">
                <Input 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 bg-gray-50 border-gray-200 text-gray-700 h-9 text-sm"
                />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 p-1 rounded border border-gray-200 cursor-pointer"
                />
              </div>
            </div>
            
            {/* GIF */}
            <div>
              <label className="text-gray-700 text-sm block mb-1">GIF URL</label>
              <Input 
                placeholder="https://example.com/gif.gif"
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-700 h-9 text-sm"
              />
            </div>
            
            <Button className="w-full bg-blue-500 hover:bg-blue-600 h-9 mt-2" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
        
        {/* Alert Preview */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100/50 shadow-lg">
          <div className="mb-4">
            <h2 className="text-gray-800 text-base font-medium">Alert Preview</h2>
          </div>
          
          <div className="flex items-center justify-center h-[280px] rounded-lg bg-gray-50 border border-gray-200">
            <div 
              className="p-6 rounded-lg text-center max-w-xs w-full"
              style={{ backgroundColor: background }}
            >
              {/* GIF display area */}
              {isValidGif && gifUrl && (
                <div className="mb-3 flex justify-center">
                  {gifUrl.includes('tenor.com') && !processedGifUrl.endsWith('.gif') ? (
                    // For Tenor GIFs that couldn't be converted to direct URLs, use an iframe
                    <iframe 
                      src={`${gifUrl.includes('?') ? gifUrl + '&' : gifUrl + '?'}embedded=true`}
                      width="100%" 
                      height="120px" 
                      frameBorder="0" 
                      className="rounded"
                      allowFullScreen
                      onError={() => console.error("Failed to load Tenor iframe")}
                    ></iframe>
                  ) : (
                    // For direct GIF URLs or processed Tenor URLs
                    <img 
                      src={processedGifUrl || gifUrl} 
                      alt="Alert animation" 
                      className="max-w-full max-h-[120px] rounded"
                      onError={(e) => {
                        console.error("Failed to load GIF image:", e);
                        // If processed URL fails, try the original as fallback
                        if (processedGifUrl && processedGifUrl !== gifUrl) {
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.src = gifUrl;
                        } else {
                          setIsValidGif(false);
                        }
                      }}
                    />
                  )}
                </div>
              )}
              
              <p className="text-xl font-bold" style={{ color }}>
                "Excellent Stream"
              </p>
              <div className="mt-2 text-sm" style={{ color }}>
                YourViewer tipped <span className="font-semibold">0.5 ETH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 