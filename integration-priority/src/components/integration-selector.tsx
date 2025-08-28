'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'

const INTEGRATIONS = [
  {
    name: 'Overfull',
    description: 'Logiciel de réservation pour restaurants',
    category: 'Réservation',
    logo: '/logos/overfull.png',
    website: 'https://www.overfull.fr/',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    name: 'Zucchetti PMS',
    description: 'Système Lean PMS',
    category: 'Hôtellerie', 
    logo: '/logos/zucchetti.png',
    website: 'https://www.zucchetti.fr/produits/lean-pms',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    name: 'Cegid',
    description: 'ERP et comptabilité',
    category: 'Comptabilité',
    logo: '/logos/cegid.png',
    website: 'https://www.cegid.com/fr/',
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    name: 'Komia',
    description: 'Solution d\'hygiène alimentaire',
    category: 'Hygiène',
    logo: '/logos/komia.png',
    website: 'https://www.komia.io/',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
  },
  {
    name: 'Deliveroo',
    description: 'Service de livraison',
    category: 'Livraison',
    logo: '/logos/deliveroo.png',
    website: 'https://deliveroo.fr/',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  },
  {
    name: 'Delicity',
    description: 'Plateforme de livraison',
    category: 'Livraison',
    logo: '/logos/delicity.png',
    website: 'https://delicity.com/',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  },
  {
    name: 'Sage',
    description: 'Logiciel comptable',
    category: 'Comptabilité',
    logo: '/logos/sage.png',
    website: 'https://www.sage.com/fr-fr/',
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    name: 'Chift API',
    description: 'Solution de planification RH',
    category: 'Third Party Integrator',
    logo: '/logos/chift.png',
    website: 'https://www.chift.eu/',
    color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
  }
]

interface IntegrationSelectorProps {
  selectedIntegration: string
  onSelect: (integration: string) => void
}

export function IntegrationSelector({ 
  selectedIntegration, 
  onSelect
}: IntegrationSelectorProps) {
  const [filter, setFilter] = useState('')

  const filteredIntegrations = INTEGRATIONS.filter(integration =>
    integration.name.toLowerCase().includes(filter.toLowerCase()) ||
    integration.description.toLowerCase().includes(filter.toLowerCase()) ||
    integration.category.toLowerCase().includes(filter.toLowerCase())
  )

  const categories = [...new Set(INTEGRATIONS.map(i => i.category))]

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="integration-search">Intégration demandée *</Label>
        <Input
          id="integration-search"
          placeholder="Rechercher une intégration..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-1"
        />
      </div>

      {categories.map(category => {
        const categoryIntegrations = filteredIntegrations.filter(i => i.category === category)
        if (categoryIntegrations.length === 0) return null

        return (
          <div key={category} className="space-y-2">
            <h4 className="font-bold text-gray-900 text-base uppercase tracking-wide">
              {category}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryIntegrations.map((integration) => (
                <Card
                  key={integration.name}
                  className={`cursor-pointer transition-all duration-200 hover:border-gray-300 aspect-square ${
                    selectedIntegration === integration.name 
                      ? 'ring-2 ring-gray-400 border-gray-400' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => {
                    onSelect(integration.name)
                  }}
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    <div className="flex flex-col items-center space-y-3 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                          <Image
                            src={integration.logo}
                            alt={`${integration.name} logo`}
                            width={32}
                            height={32}
                            className="object-contain"
                            onError={(e) => {
                              // Fallback to first letter if logo doesn't exist
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              if (target.parentElement) {
                                target.parentElement.innerHTML = `<div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-lg">${integration.name[0]}</div>`
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-center flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2">
                            {integration.name}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {integration.description}
                          </p>
                        </div>
                        <div className="mt-3">
                          <a
                            href={integration.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Site web</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {/* Message pour demandes d'intégrations manquantes */}
      <div className="border-t pt-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Intégration manquante ?
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Si l'intégration que vous cherchez n'est pas dans la liste, contactez-moi pour que je l'ajoute. Cela m'aide à éviter les doublons et à maintenir une liste propre.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}