'use client'

import React from 'react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Left: Company Info */}
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-semibold">ERP RRI</span> • Enterprise Resource Planning
            </p>
            <p>PT. Rizqi Ridho Ilahi © {currentYear}</p>
          </div>

          {/* Center: Version */}
          <div className="text-sm text-gray-500">
            Version <span className="font-semibold">2.2.0</span> • Phase 1 MVP
          </div>

          {/* Right: Links */}
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Help
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Support
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
