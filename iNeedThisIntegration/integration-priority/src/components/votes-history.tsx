'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Building2, User, DollarSign, ExternalLink, Trash2, Search, Filter } from 'lucide-react'

interface Vote {
  id: number
  restaurant_name: string
  mrr_potential: number
  integration_name: string
  sales_person: string
  client_type: 'current_client' | 'prospect'
  salesforce_link?: string
  notes?: string
  created_at: string
}

export function VotesHistory() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [filteredVotes, setFilteredVotes] = useState<Vote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [integrationFilter, setIntegrationFilter] = useState('all')
  const [clientTypeFilter, setClientTypeFilter] = useState('all')

  useEffect(() => {
    fetchVotes()
  }, [])

  const fetchVotes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setVotes(data || [])
      setFilteredVotes(data || [])
    } catch (err) {
      console.error('Error fetching votes:', err)
      setError('Erreur lors du chargement de l\'historique des demandes')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter votes based on search criteria
  useEffect(() => {
    let filtered = votes

    // Search term filter (restaurant name, integration, commercial)
    if (searchTerm) {
      filtered = filtered.filter(vote =>
        vote.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.integration_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.sales_person.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Integration filter
    if (integrationFilter && integrationFilter !== 'all') {
      filtered = filtered.filter(vote => vote.integration_name === integrationFilter)
    }

    // Client type filter
    if (clientTypeFilter && clientTypeFilter !== 'all') {
      filtered = filtered.filter(vote => vote.client_type === clientTypeFilter)
    }

    setFilteredVotes(filtered)
  }, [votes, searchTerm, integrationFilter, clientTypeFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setIntegrationFilter('all')
    setClientTypeFilter('all')
  }

  // Get unique integrations for filter dropdown
  const uniqueIntegrations = [...new Set(votes.map(vote => vote.integration_name))].sort()

  const handleDeleteVote = async (voteId: number, restaurantName: string, integrationName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la demande de "${restaurantName}" pour "${integrationName}" ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', voteId)
      
      if (error) throw error
      
      // Remove from local state
      const updatedVotes = votes.filter(vote => vote.id !== voteId)
      setVotes(updatedVotes)
      setFilteredVotes(updatedVotes)
      
      alert('✅ Demande supprimée avec succès!')
      
    } catch (err) {
      console.error('Error deleting vote:', err)
      alert('❌ Erreur lors de la suppression. Vérifiez vos permissions.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMRR = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getClientTypeLabel = (type: string) => {
    return type === 'current_client' ? 'Client Lightspeed' : 'Prospect'
  }

  const getClientTypeColor = (type: string) => {
    return type === 'current_client' 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-green-100 text-green-800 border-green-200'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Chargement de l'historique...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-800">
          <span className="font-semibold">❌ Erreur</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        <button 
          onClick={fetchVotes}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (votes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
        <p className="text-gray-600">Les demandes d'intégrations apparaîtront ici une fois soumises.</p>
      </div>
    )
  }

  if (filteredVotes.length === 0 && (searchTerm || (integrationFilter && integrationFilter !== 'all') || (clientTypeFilter && clientTypeFilter !== 'all'))) {
    return (
      <div className="space-y-4">
        {/* Filters section will be rendered below */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Historique des demandes ({votes.length})
          </h2>
        </div>

        {/* Search and filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">Filtres</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Restaurant, intégration, commercial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="integration-filter">Intégration</Label>
              <Select value={integrationFilter} onValueChange={setIntegrationFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Toutes les intégrations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les intégrations</SelectItem>
                  {uniqueIntegrations.map(integration => (
                    <SelectItem key={integration} value={integration}>
                      {integration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client-type-filter">Type de client</Label>
              <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="current_client">Client Lightspeed</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm || (integrationFilter && integrationFilter !== 'all') || (clientTypeFilter && clientTypeFilter !== 'all')) && (
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Effacer tous les filtres
              </button>
              <span className="text-sm text-gray-500">
                • {filteredVotes.length} résultat(s) trouvé(s)
              </span>
            </div>
          )}
        </div>

        <div className="text-center py-8">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
          <p className="text-gray-600">Essayez d'ajuster vos critères de recherche.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Historique des demandes ({votes.length})
        </h2>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">Filtres</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Rechercher</Label>
            <Input
              id="search"
              placeholder="Restaurant, intégration, commercial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="integration-filter">Intégration</Label>
            <Select value={integrationFilter} onValueChange={setIntegrationFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Toutes les intégrations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les intégrations</SelectItem>
                {uniqueIntegrations.map(integration => (
                  <SelectItem key={integration} value={integration}>
                    {integration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="client-type-filter">Type de client</Label>
            <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="current_client">Client Lightspeed</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(searchTerm || (integrationFilter && integrationFilter !== 'all') || (clientTypeFilter && clientTypeFilter !== 'all')) && (
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Effacer tous les filtres
            </button>
            <span className="text-sm text-gray-500">
              • {filteredVotes.length} résultat(s) sur {votes.length}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intégration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restaurant
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commercial
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MRR
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {votes.map((vote) => (
              <tr key={vote.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(vote.created_at)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {vote.integration_name}
                  </div>
                  {vote.notes && (
                    <div className="text-xs text-gray-500 max-w-xs truncate" title={vote.notes}>
                      {vote.notes}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {vote.restaurant_name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {vote.sales_person}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge className={getClientTypeColor(vote.client_type)} size="sm">
                    {getClientTypeLabel(vote.client_type)}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-bold text-green-600">
                    {formatMRR(vote.mrr_potential)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {vote.client_type === 'current_client' ? 'À risque' : 'Potentiel'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {vote.salesforce_link && (
                      <a 
                        href={vote.salesforce_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="Voir dans Salesforce"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteVote(vote.id, vote.restaurant_name, vote.integration_name)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer cette demande"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}